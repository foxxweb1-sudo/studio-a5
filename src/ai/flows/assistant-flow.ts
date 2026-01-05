'use server';
/**
 * @fileOverview An AI assistant for the application.
 *
 * - assist - A function that handles user queries.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export async function assist(query: string): Promise<string> {
  const assistantFlow = ai.defineFlow(
    {
      name: 'assistantFlow',
      inputSchema: z.string(),
      outputSchema: z.string(),
    },
    async (prompt) => {
      const llmResponse = await ai.generate({
        prompt: `You are an expert AI assistant for this application. Your purpose is to help users understand and use the application.

          Application features:
          - Student attendance tracking
          - Student payment management
          - Reports for attendance and payments
          - QR code generation for students for quick attendance
          - User account management
          - An admin dashboard to view all students and contact messages.

          The user is asking the following question, please provide a helpful and concise response in Arabic:
          ${prompt}`,
      });
      return llmResponse.text;
    }
  );

  return await assistantFlow(query);
}
