"use client";

import { useState } from "react";
import { LabSettings, Printer } from "@/types/printer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Clock,
  ShieldAlert,
  Plus,
  Trash2,
  Printer as PrinterIcon,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface LabConfigViewProps {
  settings: LabSettings;
  printers: Printer[];
  onUpdate: (settings: LabSettings) => void;
  onAddPrinter: (name: string, model: string) => void;
  onRemovePrinter: (id: string) => void;
  onEditPrinter: (id: string, data: Partial<Printer>) => void;
}

export function LabConfigView({
  settings,
  printers,
  onUpdate,
  onAddPrinter,
  onRemovePrinter,
  onEditPrinter,
}: LabConfigViewProps) {
  const [localSettings, setLocalSettings] = useState<LabSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [newPrinter, setNewPrinter] = useState({ name: "", model: "" });
  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);
  const [editPrinterData, setEditPrinterData] = useState({
    name: "",
    model: "",
  });

  const updateSetting = (key: keyof LabSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    onUpdate(localSettings);
    setHasChanges(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrinter.name && newPrinter.model) {
      onAddPrinter(newPrinter.name, newPrinter.model);
      setNewPrinter({ name: "", model: "" });
    }
  };

  return (
    <div className="grid gap-8 max-w-4xl mx-auto pb-20">
      {/* Manual Override */}
      <Card className="border-destructive/30 bg-destructive/5 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-6 h-6" />
            Emergency Control
          </CardTitle>
          <CardDescription>
            Force the lab status to "Closed" immediately, overriding all
            schedules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border">
            <div className="space-y-0.5">
              <Label className="text-lg">Immediate Lab Closure</Label>
              <p className="text-sm text-muted-foreground">
                Locks all printer interactions for students.
              </p>
            </div>
            <Switch
              checked={localSettings.isManuallyClosed}
              onCheckedChange={(c) => updateSetting("isManuallyClosed", c)}
              className="data-[state=checked]:bg-destructive"
            />
          </div>

          {localSettings.isManuallyClosed && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lab is Locked</AlertTitle>
              <AlertDescription>
                Students can currently view status but cannot initiate any
                reservations or queue requests.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Fleet Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PrinterIcon className="w-6 h-6 text-primary" />
            Fleet Management
          </CardTitle>
          <CardDescription>
            Manage the list of available 3D printers in the lab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-dashed"
          >
            <div className="space-y-2">
              <Label htmlFor="p-name">Printer Name</Label>
              <Input
                id="p-name"
                placeholder="e.g. Ender-11"
                value={newPrinter.name}
                onChange={(e) =>
                  setNewPrinter({ ...newPrinter, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-model">Model</Label>
              <Input
                id="p-model"
                placeholder="e.g. Creality Ender 3 V3"
                value={newPrinter.model}
                onChange={(e) =>
                  setNewPrinter({ ...newPrinter, model: e.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full bg-primary"
                disabled={!newPrinter.name || !newPrinter.model}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Unit
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Active Fleet ({printers.length})
            </h3>
            <div className="grid gap-2">
              {printers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-card border rounded-lg hover:border-primary/30 transition-colors"
                >
                  {editingPrinterId === p.id ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 mr-2">
                      <Input
                        value={editPrinterData.name}
                        onChange={(e) =>
                          setEditPrinterData({
                            ...editPrinterData,
                            name: e.target.value,
                          })
                        }
                        className="h-8"
                        placeholder="Name"
                      />
                      <Input
                        value={editPrinterData.model}
                        onChange={(e) =>
                          setEditPrinterData({
                            ...editPrinterData,
                            model: e.target.value,
                          })
                        }
                        className="h-8"
                        placeholder="Model"
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            onEditPrinter(p.id, editPrinterData);
                            setEditingPrinterId(null);
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingPrinterId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-bold mr-2">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.model}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            setEditingPrinterId(p.id);
                            setEditPrinterData({
                              name: p.name,
                              model: p.model,
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemovePrinter(p.id)}
                          className="h-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Schedule & Security</CardTitle>
          <CardDescription>
            Configure operating hours and administration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Opening Time</Label>
              <Input
                type="time"
                value={localSettings.openTime}
                onChange={(e) => updateSetting("openTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Closing Time</Label>
              <Input
                type="time"
                value={localSettings.closeTime}
                onChange={(e) => updateSetting("closeTime", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Global Admin Password
              </Label>
              <Input
                type="password"
                placeholder="admin123"
                value={localSettings.adminPassword || ""}
                onChange={(e) => updateSetting("adminPassword", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Allows force stop and resolving queue blocks.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Queue Buffer (Minutes)
              </Label>
              <Input
                type="number"
                min={0}
                max={60}
                placeholder="5"
                value={
                  localSettings.bufferMinutes === undefined
                    ? 5
                    : localSettings.bufferMinutes
                }
                onChange={(e) =>
                  updateSetting("bufferMinutes", parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                Cooldown duration between reservations.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className="px-8"
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
