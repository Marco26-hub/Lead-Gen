import { Resend } from 'resend';
import { env, requireEnv } from '@maps/core';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

export interface SendResult {
  id: string | null;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  const resend = new Resend(requireEnv('RESEND_API_KEY'));
  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    headers: input.headers,
  });
  if (error) return { id: null, error: error.message };
  return { id: data?.id ?? null };
}
