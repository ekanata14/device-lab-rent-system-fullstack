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
import { Printer as PrinterType } from "@/types/printer";
import { Wrench, ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_PASSWORD } from "@/lib/constants";
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

interface AdminFixDialogProps {
  printer: PrinterType;
  onFix: () => void;
}

export function AdminFixDialog({ printer, onFix }: AdminFixDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const executeFix = async () => {
    setIsSubmitting(true);
    try {
      if (password === ADMIN_PASSWORD) {
        await onFix();
        toast({
          title: "Maintenance Logged",
          description: `${printer.name} has been restored to service.`,
        });
        setOpen(false);
        setConfirmOpen(false);
        setPassword("");
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Invalid admin password.",
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
            className="w-full hover:bg-primary/10 border-primary/30"
          >
            <Wrench className="w-4 h-4 mr-2" />
            Mark as Fixed
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-primary" />
              Admin Verification
            </DialogTitle>
            <DialogDescription>
              Only authorized lab staff can mark a printer as operational.
              Please enter the maintenance password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirm} className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="admin-pass">Admin Password</Label>
              <PasswordInput
                id="admin-pass"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary">
                Authenticate & Restore
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Maintenance Resolution</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to mark {printer.name} as fixed and fully
              operational. It will become available for booking again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeFix();
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
                "Mark as Fixed"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
