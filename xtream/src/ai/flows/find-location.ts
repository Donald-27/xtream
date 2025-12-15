'use server';

/**
 * @fileOverview A flow to find and format a location based on a user's query.
 *
 * - findLocation - A function that returns a formatted location string.
 * - FindLocationInput - The input type for the findLocation function.
 * - FindLocationOutput - The return type for the findLocation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindLocationInputSchema = z.object({
  query: z.string().describe('The user\'s search query for a location (e.g., "paris", "san francisco ca").'),
});
export type FindLocationInput = z.infer<typeof FindLocationInputSchema>;

const FindLocationOutputSchema = z.object({
  formattedLocation: z.string().describe('The full, formatted location string (e.g., "Paris, France" or "San Francisco, CA, USA"). Return an empty string if no location is found.'),
});
export type FindLocationOutput = z.infer<typeof FindLocationOutputSchema>;

export async function findLocation(input: FindLocationInput): Promise<FindLocationOutput> {
  return findLocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findLocationPrompt',
  input: { schema: FindLocationInputSchema },
  output: { schema: FindLocationOutputSchema },
  prompt: `You are a location formatting expert. A user is searching for a location. Based on their query, find the most likely intended location and return it in a standard "City, State/Region, Country" format.

  User Query: {{{query}}}

  Examples:
  - If the query is "london", you should return "London, UK".
  - If the query is "nyc", you should return "New York, NY, USA".
  - If the query is "tokyo", you should return "Tokyo, Japan".
  - If the query is ambiguous or not a real place, return an empty string.

  Return only the formatted location string.
  `,
});

const findLocationFlow = ai.defineFlow(
  {
    name: 'findLocationFlow',
    inputSchema: FindLocationInputSchema,
    outputSchema: FindLocationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
