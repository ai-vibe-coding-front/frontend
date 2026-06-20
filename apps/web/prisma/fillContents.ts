import { prisma } from './scriptClient';
import { Prisma } from '@prisma/client';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.1-flash-lite';

interface GeminiResult {
  description: string;
  tags: {
    location: '실내' | '실외' | '실내외';
    mood: string[];
    energy: '고에너지' | '중간에너지' | '저에너지';
    companion: string[];
    ageGroup: string[];
  };
}

function buildPrompt(title: string, realmName?: string | null, place?: string | null, price?: string | null): string {
  return `당신은 글로벌 기업 10년차 문화 행사 소개 전문 카피라이터입니다.
아래 행사 정보를 바탕으로 반드시 아래 순서대로 처리한 뒤 JSON만 반환하세요. JSON 외 어떤 텍스트도 포함하지 마세요.
절대 혼자 추론하지 말고, 행사명과 분야에서 확인할 수 있는 명확한 근거를 바탕으로만 설명을 생성하세요. 근거가 불분명한 내용은 작성하지 마세요.

[행사 정보]
- 행사명: ${title}
- 분야: ${realmName ?? '정보 없음'}
- 장소: ${place ?? '정보 없음'}
- 관람료: ${price ?? '무료'}

[처리 순서 - 반드시 이 순서로]
STEP 1. 행사명과 분야를 보고 이 행사/작품이 무엇인지 파악한다.
STEP 2. 파악한 내용을 바탕으로 description을 3문장으로 작성한다.
STEP 3. 장소명을 우선 참고하여 location 태그를 결정하고, description을 읽고 나머지 tags를 추출한다.

[description 작성 규칙]
- 총 3문장, 홍보성 톤
- 1문장: 이 행사/작품이 무엇인지 핵심 소개
- 2문장: 어떤 특징과 볼거리가 있는지
- 3문장: 어떤 분위기·감동을 주는지 + 관람료와 추천 대상 자연스럽게 포함
- 장소, 기간, CTA 문구는 절대 포함하지 마세요

[tags 추출 규칙]
- location: 장소명을 우선 참고하여 판단.
  장소에 '공원', '광장', '야외', '해변', '해수욕장' 등 포함 시 → "실외"
  장소에 '미술관', '갤러리', '홀', '센터', '극장', '박물관', '아트홀' 등 포함 시 → "실내"
  실내·실외 혼합이거나 판단 불가 시 → description 분위기로 보조 판단 후 "실내" | "실외" | "실내외" 중 선택
- mood: description의 분위기·감동에서 추출 → ["감성적"|"활기찬"|"차분한"|"설레는"|"힐링"] 중 1~3개
- energy: description의 활동성에서 판단 → "고에너지" | "중간에너지" | "저에너지"
- companion: description의 추천 대상에서 추출 → ["혼자"|"연인"|"친구"|"가족"|"어린이동반"] 중 해당하는 것
- ageGroup: description의 추천 대상에서 추출 → ["성인"|"청소년"|"어린이"|"가족"] 중 해당하는 것

[반환 형식]
{
  "description": "3문장 한국어 설명",
  "tags": {
    "location": "실내" | "실외" | "실내외",
    "mood": [],
    "energy": "고에너지" | "중간에너지" | "저에너지",
    "companion": [],
    "ageGroup": []
  }
}`;
}

function locationToIsIndoor(location: string): boolean {
  if (location === '실외') return false;
  return true;
}

async function callGemini(prompt: string, geminiUrl: string): Promise<GeminiResult | null> {
  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (res.status === 503) return null;

  if (!res.ok) throw new Error(`Gemini API 오류: ${res.status}`);

  const data = await res.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned) as GeminiResult;
  } catch {
    console.warn('  JSON 파싱 실패:', cleaned.slice(0, 100));
    return null;
  }
}

async function saveTagsAndLinks(
  eventItemId: string,
  tags: GeminiResult['tags'],
  tx: Prisma.TransactionClient,
) {
  const tagEntries: { name: string; type: string }[] = [
    ...tags.mood.map((name) => ({ name, type: 'mood' })),
    { name: tags.energy, type: 'energy' },
    ...tags.companion.map((name) => ({ name, type: 'companion' })),
    // ageGroup은 저장하지 않음 (추천 알고리즘 미사용)
  ];

  for (const entry of tagEntries) {
    if (!entry.name) continue;

    const tag = await tx.tag.upsert({
      where: { name: entry.name },
      create: { name: entry.name, type: entry.type },
      update: {},
    });

    await tx.eventItemTag.upsert({
      where: { eventItemId_tagId: { eventItemId, tagId: tag.id } },
      create: { eventItemId, tagId: tag.id },
      update: {},
    });
  }
}

async function main() {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY 환경변수가 없습니다.');

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  console.log('fillContents 시작...');

  const items = await prisma.eventItem.findMany({
    where: { deletedAt: null, tags: { none: {} } },
    select: { id: true, title: true, realmName: true, place: true, price: true },
  });

  console.log(`처리 대상: ${items.length}건`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    process.stdout.write(`  [${i + 1}/${items.length}] ${item.title.slice(0, 30)} ... `);

    try {
      const prompt = buildPrompt(item.title, item.realmName, item.place, item.price);
      const result = await callGemini(prompt, geminiUrl);

      if (!result) {
        console.log('skip (Gemini 503)');
        failed++;
        continue;
      }

      await prisma.$transaction(async (tx) => {
        await tx.eventItem.update({
          where: { id: item.id },
          data: {
            description: result.description,
            isIndoor: locationToIsIndoor(result.tags.location),
          },
        });

        await saveTagsAndLinks(item.id, result.tags, tx);
      });

      console.log('완료');
      success++;
    } catch (err) {
      console.log(`실패 — ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\n완료 — 성공: ${success}, 실패/스킵: ${failed}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
