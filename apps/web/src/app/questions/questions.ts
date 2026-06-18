export type Q1Answer = "high" | "medium" | "low";
export type Q2Answer = "recharge" | "comfort" | "thrill" | "stimulate" | "warmth";
export type Q3Answer = "performance" | "music" | "exhibition" | "experience" | "festival" | "any";
export type Q4Answer = "alone" | "special" | "group" | "family";

export interface Answers {
  q1: Q1Answer | null;
  q2: Q2Answer | null;
  q3: Q3Answer | null;
  q4: Q4Answer | null;
}

export const QUESTIONS = [
  {
    key: "q1" as const,
    question: "오늘 나의 에너지는 어떤가요?",
    choices: [
      { value: "high" as Q1Answer, label: "⚡ 넘쳐흘러 — 뭐든 달려들 수 있을 것 같아!" },
      { value: "medium" as Q1Answer, label: "😌 적당해요 — 가볍고 여유롭게 즐길 수 있어." },
      { value: "low" as Q1Answer, label: "🪫 바닥났어 — 그냥 조용히 쉬고 싶은 날이야." },
    ],
  },
  {
    key: "q2" as const,
    question: "지금 나에게 가장 필요한 게 뭔가요?",
    choices: [
      { value: "recharge" as Q2Answer, label: "😮‍💨 그냥 아무 생각 없이 쉬고 싶어" },
      { value: "comfort" as Q2Answer, label: "🥹 뭔가 뭉클하고 감동받고 싶어" },
      { value: "thrill" as Q2Answer, label: "🤩 신나고 에너지 받고 싶어" },
      { value: "stimulate" as Q2Answer, label: "🤔 새로운 걸 보고 생각하고 싶어" },
      { value: "warmth" as Q2Answer, label: "🥰 따뜻하고 포근한 시간이 필요해" },
    ],
  },
  {
    key: "q3" as const,
    question: "어떤 장르가 끌려요?",
    choices: [
      { value: "performance" as Q3Answer, label: "🎭 공연이 보고 싶어 → 뮤지컬/연극/무용" },
      { value: "music" as Q3Answer, label: "🎵 음악을 듣고 싶어 → 음악/콘서트/국악" },
      { value: "exhibition" as Q3Answer, label: "🖼 전시가 보고 싶어 → 전시/미술" },
      { value: "experience" as Q3Answer, label: "🤸 체험하고 싶어 → 교육/체험" },
      { value: "festival" as Q3Answer, label: "🎪 축제 분위기가 좋아 → 행사/축제" },
      { value: "any" as Q3Answer, label: "🎲 아무거나" },
    ],
  },
  {
    key: "q4" as const,
    question: "오늘 하루, 누구와 어떤 시간을 만들며 하루를 특별하게 만들고 싶나요?",
    choices: [
      { value: "alone" as Q4Answer, label: "🌿 나 혼자만을 위한 고요한 시간을 보내고싶어." },
      { value: "special" as Q4Answer, label: "💞 소중한 사람과 함께하는 특별한 하루를 만들고싶어." },
      { value: "group" as Q4Answer, label: "🎉 모두 함께 신나게 떠들썩한 시간을 즐기고싶어." },
      { value: "family" as Q4Answer, label: "👨‍👩‍👧 가족과 함께하는 따뜻하고 포근한 하루를 보내고싶어." },
    ],
  },
] as const;
