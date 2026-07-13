import { z } from 'zod';

export const DisplayNameSchema = z
  .string()
  .trim()
  .regex(
    /^[a-z\s\-]{2,50}$/i,
    'Use 2–50 letters, spaces, or hyphens only',
  );

export const LobbySchema = z.object({
  displayName: DisplayNameSchema,
});

export type LobbyInput = z.infer<typeof LobbySchema>;
