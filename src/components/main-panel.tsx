import { Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MainPanelProps {
  query: string;
  setQuery: (q: string) => void;
  variables: string;
  setVariables: (v: string) => void;
  response: any;
  onRun: () => void;
  isLoading: boolean;
  aiExplanation: { explanation: string; suggestedFix: string } | null;
  isAIExplanationLoading: boolean;
  onExplainError: () => void;
}

export function MainPanel({
  query,
  setQuery,
  variables,
  setVariables,
  response,
  onRun,
  isLoading,
  aiExplanation,
  isAIExplanationLoading,
  onExplainError,
}: MainPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full">
      <div className="flex flex-col gap-4 min-h-0">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Operation</h2>
            <Button onClick={onRun} disabled={isLoading}>
            {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
            ) : (
                <Play className="mr-2 h-4 w-4" />
            )}
            Run
            </Button>
        </div>
        <div className="grid grid-rows-2 gap-4 flex-1 min-h-0">
          <Card className="flex flex-col">
            <CardHeader className="py-4">
              <CardTitle className="text-base">Query</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 pb-2 px-2">
              <Textarea
                placeholder="GraphQL Query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-full w-full resize-none font-code text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="py-4">
              <CardTitle className="text-base">Variables</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 pb-2 px-2">
              <Textarea
                placeholder={`{\n  "id": "1"\n}`}
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                className="h-full w-full resize-none font-code text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="flex flex-col min-h-0">
        <CardHeader className="py-4">
            <div className="flex justify-between items-center">
                <CardTitle className="text-base">Response</CardTitle>
                {response?.errors && (
                    <Button variant="outline" size="sm" onClick={onExplainError} disabled={isAIExplanationLoading}>
                         {isAIExplanationLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div> : <Sparkles className="mr-2 h-4 w-4" />}
                        Explain with AI
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-2">
          <ScrollArea className="h-full rounded-md border">
            {aiExplanation && (
              <Alert className="m-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="font-semibold text-blue-800 dark:text-blue-300">AI Explanation</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <p className="font-semibold mt-2">Explanation:</p>
                  <p className="text-sm">{aiExplanation.explanation}</p>
                  <p className="mt-2 font-semibold">Suggested Fix:</p>
                  <code className="text-sm whitespace-pre-wrap">{aiExplanation.suggestedFix}</code>
                </AlertDescription>
              </Alert>
            )}
            <pre className="text-sm font-code p-4">
              {response ? JSON.stringify(response, null, 2) : <span className='text-muted-foreground font-sans'>Click "Run" to send a request.</span>}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
