import { z } from 'zod';


export const DisplayNameSchema = z
  .string()
  .trim()
  .regex(
    /^[a-zA-Z\s\-]{2,50}$/,
    'Use 2–50 letters, spaces, or hyphens only',
  );

export const LobbySchema = z.object({
  displayName: DisplayNameSchema,
});

export type LobbyInput = z.infer<typeof LobbySchema>;
