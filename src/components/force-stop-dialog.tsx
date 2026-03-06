"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Printer } from "@/types/printer";
import { ShieldAlert, CircleStop, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_PASSWORD } from "@/lib/constants";

interface ForceStopDialogProps {
  printer: Printer;
  onForceStop: (
    password: string,
    reason?: string,
    clearQueue?: boolean,
  ) => Promise<boolean> | boolean;
  variant: "admin" | "user";
}

export function ForceStopDialog({
  printer,
  onForceStop,
  variant,
}: ForceStopDialogProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [clearQueue, setClearQueue] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (variant === "user" && !reason.trim()) {
      toast({
        variant: "destructive",
        title: "Reason Required",
        description: "Please explain why you are stopping the session.",
      });
      return;
    }

    const success = await onForceStop(password, reason, clearQueue);

    if (success) {
      toast({
        title: "Session Terminated",
        description:
          variant === "admin"
            ? `Admin forced stop on ${printer.name}.`
            : `You successfully stopped your session on ${printer.name}.`,
      });
      setOpen(false);
      setPassword("");
      setReason("");
      setClearQueue(false);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description:
          variant === "admin"
            ? "Incorrect administrative password."
            : "The session password provided is incorrect.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="w-full gap-2">
          <CircleStop className="w-4 h-4" />
          {variant === "admin" ? "Admin Force Stop" : "Stop My Session"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-destructive" />
            {variant === "admin"
              ? "Administrative Override"
              : "Terminate Session"}
          </DialogTitle>
          <DialogDescription>
            {variant === "admin"
              ? "Emergency stop for this printer session. Requires admin privileges."
              : "End your session early. Requires your session password and a reason."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConfirm} className="space-y-4 pt-2">
          <div className="grid gap-2">
            <Label htmlFor="pass">
              {variant === "admin" ? "Admin Password" : "Your Session Password"}
            </Label>
            <PasswordInput
              id="pass"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Stop</Label>
            <Textarea
              id="reason"
              placeholder={
                variant === "admin"
                  ? "e.g. Mechanical failure, lab closing..."
                  : "e.g. Print failed at 20%, nozzle clog..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="bg-muted p-3 rounded-lg flex items-start gap-3 text-xs text-muted-foreground">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Once stopped, a 5-minute maintenance buffer will trigger before
              the next user can start.
            </p>
          </div>

          {variant === "admin" && (
            <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-destructive font-bold text-sm">
                  Clear Queue
                </Label>
                <p className="text-xs text-destructive/80">
                  Also remove the next reservation in queue
                </p>
              </div>
              <Switch
                checked={clearQueue}
                onCheckedChange={setClearQueue}
                className="data-[state=checked]:bg-destructive"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" variant="destructive" className="w-full">
              {variant === "admin"
                ? "Authenticate & Kill Process"
                : "Confirm Stop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
