"use client";

import { useState, useRef, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, UserReservation } from "@/types/printer";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  RefreshCw,
  Check,
  AlertCircle,
  ShieldCheck,
  Bell,
  Info,
  Loader2,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

interface BookingDialogProps {
  printer: Printer;
  onReserve: (reservation: UserReservation) => void | Promise<void>;
  isQueueMode?: boolean;
  disabled?: boolean;
}

export function BookingDialog({
  printer,
  onReserve,
  isQueueMode = false,
  disabled = false,
}: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    studentId: "",
    duration: "60",
    sessionPassword: "",
    notifyWhenReady: false,
  });

  useEffect(() => {
    if (open && !capturedImage) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
          });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
          setHasCameraPermission(false);
        }
      };
      getCameraPermission();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open, capturedImage]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const resetPhoto = () => {
    setCapturedImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.phone ||
      !formData.studentId ||
      !formData.sessionPassword
    ) {
      toast({
        title: "Incomplete details",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!capturedImage) {
      toast({
        title: "Photo required",
        description: "Please take a verification photo (insurance proof).",
        variant: "destructive",
      });
      return;
    }

    setConfirmOpen(true);
  };

  const executeReservation = async () => {
    setIsSubmitting(true);
    try {
      await onReserve({
        name: formData.name,
        phone: formData.phone,
        studentId: formData.studentId,
        durationInMinutes: parseInt(formData.duration),
        photoUrl: capturedImage || undefined,
        sessionPassword: formData.sessionPassword,
        notifyWhenReady: formData.notifyWhenReady,
      });

      setOpen(false);
      setConfirmOpen(false);
      setCapturedImage(null);
      setFormData({
        name: "",
        phone: "",
        studentId: "",
        duration: "60",
        sessionPassword: "",
        notifyWhenReady: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full"
            variant={isQueueMode ? "secondary" : "default"}
            disabled={disabled}
          >
            {isQueueMode ? "Join Queue" : "Reserve Now"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {isQueueMode ? "Queue Registration" : "Insurance & Reservation"}
            </DialogTitle>
            <DialogDescription>
              {isQueueMode
                ? "Provide a photo of your prep/design and your details to join the queue."
                : `You must take a photo with ${printer.name} to confirm its condition.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black border-2 border-primary/20">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  className="w-full h-full object-cover"
                  alt="Captured"
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              )}

              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                {capturedImage ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetPhoto}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Retake
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={capturePhoto}
                    className="gap-2 bg-primary/80 backdrop-blur-sm"
                    disabled={!hasCameraPermission}
                  >
                    <Camera className="w-4 h-4" /> Capture{" "}
                    {isQueueMode ? "Design Proof" : "Printer Photo"}
                  </Button>
                )}
              </div>
            </div>

            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please enable camera permissions to proceed.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="ID-12345"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="555-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (Min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    min="1"
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sessionPassword">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />{" "}
                      Session Pass
                    </span>
                  </Label>
                  <PasswordInput
                    id="sessionPassword"
                    placeholder="Secret key"
                    value={formData.sessionPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sessionPassword: e.target.value,
                      })
                    }
                  />
                  <div className="flex items-start gap-1.5 mt-1">
                    <Info className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-tight italic">
                      Remember this! You will need it to stop your print early
                      if it fails or if you finish early.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="notify"
                  checked={formData.notifyWhenReady}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      notifyWhenReady: checked === true,
                    })
                  }
                />
                <Label
                  htmlFor="notify"
                  className="text-xs font-normal flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                  Notify me when the printer is ready for my slot
                </Label>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-primary gap-2">
                  <Check className="w-4 h-4" />{" "}
                  {isQueueMode ? "Confirm Queue Spot" : "Confirm & Start"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {isQueueMode ? "Queue Registration" : "Reservation"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isQueueMode
                ? `You are about to join the queue for ${printer.name}. You will be reserving it for ${formData.duration} minutes.`
                : `You are about to start a reservation on ${printer.name} for ${formData.duration} minutes. Make sure the printer is empty and ready.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Review Details
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeReservation();
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
                "Proceed"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
