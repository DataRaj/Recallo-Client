import { apiClient } from '@/libs/api-client';

export interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker: number;
  speaker_confidence?: number;
}

export interface Utterance {
  speaker: number;
  start: number;
  end: number;
  text: string;
  words: Word[];
}

export interface TranscriptData {
  id: number;
  room_livekit_name: string;
  recording_id: number;
  egress_id: string;
  text: string;
  confidence: number;
  duration_sec: number;
  words_json: Word[];
  model: string;
  language: string;
  created_at: string;
}

export function groupWordsIntoUtterances(words: Word[]): Utterance[] {
  if (!words.length) return [];
  const firstWord = words[0]!;
  const utterances: Utterance[] = [];
  let current: Utterance = {
    speaker: firstWord.speaker,
    start: firstWord.start,
    end: firstWord.end,
    text: firstWord.word,
    words: [firstWord],
  };

  for (let i = 1; i < words.length; i++) {
    const w = words[i]!;
    if (w.speaker === current.speaker) {
      current.words.push(w);
      current.end = w.end;
      current.text += ' ' + w.word;
    } else {
      utterances.push(current);
      current = { speaker: w.speaker, start: w.start, end: w.end, text: w.word, words: [w] };
    }
  }
  utterances.push(current);
  return utterances;
}

export async function getRoomTranscript(roomName: string): Promise<TranscriptData> {
  const response = await apiClient.get<TranscriptData>(
    `/api/v1/rooms/${encodeURIComponent(roomName)}/transcript`
  );
  return response.data;
}

export async function getTranscriptByID(id: number): Promise<TranscriptData> {
  const response = await apiClient.get<TranscriptData>(`/api/v1/transcripts/${id}`);
  return response.data;
}
