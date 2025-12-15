'use server';

/**
 * @fileOverview Provides AI-powered suggestions for stream titles and categories to enhance discoverability.
 *
 * - suggestStreamTitle - A function that suggests engaging titles and relevant categories for live streams.
 * - SuggestStreamTitleInput - The input type for the suggestStreamTitle function.
 * - SuggestStreamTitleOutput - The return type for the suggestStreamTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStreamTitleInputSchema = z.object({
  streamDescription: z
    .string()
    .describe('A description of the live stream content.'),
  currentTitle: z.string().optional().describe('The current title of the stream, if any.'),
  categoryPreferences: z
    .string()
    .optional()
    .describe('User preferences for stream categories.'),
});
export type SuggestStreamTitleInput = z.infer<typeof SuggestStreamTitleInputSchema>;

const SuggestStreamTitleOutputSchema = z.object({
  suggestedTitle: z.string().describe('An engaging title suggestion for the stream.'),
  suggestedCategories: z
    .array(z.string())
    .describe('Relevant category suggestions for the stream.'),
});
export type SuggestStreamTitleOutput = z.infer<typeof SuggestStreamTitleOutputSchema>;

export async function suggestStreamTitle(input: SuggestStreamTitleInput): Promise<SuggestStreamTitleOutput> {
  return suggestStreamTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStreamTitlePrompt',
  input: {schema: SuggestStreamTitleInputSchema},
  output: {schema: SuggestStreamTitleOutputSchema},
  prompt: `You are an AI assistant specialized in suggesting engaging titles and relevant categories for live streams.

  Based on the stream description, current title (if any), and user category preferences, provide a compelling title and a list of relevant categories to attract more viewers and increase the stream's visibility.

  Stream Description: {{{streamDescription}}}
  Current Title: {{{currentTitle}}}
  Category Preferences: {{{categoryPreferences}}}

  Consider these when generating the title and categories. Make the title short, catchy, and reflective of the stream's content. Select categories that are most relevant to the stream.

  Output a JSON object with "suggestedTitle" and "suggestedCategories" fields.
  `,
});

const suggestStreamTitleFlow = ai.defineFlow(
  {
    name: 'suggestStreamTitleFlow',
    inputSchema: SuggestStreamTitleInputSchema,
    outputSchema: SuggestStreamTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
