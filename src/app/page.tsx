"use client";

import { useState, useEffect, useCallback } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Aperture, History, Combine, FileJson, Bot } from 'lucide-react';

import type { GqlEnvironment, HistoryItem, Settings as AppSettings } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { INTROSPECTION_QUERY, getOperationName } from '@/lib/schema';
import { executeGraphQL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { explainGraphQLError } from '@/ai/flows/explain-graphql-error';

import { EnvironmentManager } from '@/components/environment-manager';
import { MainPanel } from '@/components/main-panel';
import { SchemaExplorer } from '@/components/schema-explorer';
import { HistoryPanel } from '@/components/history-panel';
import { BatchPanel } from '@/components/batch-panel';
import { SettingsDialog } from '@/components/settings-dialog';

export default function Home() {
  const { toast } = useToast();

  const [environments, setEnvironments] = useLocalStorage<GqlEnvironment[]>('gql-environments', []);
  const [currentEnvId, setCurrentEnvId] = useLocalStorage<string | null>('gql-current-env-id', null);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('gql-history', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('gql-settings', { autoFormat: false, theme: 'system' });
  
  const [query, setQuery] = useState('');
  const [variables, setVariables] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [schema, setSchema] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  
  const [isAIExplanationLoading, setIsAIExplanationLoading] = useState(false);
  const [aiExplanation, setAIExplanation] = useState<{ explanation: string; suggestedFix: string } | null>(null);

  const currentEnvironment = environments.find(env => env.id === currentEnvId) || null;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  const fetchSchema = useCallback(async () => {
    if (!currentEnvironment) {
      setSchema(null);
      return;
    }
    setIsSchemaLoading(true);
    setSchema(null);
    try {
      const introspectionResult = await executeGraphQL(currentEnvironment, INTROSPECTION_QUERY);
      setSchema(introspectionResult.data.__schema);
    } catch (error) {
      console.error('Introspection query failed:', error);
      toast({
        variant: "destructive",
        title: "Schema Introspection Failed",
        description: error instanceof Error ? error.message : "Could not fetch schema. Check console for details.",
      });
      setSchema(null);
    } finally {
      setIsSchemaLoading(false);
    }
  }, [currentEnvironment, toast]);
  
  useEffect(() => {
    if (currentEnvironment) {
      fetchSchema();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEnvId]);

  const handleRunQuery = async () => {
    if (!currentEnvironment) {
      toast({
        variant: 'destructive',
        title: 'No Environment Selected',
        description: 'Please select or configure an environment first.',
      });
      return;
    }
    setIsLoading(true);
    setResponse(null);
    setAIExplanation(null);
    try {
      const result = await executeGraphQL(currentEnvironment, query, variables);
      setResponse(result);
      if (!result.errors) {
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          query,
          variables,
          response: result,
          timestamp: Date.now(),
          environmentId: currentEnvironment.id,
          operationName: getOperationName(query),
        };
        setHistory([newHistoryItem, ...history].slice(0, 50));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setResponse({ errors: [{ message: errorMessage }] });
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainError = async () => {
    if (!response?.errors) return;
    setIsAIExplanationLoading(true);
    setAIExplanation(null);
    try {
        const errorToExplain = response.errors[0];
        const explanation = await explainGraphQLError({
            graphqlError: JSON.stringify(errorToExplain, null, 2),
            graphqlQuery: query,
        });
        setAIExplanation(explanation);
    } catch (e) {
        toast({
            variant: "destructive",
            title: "AI Explanation Failed",
            description: e instanceof Error ? e.message : "Could not get explanation from AI.",
        });
    } finally {
        setIsAIExplanationLoading(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setQuery(item.query);
    setVariables(item.variables || '');
    setResponse(item.response);
    if(environments.some(e => e.id === item.environmentId)) {
        setCurrentEnvId(item.environmentId);
    } else {
        toast({ variant: 'destructive', title: 'Environment not found', description: 'The environment for this history item no longer exists.'});
    }
  };
  
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-body">
        <header className="flex items-center justify-between h-14 px-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Aperture className="h-6 w-6" />
            <h1 className="text-xl font-semibold font-headline">GraphQL Ace</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <EnvironmentManager
              environments={environments}
              setEnvironments={setEnvironments}
              currentId={currentEnvId}
              setCurrentId={setCurrentEnvId}
            />
            <Button variant="ghost" size="icon" onClick={fetchSchema} disabled={isSchemaLoading || !currentEnvironment} aria-label="Refresh Schema">
              {isSchemaLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> : <Combine className="h-4 w-4" />}
            </Button>
            <SettingsDialog settings={settings} setSettings={setSettings} />
          </div>
        </header>
        <div className="flex flex-1 min-h-0 w-full">
          <Sidebar>
            <SidebarContent>
              <Tabs defaultValue="schema" className="flex flex-col h-full p-2">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="schema"><FileJson className="mr-2 h-4 w-4"/>Schema</TabsTrigger>
                  <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>History</TabsTrigger>
                  <TabsTrigger value="batch"><Bot className="mr-2 h-4 w-4"/>Batch</TabsTrigger>
                </TabsList>
                <TabsContent value="schema" className="flex-1 overflow-auto mt-2">
                  <SchemaExplorer schema={schema} isLoading={isSchemaLoading} />
                </TabsContent>
                <TabsContent value="history" className="flex-1 overflow-auto mt-2">
                  <HistoryPanel history={history} onSelect={loadFromHistory} environments={environments} />
                </TabsContent>
                <TabsContent value="batch" className="flex-1 overflow-auto mt-2 h-full">
                  <BatchPanel />
                </TabsContent>
              </Tabs>
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="flex-1 flex flex-col">
            <MainPanel
              query={query}
              setQuery={setQuery}
              variables={variables}
              setVariables={setVariables}
              response={response}
              onRun={handleRunQuery}
              isLoading={isLoading}
              aiExplanation={aiExplanation}
              isAIExplanationLoading={isAIExplanationLoading}
              onExplainError={handleExplainError}
            />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
