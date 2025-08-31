import type { GqlEnvironment } from '@/types';

export const executeGraphQL = async (
  environment: GqlEnvironment,
  query: string,
  variables?: string
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const { authMethod, authDetails, url } = environment;

  if (authMethod === 'Bearer Token' && authDetails['Bearer Token']) {
    headers['Authorization'] = `Bearer ${authDetails['Bearer Token']}`;
  } else if (authMethod === 'API Key' && authDetails['API Key']) {
    const { key, value } = authDetails['API Key'];
    if(key && value) headers[key] = value;
  } else if (authMethod === 'Basic Auth' && authDetails['Basic Auth']) {
    const { user, pass } = authDetails['Basic Auth'];
    if(user && pass) headers['Authorization'] = `Basic ${btoa(`${user}:${pass}`)}`;
  }
  
  let parsedVariables;
  try {
    parsedVariables = variables && variables.trim() !== '' ? JSON.parse(variables) : undefined;
  } catch (e) {
    throw new Error("Variables are not valid JSON.");
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: parsedVariables,
      }),
    });

    // We try to parse the body regardless of status, as GraphQL errors often come with a 200 OK.
    const responseBody = await response.text();
    try {
        return JSON.parse(responseBody);
    } catch(e) {
        // If JSON parsing fails, it's likely not a GraphQL response.
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${responseBody}`);
        }
        // It could be a successful response with non-JSON content.
        return { data: responseBody };
    }

  } catch (error) {
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred during the request.');
  }
};
