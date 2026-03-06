"use client";

import { Printer } from "@/types/printer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Image as ImageIcon,
  Users,
  Clock,
  Timer,
} from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import { BookingDialog } from "./booking-dialog";
import { ReportBrokenDialog } from "./report-broken-dialog";
import { AdminFixDialog } from "./admin-fix-dialog";
import { AdminSkipDialog } from "./admin-skip-dialog";
import { ForceStopDialog } from "./force-stop-dialog";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface PrinterCardProps {
  printer: Printer;
  isLabOpen: boolean;
  onReserve: (id: string, reservation: any) => void;
  onQueue: (id: string, reservation: any) => void;
  onForceStop: (
    id: string,
    pass: string,
    reason?: string,
    clearQueue?: boolean,
  ) => Promise<boolean> | boolean;
  onReportBroken: (id: string, reason: string) => void;
  onReset: (id: string) => void;
  onResolve: (
    id: string,
    adminPass?: string,
  ) => Promise<boolean> | boolean | void;
}

export function PrinterCard({
  printer,
  isLabOpen,
  onReserve,
  onQueue,
  onForceStop,
  onReportBroken,
  onReset,
  onResolve,
}: PrinterCardProps) {
  const isAvailable = printer.status === "available";
  const isInUse = printer.status === "in-use";
  const isBroken = printer.status === "broken";
  const isBuffer = printer.status === "buffer";

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 border-2 flex flex-col",
        isAvailable
          ? "border-primary/20 hover:border-primary/50"
          : isInUse
            ? "border-secondary/20 bg-secondary/5 shadow-[0_0_20px_rgba(170,255,220,0.05)]"
            : isBuffer
              ? "border-yellow-500/20 bg-yellow-500/5"
              : "border-destructive/20 bg-destructive/5",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-headline tracking-tight">
              {printer.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              {printer.model}
            </p>
          </div>
          <Badge
            variant={
              isAvailable
                ? "default"
                : isBroken
                  ? "destructive"
                  : isBuffer
                    ? "outline"
                    : "secondary"
            }
            className="uppercase font-bold text-[10px] px-2 py-0.5"
          >
            {printer.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-col gap-3">
          {isAvailable && (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Ready for deployment</span>
            </div>
          )}

          {isBuffer && printer.bufferEndTime && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-500">
                <Timer className="w-5 h-5 animate-spin-slow" />
                <span className="text-sm font-medium">Maintenance Buffer</span>
              </div>
              <CountdownTimer
                endTime={printer.bufferEndTime}
                onFinish={() => onResolve(printer.id)}
              />
              <p className="text-[10px] text-muted-foreground italic">
                Hardware cool-down & calibration in progress
              </p>
            </div>
          )}

          {isInUse && printer.endTime && (
            <div className="space-y-3">
              <CountdownTimer
                endTime={printer.endTime}
                onFinish={() => onResolve(printer.id)}
              />

              {printer.currentUser && (
                <div className="space-y-2 p-3 bg-card border rounded-lg">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <User className="w-3.5 h-3.5 text-secondary" />
                    <span>{printer.currentUser.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary font-bold font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    <a
                      href={`tel:${printer.currentUser.phone}`}
                      className="hover:underline"
                    >
                      {printer.currentUser.phone}
                    </a>
                  </div>

                  {printer.currentUser.photoUrl && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-7 text-[10px] gap-1.5 mt-1 border border-secondary/20"
                        >
                          <ImageIcon className="w-3 h-3" /> View Proof Image
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 border-secondary/30 overflow-hidden">
                        <img
                          src={printer.currentUser.photoUrl}
                          alt="Session Proof"
                          className="w-full h-auto"
                        />
                        <div className="p-2 bg-card text-[10px] text-muted-foreground italic">
                          Condition photo taken at session start
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  <Separator className="my-2" />
                  <ForceStopDialog
                    printer={printer}
                    variant="user"
                    onForceStop={(pass, reason, clearQueue) =>
                      onForceStop(printer.id, pass, reason, clearQueue)
                    }
                  />
                </div>
              )}
            </div>
          )}

          {isBroken && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Maintenance Required
                </span>
              </div>
              {printer.brokenReason && (
                <div className="p-2 bg-background/50 rounded text-[10px] text-destructive/80 italic border border-destructive/10">
                  " {printer.brokenReason} "
                </div>
              )}
            </div>
          )}

          {/* Queue Info */}
          {(isInUse || isBuffer) && (
            <div className="mt-2 pt-2 border-t border-dashed">
              {printer.nextReservation ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    Next: <strong>{printer.nextReservation.name}</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Queue is empty</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex flex-col gap-2 mt-auto">
        {isAvailable && (
          <div className="flex w-full gap-2">
            <BookingDialog
              printer={printer}
              disabled={!isLabOpen}
              onReserve={(res) => onReserve(printer.id, res)}
            />
            <ReportBrokenDialog
              printer={printer}
              onReport={(reason) => onReportBroken(printer.id, reason)}
            />
          </div>
        )}

        {isInUse && !printer.nextReservation && (
          <div className="flex flex-col w-full gap-2">
            <BookingDialog
              printer={printer}
              isQueueMode
              disabled={!isLabOpen}
              onReserve={(res) => onQueue(printer.id, res)}
            />
            <ForceStopDialog
              printer={printer}
              variant="admin"
              onForceStop={(pass, reason, clearQueue) =>
                onForceStop(printer.id, pass, reason, clearQueue)
              }
            />
          </div>
        )}

        {(isInUse || isBuffer) && printer.nextReservation && (
          <div className="flex flex-col w-full gap-2">
            <ForceStopDialog
              printer={printer}
              variant="admin"
              onForceStop={(pass, reason, clearQueue) =>
                onForceStop(printer.id, pass, reason, clearQueue)
              }
            />
            {isBuffer && (
              <AdminSkipDialog
                printer={printer}
                onSkip={(pass) =>
                  onResolve(printer.id, pass) as Promise<boolean>
                }
              />
            )}
          </div>
        )}

        {isBuffer && !printer.nextReservation && (
          <div className="flex flex-col w-full gap-2">
            <BookingDialog
              printer={printer}
              isQueueMode
              disabled={!isLabOpen}
              onReserve={(res) => onQueue(printer.id, res)}
            />
            <ForceStopDialog
              printer={printer}
              variant="admin"
              onForceStop={(pass, reason, clearQueue) =>
                onForceStop(printer.id, pass, reason, clearQueue)
              }
            />
            <AdminSkipDialog
              printer={printer}
              onSkip={(pass) => onResolve(printer.id, pass) as Promise<boolean>}
            />
          </div>
        )}

        {isBroken && (
          <AdminFixDialog printer={printer} onFix={() => onReset(printer.id)} />
        )}
      </CardFooter>
    </Card>
  );
}
