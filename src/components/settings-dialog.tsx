"use client";

import type { Settings as AppSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';

interface SettingsDialogProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

export function SettingsDialog({ settings, setSettings }: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} aria-label="Open Settings">
            <SettingsIcon className="h-4 w-4" />
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>Manage application preferences.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="auto-format" className="flex flex-col gap-1">
                            <span>Auto-format Query</span>
                            <span className="font-normal text-muted-foreground text-xs">Automatically format query on run.</span>
                        </Label>
                        <Switch
                            id="auto-format"
                            checked={settings.autoFormat}
                            onCheckedChange={val => setSettings({ ...settings, autoFormat: val })}
                            disabled
                        />
                    </div>
                    <div className="flex items-center justify-between">
                         <Label htmlFor="theme">Theme</Label>
                         <Select
                            value={settings.theme}
                            onValueChange={(val: 'light' | 'dark' | 'system') => setSettings({ ...settings, theme: val })}
                         >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                         </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsOpen(false)}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
