import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { WeatherResult } from '@/lib/weatherApi';
import type { DustResult } from '@/lib/dustApi';
import type { QuestionKey } from '@prisma/client';

export type EventCandidate = {
  id: string;
  title: string;
  realmName: string | null;
  place: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  startDate: Date | null;
  endDate: Date | null;
  price: string | null;
  description: string | null;
  imageUrl: string | null;
  bookingUrl: string | null;
  tags: { tag: { name: string } }[];
};

export type ScoredEvent = Omit<EventCandidate, 'tags'> & {
  score: number;
  distanceKm: number | null;
  matchedTags: string[];
};

const QUESTION_KEY_MAP: Record<string, QuestionKey> = {
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
};

export async function findRecommendationCandidates(indoorOnly: boolean): Promise<EventCandidate[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.eventItem.findMany({
    where: {
      deletedAt: null,
      endDate: { gte: today },
      ...(indoorOnly ? { isIndoor: true } : {}),
    },
    select: {
      id: true,
      title: true,
      realmName: true,
      place: true,
      address: true,
      lat: true,
      lng: true,
      startDate: true,
      endDate: true,
      price: true,
      description: true,
      imageUrl: true,
      bookingUrl: true,
      tags: {
        select: {
          tag: { select: { name: true } },
        },
      },
    },
  });
}

export async function updateSessionToRequested(sessionId: string): Promise<void> {
  await prisma.explorationSession.update({
    where: { id: sessionId },
    data: { status: 'RECOMMENDATION_REQUESTED' },
  });
}

export async function saveRecommendation(params: {
  sessionId: string;
  userId: string | null;
  sido: string | null;
  nx: number | null;
  ny: number | null;
  answers: Array<{ questionKey: string; answerValue: string }>;
  weather: WeatherResult | null;
  dust: DustResult | null;
  curation: string;
  indoorForced: boolean;
  nearbyExpanded: boolean;
  items: ScoredEvent[];
}): Promise<string> {
  return prisma.$transaction(async (tx) => {
    for (const answer of params.answers) {
      const qk = QUESTION_KEY_MAP[answer.questionKey];
      await tx.explorationAnswer.upsert({
        where: {
          explorationSessionId_questionKey: {
            explorationSessionId: params.sessionId,
            questionKey: qk,
          },
        },
        update: { answerValue: answer.answerValue },
        create: {
          explorationSessionId: params.sessionId,
          questionKey: qk,
          answerValue: answer.answerValue,
        },
      });
    }

    await tx.explorationSession.update({
      where: { id: params.sessionId },
      data: { status: 'RECOMMENDATION_COMPLETED', completedAt: new Date() },
    });

    const run = await tx.recommendationRun.create({
      data: {
        explorationSessionId: params.sessionId,
        userId: params.userId,
        curation: params.curation,
        indoorForced: params.indoorForced,
        nearbyExpanded: params.nearbyExpanded,
        resultCount: params.items.length,
      },
      select: { id: true },
    });

    await tx.weatherSnapshot.create({
      data: {
        recommendationRunId: run.id,
        sido: params.sido,
        nx: params.nx,
        ny: params.ny,
        skyLabel: params.weather?.skyLabel ?? null,
        pty: params.weather?.pty ?? null,
        temperature: params.weather?.temperature ?? null,
        pm10Value: params.dust?.pm10Value ?? null,
        pm10Grade: params.dust?.pm10Grade ?? null,
        pm25Value: params.dust?.pm25Value ?? null,
        pm25Grade: params.dust?.pm25Grade ?? null,
      },
    });

    if (params.items.length > 0) {
      await tx.recommendationItem.createMany({
        data: params.items.map((item, i) => ({
          recommendationRunId: run.id,
          eventItemId: item.id,
          rank: i + 1,
          score: item.score,
          distanceKm: item.distanceKm ?? null,
          reason: null,
          matchedTags: item.matchedTags.length > 0 ? item.matchedTags : Prisma.DbNull,
        })),
      });
    }

    return run.id;
  });
}
