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
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Clock,
  ShieldAlert,
  Plus,
  Trash2,
  Printer as PrinterIcon,
  Loader2,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LabConfigViewProps {
  settings: LabSettings;
  printers: Printer[];
  onUpdate: (settings: LabSettings) => void;
  onAddPrinter: (
    name: string,
    model: string,
    type: "printer" | "computer",
  ) => void;
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
  const [newPrinter, setNewPrinter] = useState<{
    name: string;
    model: string;
    type: "printer" | "computer";
  }>({
    name: "",
    model: "",
    type: "printer",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "printer" | "computer">(
    "all",
  );
  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);
  const [editPrinterData, setEditPrinterData] = useState<{
    name: string;
    model: string;
    type?: "printer" | "computer";
  }>({
    name: "",
    model: "",
    type: "printer",
  });

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: "save" | "add" | "remove" | "edit" | null;
    printerId?: string;
  }>({ open: false, action: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSetting = (key: keyof LabSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const executeAction = async () => {
    setIsSubmitting(true);
    try {
      switch (confirmState.action) {
        case "save":
          await onUpdate(localSettings);
          setHasChanges(false);
          break;
        case "add":
          if (newPrinter.name && newPrinter.model) {
            await onAddPrinter(
              newPrinter.name,
              newPrinter.model,
              newPrinter.type,
            );
            setNewPrinter({ name: "", model: "", type: "printer" });
          }
          break;
        case "edit":
          if (confirmState.printerId) {
            await onEditPrinter(confirmState.printerId, editPrinterData);
            setEditingPrinterId(null);
          }
          break;
        case "remove":
          if (confirmState.printerId) {
            await onRemovePrinter(confirmState.printerId);
          }
          break;
      }
    } finally {
      setIsSubmitting(false);
      setConfirmState({ open: false, action: null });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrinter.name && newPrinter.model) {
      setConfirmState({ open: true, action: "add" });
    }
  };

  const filteredPrinters = printers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || p.type === filterType;
    return matchesSearch && matchesType;
  });

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
            className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-dashed"
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
            <div className="space-y-2">
              <Label>Device Type</Label>
              <Select
                value={newPrinter.type}
                onValueChange={(val: "printer" | "computer") =>
                  setNewPrinter({ ...newPrinter, type: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="printer">3D Printer</SelectItem>
                  <SelectItem value="computer">Computer</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Active Fleet ({filteredPrinters.length})
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 max-w-[200px]"
                />
                <Select
                  value={filterType}
                  onValueChange={(val: "all" | "printer" | "computer") =>
                    setFilterType(val)
                  }
                >
                  <SelectTrigger className="h-8 w-[130px]">
                    <SelectValue placeholder="All Devices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="printer">3D Printers</SelectItem>
                    <SelectItem value="computer">Computers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              {filteredPrinters.map((p) => (
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
                      <Select
                        value={editPrinterData.type || "printer"}
                        onValueChange={(val: "printer" | "computer") =>
                          setEditPrinterData({
                            ...editPrinterData,
                            type: val,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-[120px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="printer">3D Printer</SelectItem>
                          <SelectItem value="computer">Computer</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            setConfirmState({
                              open: true,
                              action: "edit",
                              printerId: p.id,
                            });
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
                        <span className="text-xs text-muted-foreground mr-2">
                          {p.model}
                        </span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {p.type || "PRINTER"}
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
                              type: p.type || "printer",
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setConfirmState({
                              open: true,
                              action: "remove",
                              printerId: p.id,
                            })
                          }
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
              <PasswordInput
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
              onClick={() => setConfirmState({ open: true, action: "save" })}
              disabled={!hasChanges}
              className="px-8"
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmState.open}
        onOpenChange={(open) => {
          if (!open) setConfirmState({ open: false, action: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState.action === "save" &&
                "You are about to modify global lab settings."}
              {confirmState.action === "add" &&
                "You are adding a new 3D printer to the lab."}
              {confirmState.action === "edit" &&
                "You are modifying the details of an existing printer."}
              {confirmState.action === "remove" &&
                "This action cannot be undone. This will permanently delete the printer and its queue history."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeAction();
              }}
              disabled={isSubmitting}
              className={
                confirmState.action === "remove"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
