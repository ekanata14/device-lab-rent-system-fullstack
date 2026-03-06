export type PrinterStatus = "available" | "in-use" | "broken" | "buffer";

export interface UserReservation {
  name: string;
  phone: string;
  studentId: string;
  durationInMinutes: number;
  photoUrl?: string;
  sessionPassword?: string;
  notifyWhenReady?: boolean;
}

export interface UsageLog {
  id: string;
  printerId: string;
  printerName: string;
  userName: string;
  studentId: string;
  usageTime: number; // minutes
  startTime: string;
  endTime: string;
  photoUrl?: string;
  stopReason?: string;
  statusAtEnd: "completed" | "force-stopped" | "broken";
  deviceType?: "printer" | "computer";
}

export interface LabSettings {
  id?: number;
  isManuallyClosed: boolean;
  openTime: string;
  closeTime: string;
  adminPassword?: string;
  bufferMinutes?: number;
  updatedAt?: string;
}

export interface Printer {
  id: string;
  name: string;
  model: string;
  type?: "printer" | "computer";
  status: PrinterStatus;
  endTime?: string;
  bufferEndTime?: string;
  currentUser?: UserReservation;
  nextReservation?: UserReservation;
  brokenReason?: string;
}
