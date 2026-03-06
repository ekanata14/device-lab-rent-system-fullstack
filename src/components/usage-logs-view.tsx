"use client";

import { useState } from "react";
import { UsageLog } from "@/types/printer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Info,
  History,
  Edit2,
  Trash2,
  Search,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsageLogsViewProps {
  logs: UsageLog[];
  onEditLog: (id: string, data: Partial<UsageLog>) => void;
  onDeleteLog: (id: string) => void;
}

function EditLogDialog({
  log,
  onSave,
}: {
  log: UsageLog;
  onSave: (id: string, data: Partial<UsageLog>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    userName: log.userName,
    studentId: log.studentId,
    usageTime: log.usageTime,
    statusAtEnd: log.statusAtEnd,
    stopReason: log.stopReason || "",
  });

  const handleSave = () => {
    onSave(log.id, {
      ...data,
      statusAtEnd: data.statusAtEnd as UsageLog["statusAtEnd"],
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary hover:bg-primary/10"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Usage Log</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>User Name</Label>
            <Input
              value={data.userName}
              onChange={(e) => setData({ ...data, userName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Student ID</Label>
            <Input
              value={data.studentId}
              onChange={(e) => setData({ ...data, studentId: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Usage Time (minutes)</Label>
            <Input
              type="number"
              value={data.usageTime}
              onChange={(e) =>
                setData({ ...data, usageTime: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Input
              value={data.statusAtEnd}
              onChange={(e) =>
                setData({
                  ...data,
                  statusAtEnd: e.target.value as UsageLog["statusAtEnd"],
                })
              }
            />
            <p className="text-[10px] text-muted-foreground">
              E.g., completed, force-stopped, broken
            </p>
          </div>
          <div className="space-y-2">
            <Label>Stop Reason</Label>
            <Input
              value={data.stopReason}
              onChange={(e) => setData({ ...data, stopReason: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function UsageLogsView({
  logs,
  onEditLog,
  onDeleteLog,
}: UsageLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "printer" | "computer">(
    "all",
  );

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      log.userName.toLowerCase().includes(query) ||
      log.studentId.toLowerCase().includes(query) ||
      log.printerName.toLowerCase().includes(query) ||
      log.statusAtEnd.toLowerCase().includes(query);

    const typeMatch =
      filterType === "all" || (log.deviceType || "printer") === filterType;
    return searchMatch && typeMatch;
  });

  if (logs.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-xl bg-card/30">
        <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground">No usage history recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, ID, printer, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(val: "all" | "printer" | "computer") =>
            setFilterType(val)
          }
        >
          <SelectTrigger className="h-10 w-full sm:w-[150px]">
            <SelectValue placeholder="All Devices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="printer">3D Printers</SelectItem>
            <SelectItem value="computer">Computers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Printer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No logs found matching "{searchQuery}"
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.userName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {log.studentId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{log.printerName}</span>
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest">
                        {log.deviceType || "PRINTER"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.statusAtEnd === "completed"
                          ? "default"
                          : log.statusAtEnd === "force-stopped"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-[10px] uppercase"
                    >
                      {log.statusAtEnd.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {log.usageTime}m
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(log.endTime), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell>
                    {log.photoUrl && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/20"
                          >
                            <ImageIcon className="w-4 h-4 text-primary" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-primary/30">
                          <img
                            src={log.photoUrl}
                            alt="Session Proof"
                            className="w-full h-auto"
                          />
                          <div className="p-2 bg-muted text-[10px] italic">
                            Photo captured at registration
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {log.stopReason && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3 text-sm">
                            <p className="font-semibold mb-1">Stop Reason:</p>
                            <p className="text-muted-foreground italic text-xs">
                              "{log.stopReason}"
                            </p>
                          </PopoverContent>
                        </Popover>
                      )}
                      <EditLogDialog log={log} onSave={onEditLog} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this usage log? This action cannot be undone.",
                            )
                          ) {
                            onDeleteLog(log.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
