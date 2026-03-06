"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    if (open) {
      setUnderstood(localStorage.getItem("hasSeenWelcome") === "true");
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (understood) {
        localStorage.setItem("hasSeenWelcome", "true");
      } else {
        localStorage.removeItem("hasSeenWelcome");
      }
    }
    onOpenChange(newOpen);
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            Welcome to Lab iDIG HealtTech! 🖨️
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Our automated lab reservation system makes it easy to use the 3D
            printers. Here is a quick guide on how to get started:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full mt-1">
              <Printer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                1. Check Availability
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Browse the dashboard to see which printers are online. A green
                "Available" status means the printer is ready for immediate use.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full mt-1">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                2. Reserve or Queue
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Reserve" on an available printer, fill out your details,
                and take a quick photo of the empty build plate. If it’s busy,
                click "Join Queue"!
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full mt-1">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                3. Finish & Force Stop
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Remember your <b>Session Password</b>! You need it to end your
                session early or force-stop the printer if a print fails. Once a
                session ends, the printer goes into a brief cooldown buffer.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 items-start pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="understood"
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked === true)}
              />
              <Label
                htmlFor="understood"
                className="text-sm font-medium cursor-pointer"
              >
                I have read and understood the guide. Don't show this
                automatically again.
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {understood ? "I understand, let's go!" : "Close Guide"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
