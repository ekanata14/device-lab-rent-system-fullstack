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
import { Printer } from "@/types/printer";
import { FastForward, ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface AdminSkipDialogProps {
  printer: Printer;
  onSkip: (password: string) => Promise<boolean> | boolean;
}

export function AdminSkipDialog({ printer, onSkip }: AdminSkipDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const executeSkip = async () => {
    setIsSubmitting(true);
    try {
      const success = await onSkip(password);

      if (success) {
        toast({
          title: "Buffer Skipped",
          description: `Admin skipped buffer for ${printer.name}.`,
        });
        setOpen(false);
        setConfirmOpen(false);
        setPassword("");
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Password",
          description: "Incorrect administrative password.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-600"
          >
            <FastForward className="w-4 h-4" />
            Admin Skip Buffer
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-yellow-500" />
              Administrative Override
            </DialogTitle>
            <DialogDescription>
              Skip the maintenance buffer and make this printer available (or
              start next queue).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirm} className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="skip-pass">Admin Password</Label>
              <PasswordInput
                id="skip-pass"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Authenticate & Skip
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Skip Buffer</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to skip the maintenance buffer for {printer.name}.
              It will immediately be available or start the next queued
              reservation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeSkip();
              }}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Skip Buffer Now"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
