"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";

interface ClosedModalProps {
  labStatus: "operational" | "closed";
}

export function ClosedModal({ labStatus }: ClosedModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show if the lab is closed and the user hasn't explicitly dismissed this session's warning yet
    if (
      labStatus === "closed" &&
      !sessionStorage.getItem("acknowledgedClosed")
    ) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [labStatus]);

  const handleAcknowledge = () => {
    sessionStorage.setItem("acknowledgedClosed", "true");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="border-destructive/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <LockKeyhole className="w-6 h-6" />
            The Lab is Currently Closed
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-foreground/80 mt-2">
            The 3D printing lab is currently outside of operational hours or has
            been manually locked by an administrator for maintenance.
            <br className="my-2" />
            You may <b>view</b> the current status of the devices and existing
            queues, but you <b>cannot</b> make any new reservations at this
            time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction
            onClick={handleAcknowledge}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Acknowledge (View Only Mode)
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
