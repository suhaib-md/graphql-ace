import type { HistoryItem, GqlEnvironment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  environments: GqlEnvironment[];
}

export function HistoryPanel({ history, onSelect, environments }: HistoryPanelProps) {
  if (history.length === 0) {
    return <div className="text-center text-muted-foreground p-4 text-sm">No history yet. Run a query to see it here.</div>;
  }

  const getEnvName = (envId: string) => environments.find(e => e.id === envId)?.name || 'Unknown';

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-1">
        {history.map((item) => (
          <Card key={item.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => onSelect(item)}>
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <p className="font-semibold truncate pr-2">{item.operationName || 'Anonymous Operation'}</p>
                {item.response.errors ? (
                    <Badge variant="destructive">Error</Badge>
                ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>
                )}
              </div>
              <div className="flex justify-between items-end mt-2 text-xs text-muted-foreground">
                <span className="truncate pr-2">{getEnvName(item.environmentId)}</span>
                <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
