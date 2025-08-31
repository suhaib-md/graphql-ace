export type AuthMethod = 'None' | 'Bearer Token' | 'API Key' | 'Basic Auth';

export interface AuthDetails {
  'Bearer Token'?: string;
  'API Key'?: { key: string; value: string; addTo: 'Header' | 'Query Param' };
  'Basic Auth'?: { user: string; pass: string };
}

export interface GqlEnvironment {
  id: string;
  name: string;
  url: string;
  authMethod: AuthMethod;
  authDetails: AuthDetails;
}

export interface HistoryItem {
  id: string;
  query: string;
  variables?: string;
  response: any;
  timestamp: number;
  environmentId: string;
  operationName?: string;
}

export interface Settings {
  autoFormat: boolean;
  theme: 'light' | 'dark' | 'system';
}
