"use client";

import { useState } from 'react';
import { generateGraphQLOperation } from '@/ai/flows/generate-graphql-operation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Bot, Rocket } from 'lucide-react';

export function BatchPanel() {
    const [operations, setOperations] = useState('[]');
    const { toast } = useToast();

    const handleAddOperation = (op: any) => {
        try {
            const currentOps = JSON.parse(operations || '[]');
            const newOps = [...currentOps, op];
            setOperations(JSON.stringify(newOps, null, 2));
        } catch {
            toast({
                variant: 'destructive',
                title: 'Invalid JSON',
                description: 'Could not add operation to the batch. The existing content is not valid JSON.'
            });
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">Batch Operations</h3>
                <div className='flex gap-2'>
                    <AddOperationDialog onAdd={handleAddOperation} />
                    <Button variant="outline" size="sm" disabled>
                        <Rocket className="mr-2 h-4 w-4" />
                        Execute Batch
                    </Button>
                </div>
            </div>
            <Textarea
                value={operations}
                onChange={(e) => setOperations(e.target.value)}
                className="font-code text-sm flex-1 resize-none"
                placeholder="[]"
            />
            <p className="text-xs text-muted-foreground">
                Construct a JSON array of GraphQL operations to be executed. Execution is not yet implemented.
            </p>
        </div>
    );
}

function AddOperationDialog({ onAdd }: { onAdd: (op: any) => void }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [variables, setVariables] = useState('');
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

    const handleAdd = () => {
        if (!query.trim()) {
            toast({ variant: 'destructive', title: 'Query is empty' });
            return;
        }
        try {
            const op: { query: string, variables?: any } = { query };
            if (variables.trim()) {
                op.variables = JSON.parse(variables);
            }
            onAdd(op);
            setIsOpen(false);
            setQuery('');
            setVariables('');
        } catch (e) {
            toast({ variant: 'destructive', title: 'Invalid Variables JSON' });
        }
    };
    
    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Operation
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Add Operation to Batch</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className='flex justify-end'>
                             <Button variant="outline" size="sm" onClick={() => setIsAIDialogOpen(true)}>
                                <Bot className="mr-2 h-4 w-4" />
                                Generate with AI
                            </Button>
                        </div>
                        <Textarea placeholder="query..." value={query} onChange={e => setQuery(e.target.value)} className="min-h-[200px] font-code" />
                        <Textarea placeholder="variables (JSON)..." value={variables} onChange={e => setVariables(e.target.value)} className="min-h-[100px] font-code" />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                        <Button onClick={handleAdd}>Add to Batch</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <GenerateWithAIDialog 
                isOpen={isAIDialogOpen} 
                onOpenChange={setIsAIDialogOpen}
                onGenerated={(generatedQuery) => {
                    setQuery(generatedQuery);
                    setIsAIDialogOpen(false);
                }}
            />
        </>
    );
}

function GenerateWithAIDialog({ isOpen, onOpenChange, onGenerated }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onGenerated: (query: string) => void }) {
    const { toast } = useToast();
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!description) {
            toast({ variant: 'destructive', title: 'Description is empty' });
            return;
        }
        setIsLoading(true);
        try {
            const result = await generateGraphQLOperation({
                description,
                operationType: 'query'
            });
            onGenerated(result.graphqlOperation);
        } catch (e) {
            toast({ variant: 'destructive', title: 'AI Generation Failed', description: e instanceof Error ? e.message : 'Unknown error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate GraphQL Operation</DialogTitle>
                    <DialogDescription>Describe the data you want to query, and AI will generate the GraphQL operation for you.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., 'get the name and id of the first 10 users'" />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleGenerate} disabled={isLoading}>
                        {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>}
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
