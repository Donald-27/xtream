'use server';

/**
 * @fileOverview A flow to generate event descriptions based on event details.
 *
 * - generateEventDescription - A function that generates an event description.
 * - GenerateEventDescriptionInput - The input type for the generateEventDescription function.
 * - GenerateEventDescriptionOutput - The return type for the generateEventDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEventDescriptionInputSchema = z.object({
  eventType: z.string().describe('The type of event (e.g., Workshop, Meetup, Party).'),
  title: z.string().describe('The title of the event.'),
  description: z.string().describe('A brief description of the event.'),
  date: z.string().describe('The date and time of the event.'),
  location: z.string().describe('The location of the event (e.g., Online, Central Park).'),
  details: z.string().optional().describe('Additional details about the event, like age restrictions, skill level, requirements'),
});
export type GenerateEventDescriptionInput = z.infer<typeof GenerateEventDescriptionInputSchema>;

const GenerateEventDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling description of the event.'),
});
export type GenerateEventDescriptionOutput = z.infer<typeof GenerateEventDescriptionOutputSchema>;

export async function generateEventDescription(
  input: GenerateEventDescriptionInput
): Promise<GenerateEventDescriptionOutput> {
  return generateEventDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEventDescriptionPrompt',
  input: {schema: GenerateEventDescriptionInputSchema},
  output: {schema: GenerateEventDescriptionOutputSchema},
  prompt: `You are an expert event description writer. Generate a compelling and attractive description for the event based on the following information.  Maximize excitement and make people want to attend.  Make sure to include all the provided details.

Event Type: {{{eventType}}}
Title: {{{title}}}
Description: {{{description}}}
Date and Time: {{{date}}}
Location: {{{location}}}
Details: {{{details}}}
`,
});

const generateEventDescriptionFlow = ai.defineFlow(
  {
    name: 'generateEventDescriptionFlow',
    inputSchema: GenerateEventDescriptionInputSchema,
    outputSchema: GenerateEventDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
