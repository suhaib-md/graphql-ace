"use client";
import { useState } from 'react';
import type { GqlEnvironment, AuthMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronsUpDown, PlusCircle, Trash2 } from 'lucide-react';

interface EnvironmentManagerProps {
  environments: GqlEnvironment[];
  setEnvironments: (envs: GqlEnvironment[]) => void;
  currentId: string | null;
  setCurrentId: (id: string | null) => void;
}

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;

export function EnvironmentManager({ environments, setEnvironments, currentId, setCurrentId }: EnvironmentManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Partial<GqlEnvironment> | null>(null);

  const currentEnv = environments.find(e => e.id === currentId);

  const handleSave = () => {
    if (!editingEnv?.name || !editingEnv?.url) return;
    
    const newAuthDetails = editingEnv.authDetails || {};

    if (editingEnv.id) { // Update
      setEnvironments(environments.map(e => e.id === editingEnv.id ? { ...editingEnv, authDetails: newAuthDetails } as GqlEnvironment : e));
    } else { // Create
      const newEnv: GqlEnvironment = {
        id: Date.now().toString(),
        name: editingEnv.name,
        url: editingEnv.url,
        authMethod: editingEnv.authMethod || 'None',
        authDetails: newAuthDetails,
      };
      const newEnvironments = [...environments, newEnv];
      setEnvironments(newEnvironments);
      setCurrentId(newEnv.id);
    }
    setIsDialogOpen(false);
    setEditingEnv(null);
  };

  const handleDelete = (id: string) => {
    setEnvironments(environments.filter(e => e.id !== id));
    if (currentId === id) {
      setCurrentId(environments.length > 1 ? environments.filter(e => e.id !== id)[0].id : null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[150px] sm:w-[200px] justify-between">
            <span className="truncate">{currentEnv?.name || 'No Environment'}</span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>Environments</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {environments.map(env => (
            <DropdownMenuItem key={env.id} onClick={() => setCurrentId(env.id)} className="flex justify-between items-center group/item">
              <span>{env.name}</span>
              <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditingEnv(env); setIsDialogOpen(true); }}>
                    <EditIcon />
                    <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(env.id); }}>
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Delete</span>
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
          {environments.length === 0 && <DropdownMenuLabel className="text-xs text-muted-foreground font-normal text-center py-2">No environments set.</DropdownMenuLabel>}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { setEditingEnv({authMethod: "None", authDetails: {}}); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Environment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) setEditingEnv(null); setIsDialogOpen(open);}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEnv?.id ? 'Edit' : 'Add'} Environment</DialogTitle>
            <DialogDescription>Manage your GraphQL API endpoints and authentication.</DialogDescription>
          </DialogHeader>
          {editingEnv && <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={editingEnv.name || ''} onChange={e => setEditingEnv({ ...editingEnv, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">GraphQL Endpoint URL</Label>
              <Input id="url" value={editingEnv.url || ''} onChange={e => setEditingEnv({ ...editingEnv, url: e.target.value })} />
            </div>
            <div className="grid gap-2">
                <Label>Authentication</Label>
                <Select
                    value={editingEnv.authMethod || 'None'}
                    onValueChange={(val: AuthMethod) => setEditingEnv({ ...editingEnv, authMethod: val, authDetails: {} })}
                >
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Bearer Token">Bearer Token</SelectItem>
                        <SelectItem value="API Key">API Key</SelectItem>
                        <SelectItem value="Basic Auth">Basic Auth</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {editingEnv.authMethod === 'Bearer Token' && (
                <div className="grid gap-2">
                    <Label htmlFor="bearer">Bearer Token</Label>
                    <Input id="bearer" value={editingEnv.authDetails?.['Bearer Token'] || ''} onChange={e => setEditingEnv({...editingEnv, authDetails: { 'Bearer Token': e.target.value}})} />
                </div>
            )}
            {editingEnv.authMethod === 'API Key' && (
                <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                        <Label>Key</Label>
                        <Input value={editingEnv.authDetails?.['API Key']?.key || ''} onChange={e => setEditingEnv({...editingEnv, authDetails: {'API Key': { ...editingEnv.authDetails?.['API Key'], key: e.target.value, value: editingEnv.authDetails?.['API Key']?.value || '', addTo: 'Header'}}})} />
                    </div>
                     <div className="grid gap-2">
                        <Label>Value</Label>
                        <Input value={editingEnv.authDetails?.['API Key']?.value || ''} onChange={e => setEditingEnv({...editingEnv, authDetails: {'API Key': { ...editingEnv.authDetails?.['API Key'], value: e.target.value, key: editingEnv.authDetails?.['API Key']?.key || '', addTo: 'Header'}}})} />
                    </div>
                </div>
            )}
            {editingEnv.authMethod === 'Basic Auth' && (
                 <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                        <Label>Username</Label>
                        <Input value={editingEnv.authDetails?.['Basic Auth']?.user || ''} onChange={e => setEditingEnv({...editingEnv, authDetails: {'Basic Auth': { ...editingEnv.authDetails?.['Basic Auth'], user: e.target.value, pass: editingEnv.authDetails?.['Basic Auth']?.pass || ''}}})} />
                    </div>
                     <div className="grid gap-2">
                        <Label>Password</Label>
                        <Input type="password" value={editingEnv.authDetails?.['Basic Auth']?.pass || ''} onChange={e => setEditingEnv({...editingEnv, authDetails: {'Basic Auth': { ...editingEnv.authDetails?.['Basic Auth'], pass: e.target.value, user: editingEnv.authDetails?.['Basic Auth']?.user || ''}}})} />
                    </div>
                </div>
            )}
          </div>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
