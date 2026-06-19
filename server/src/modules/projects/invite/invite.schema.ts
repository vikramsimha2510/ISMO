import { z } from 'zod';

export const joinProjectSchema = z.object({
  inviteCode: z
    .string({ required_error: 'Invite code is required' })
    .trim()
    .min(6, 'Invite code must be at least 6 characters')
    .max(12, 'Invite code is too long')
    .transform((val) => val.toUpperCase()),
});

export type JoinProjectInput = z.infer<typeof joinProjectSchema>;
