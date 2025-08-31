'use server';

/**
 * @fileOverview An AI agent that explains GraphQL errors and suggests fixes.
 *
 * - explainGraphQLError - A function that explains GraphQL errors.
 * - ExplainGraphQLErrorInput - The input type for the explainGraphQLError function.
 * - ExplainGraphQLErrorOutput - The return type for the explainGraphQLError function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainGraphQLErrorInputSchema = z.object({
  graphqlError: z
    .string()
    .describe('The GraphQL error message to be explained.'),
  graphqlQuery: z
    .string()
    .optional()
    .describe('The GraphQL query that caused the error, if available.'),
});
export type ExplainGraphQLErrorInput = z.infer<typeof ExplainGraphQLErrorInputSchema>;

const ExplainGraphQLErrorOutputSchema = z.object({
  explanation: z.string().describe('A human-readable explanation of the error.'),
  suggestedFix: z.string().describe('A suggestion for how to fix the error.'),
});
export type ExplainGraphQLErrorOutput = z.infer<typeof ExplainGraphQLErrorOutputSchema>;

export async function explainGraphQLError(input: ExplainGraphQLErrorInput): Promise<ExplainGraphQLErrorOutput> {
  return explainGraphQLErrorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainGraphQLErrorPrompt',
  input: {schema: ExplainGraphQLErrorInputSchema},
  output: {schema: ExplainGraphQLErrorOutputSchema},
  prompt: `You are a GraphQL expert. You will be provided with a GraphQL error message and, if available, the GraphQL query that caused the error.

  Your task is to explain the error in a way that is easy to understand for a developer, and to provide a suggestion for how to fix the error.

  Error message: {{{graphqlError}}}
  {{~#if graphqlQuery}}
  GraphQL query: {{{graphqlQuery}}}
  {{~/if}}`,
});

const explainGraphQLErrorFlow = ai.defineFlow(
  {
    name: 'explainGraphQLErrorFlow',
    inputSchema: ExplainGraphQLErrorInputSchema,
    outputSchema: ExplainGraphQLErrorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
