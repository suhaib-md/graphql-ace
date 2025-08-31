import { config } from 'dotenv';
config();

import '@/ai/flows/explain-graphql-error.ts';
import '@/ai/flows/summarize-graphql-schema.ts';
import '@/ai/flows/generate-graphql-operation.ts';