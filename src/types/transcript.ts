/**
 * Transcript and transcript types
 */

export interface Transcript {
  id: string;
  meetingId: string;
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  participantCount: number;
  duration: number;
  language: string;
  searchableContent?: string;
}

export interface TranscriptSegment {
  id: string;
  transcriptId: string;
  speakerId: number;
  speakerName: string;
  content: string;
  timestamp: number;
  confidence?: number;
}

export interface Summary {
  id: string;
  meetingId: string;
  transcriptId: string;
  title: string;
  content: string;
  keyPoints: string[];
  actionItems: string[];
  participants: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  aiProvider: string;
}
