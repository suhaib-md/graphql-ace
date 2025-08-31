'use server';

/**
 * @fileOverview A GraphQL schema summarization AI agent.
 *
 * - summarizeGraphQLSchema - A function that summarizes a GraphQL schema.
 * - SummarizeGraphQLSchemaInput - The input type for the summarizeGraphQLSchema function.
 * - SummarizeGraphQLSchemaOutput - The return type for the summarizeGraphQLSchema function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeGraphQLSchemaInputSchema = z.object({
  schema: z
    .string()
    .describe('The GraphQL schema to summarize.')
});
export type SummarizeGraphQLSchemaInput = z.infer<typeof SummarizeGraphQLSchemaInputSchema>;

const SummarizeGraphQLSchemaOutputSchema = z.object({
  summary: z.string().describe('A summary of the GraphQL schema, highlighting useful queries and mutations.')
});
export type SummarizeGraphQLSchemaOutput = z.infer<typeof SummarizeGraphQLSchemaOutputSchema>;

export async function summarizeGraphQLSchema(input: SummarizeGraphQLSchemaInput): Promise<SummarizeGraphQLSchemaOutput> {
  return summarizeGraphQLSchemaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeGraphQLSchemaPrompt',
  input: {schema: SummarizeGraphQLSchemaInputSchema},
  output: {schema: SummarizeGraphQLSchemaOutputSchema},
  prompt: `You are an expert GraphQL schema summarizer. Your job is to summarize the schema, highlighting the most useful queries and mutations for a developer.

GraphQL Schema: {{{schema}}}`,
});

const summarizeGraphQLSchemaFlow = ai.defineFlow(
  {
    name: 'summarizeGraphQLSchemaFlow',
    inputSchema: SummarizeGraphQLSchemaInputSchema,
    outputSchema: SummarizeGraphQLSchemaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
