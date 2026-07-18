import type { SummaryData } from '@/services/summary-service';
import type { TranscriptData } from '@/services/transcript-service';
import { apiClient } from '@/libs/api-client';

/** Overall pipeline state. `live` = meeting still running. */
export type InsightsStatus = 'live' | 'processing' | 'completed' | 'failed';

/** Finer-grained pipeline step, used to drive the progress UI. */
export type InsightsStep
  = | 'live'
    | 'finalizing'
    | 'recording'
    | 'transcribing'
    | 'summarizing'
    | 'completed'
    | 'failed';

/**
 * Unified post-meeting pipeline payload. Returned by the always-200 insights
 * endpoint so the UI can poll without hitting 404s while jobs are in flight.
 * `transcript` appears once transcription completes; `summary` once summarizing does.
 */
export type InsightsData = {
  room_livekit_name: string;
  status: InsightsStatus;
  step: InsightsStep;
  message: string;
  transcript: TranscriptData | null;
  summary: SummaryData | null;
};

export async function getRoomInsights(roomName: string): Promise<InsightsData> {
  const response = await apiClient.get<InsightsData>(
    `/api/v1/rooms/${encodeURIComponent(roomName)}/insights`,
  );
  return response.data;
}
