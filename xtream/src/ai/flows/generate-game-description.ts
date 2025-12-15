'use server';

/**
 * @fileOverview A flow to generate game descriptions and rules.
 *
 * - generateGameDescription - A function that generates a game description and rules.
 * - GenerateGameDescriptionInput - The input type for the generateGameDescription function.
 * - GenerateGameDescriptionOutput - The return type for the generateGameDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGameDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the game.'),
  gameType: z.string().describe('The type of game (e.g., Trivia, Social Deduction, Strategy).'),
});
export type GenerateGameDescriptionInput = z.infer<typeof GenerateGameDescriptionInputSchema>;

const GenerateGameDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling description of the game.'),
  rules: z.string().describe('A clear and concise set of rules for the game.'),
});
export type GenerateGameDescriptionOutput = z.infer<typeof GenerateGameDescriptionOutputSchema>;

export async function generateGameDescription(
  input: GenerateGameDescriptionInput
): Promise<GenerateGameDescriptionOutput> {
  return generateGameDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGameDescriptionPrompt',
  input: {schema: GenerateGameDescriptionInputSchema},
  output: {schema: GenerateGameDescriptionOutputSchema},
  prompt: `You are an expert game designer. Generate a compelling description and a clear set of rules for a game based on the following information.

Game Title: {{{title}}}
Game Type: {{{gameType}}}

The description should be exciting and make people want to play.
The rules should be easy to understand, even for new players. Provide at least 3-5 clear, numbered rules.
`,
});

const generateGameDescriptionFlow = ai.defineFlow(
  {
    name: 'generateGameDescriptionFlow',
    inputSchema: GenerateGameDescriptionInputSchema,
    outputSchema: GenerateGameDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
