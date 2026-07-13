import { apiClient } from '@/libs/api-client';

export type ActionItem = {
  assignee: string;
  task: string;
  deadline: string;
};

export type SummaryData = {
  id: number;
  transcript_id: number;
  room_livekit_name: string;
  category: string;
  executive_summary: string;
  key_points: string[];
  action_items: ActionItem[];
  decisions_made: string[];
  discussion_tags: string[];
  model: string;
  created_at: string;
};

export async function getRoomSummary(roomName: string): Promise<SummaryData> {
  const response = await apiClient.get<SummaryData>(
    `/api/v1/rooms/${encodeURIComponent(roomName)}/summary`,
  );
  return response.data;
}

export async function getSummaryByID(id: number): Promise<SummaryData> {
  const response = await apiClient.get<SummaryData>(`/api/v1/summaries/${id}`);
  return response.data;
}

export async function getSummaryByTranscriptID(transcriptId: number): Promise<SummaryData> {
  const response = await apiClient.get<SummaryData>(
    `/api/v1/summaries/by-transcript/${transcriptId}`,
  );
  return response.data;
}
