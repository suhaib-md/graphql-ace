'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate GraphQL queries or mutations
 * based on a description of the desired data.
 *
 * - generateGraphQLOperation - A function that generates a GraphQL query or mutation.
 * - GenerateGraphQLOperationInput - The input type for the generateGraphQLOperation function.
 * - GenerateGraphQLOperationOutput - The return type for the generateGraphQLOperation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGraphQLOperationInputSchema = z.object({
  description: z
    .string()
    .describe(
      'A description of the data required to generate the GraphQL operation.'
    ),
  operationType: z
    .enum(['query', 'mutation'])
    .describe('The type of GraphQL operation to generate (query or mutation).'),
});

export type GenerateGraphQLOperationInput = z.infer<
  typeof GenerateGraphQLOperationInputSchema
>;

const GenerateGraphQLOperationOutputSchema = z.object({
  graphqlOperation: z
    .string()
    .describe('The generated GraphQL query or mutation.'),
});

export type GenerateGraphQLOperationOutput = z.infer<
  typeof GenerateGraphQLOperationOutputSchema
>;

export async function generateGraphQLOperation(
  input: GenerateGraphQLOperationInput
): Promise<GenerateGraphQLOperationOutput> {
  return generateGraphQLOperationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGraphQLOperationPrompt',
  input: {schema: GenerateGraphQLOperationInputSchema},
  output: {schema: GenerateGraphQLOperationOutputSchema},
  prompt: `You are a GraphQL expert who can generate GraphQL {{operationType}} based on a description of the data needed.

Description: {{{description}}}

Generate the GraphQL {{operationType}}:
`,
});

const generateGraphQLOperationFlow = ai.defineFlow(
  {
    name: 'generateGraphQLOperationFlow',
    inputSchema: GenerateGraphQLOperationInputSchema,
    outputSchema: GenerateGraphQLOperationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
