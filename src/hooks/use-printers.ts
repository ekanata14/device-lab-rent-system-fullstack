"use client";

import { useState, useEffect, useCallback } from "react";
import Pusher from "pusher-js";
import {
  Printer,
  UserReservation,
  UsageLog,
  LabSettings,
} from "@/types/printer";
import { useToast } from "@/hooks/use-toast";
import { playNotificationSound } from "@/lib/audio";

const API_BASE_URL = "/api";

export function usePrinters() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [labSettings, setLabSettingsState] = useState<LabSettings>({
    isManuallyClosed: false,
    openTime: "08:00",
    closeTime: "17:00",
  });

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [printersRes, logsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/printers`),
        fetch(`${API_BASE_URL}/logs`),
        fetch(`${API_BASE_URL}/settings`),
      ]);
      const p = await printersRes.json();
      const l = await logsRes.json();
      const s = await settingsRes.json();
      if (Array.isArray(p)) setPrinters(p);
      if (Array.isArray(l)) setLogs(l);
      if (s && !s.error) setLabSettingsState(s);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Connect to Pusher
    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy-key",
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
      },
    );

    pusher.connection.bind("connected", () => {
      console.log("🟢 Pusher Realtime: Connected!");
    });

    pusher.connection.bind("error", (err: any) => {
      console.error("🔴 Pusher Error:", err);
    });

    const channel = pusher.subscribe("lab-channel");
    channel.bind("printers_updated", () => {
      console.log(
        "⚡ [Realtime event] printers_updated received! Fetching fresh data...",
      );
      fetchData();
    });

    return () => {
      console.log("🔴 Pusher Realtime: Disconnecting...");
      pusher.unsubscribe("lab-channel");
    };
  }, [fetchData]);

  const setLabSettings = useCallback(
    async (settings: LabSettings) => {
      await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setLabSettingsState(settings);
      toast({
        title: "Settings Updated",
        description: "Lab settings have been saved.",
      });
    },
    [toast],
  );

  const getLabStatus = useCallback(() => {
    if (labSettings.isManuallyClosed) return "closed";
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    if (
      currentTime < labSettings.openTime ||
      currentTime > labSettings.closeTime
    )
      return "closed";
    return "operational";
  }, [labSettings]);

  const reservePrinter = useCallback(
    async (printerId: string, reservation: UserReservation) => {
      await fetch(`${API_BASE_URL}/printers/${printerId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation),
      });
      playNotificationSound("start");
      fetchData();
    },
    [fetchData],
  );

  const queueReservation = useCallback(
    async (printerId: string, reservation: UserReservation) => {
      await fetch(`${API_BASE_URL}/printers/${printerId}/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation),
      });
      toast({
        title: "Joined Queue",
        description: "Success! You are next in line.",
      });
      playNotificationSound("queue");
      fetchData();
    },
    [toast, fetchData],
  );

  const forceStop = useCallback(
    async (
      printerId: string,
      password: string,
      reason?: string,
      clearQueue?: boolean,
    ) => {
      const res = await fetch(
        `${API_BASE_URL}/printers/${printerId}/force-stop`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, reason, clearQueue }),
        },
      );
      const data = await res.json();
      if (data.success) {
        playNotificationSound("stop");
        fetchData();
        return true;
      }
      return false;
    },
    [fetchData],
  );

  const reportBroken = useCallback(
    async (printerId: string, reason: string) => {
      await fetch(`${API_BASE_URL}/printers/${printerId}/report-broken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      fetchData();
    },
    [fetchData],
  );

  const resetPrinter = useCallback(
    async (printerId: string) => {
      await fetch(`${API_BASE_URL}/printers/${printerId}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      fetchData();
    },
    [fetchData],
  );

  const resolvePrinter = useCallback(
    async (printerId: string, adminPassword?: string) => {
      const res = await fetch(`${API_BASE_URL}/printers/${printerId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: adminPassword ? JSON.stringify({ adminPassword }) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        if (adminPassword) {
          return false;
        }
        return false;
      }
      playNotificationSound("finish");
      fetchData();
      return true;
    },
    [fetchData],
  );

  const addPrinter = useCallback(
    async (name: string, model: string, type: "printer" | "computer") => {
      await fetch(`${API_BASE_URL}/printers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, model, type }),
      });
      toast({
        title: "Printer Added",
        description: `${name} (${model}) is now in the fleet.`,
      });
      fetchData();
    },
    [toast, fetchData],
  );

  const removePrinter = useCallback(
    async (id: string) => {
      await fetch(`${API_BASE_URL}/printers/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Printer Removed",
        description: "The unit has been removed.",
      });
      fetchData();
    },
    [toast, fetchData],
  );

  const editPrinter = useCallback(
    async (id: string, data: Partial<Printer>) => {
      await fetch(`${API_BASE_URL}/printers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast({
        title: "Printer Updated",
        description: "The unit details have been modified.",
      });
      fetchData();
    },
    [toast, fetchData],
  );

  const editLog = useCallback(
    async (id: string, data: Partial<UsageLog>) => {
      await fetch(`${API_BASE_URL}/logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast({
        title: "Log Updated",
        description: "The usage session details were saved.",
      });
      fetchData();
    },
    [toast, fetchData],
  );

  const deleteLog = useCallback(
    async (id: string) => {
      await fetch(`${API_BASE_URL}/logs/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Log Deleted",
        description: "The historical record has been removed.",
      });
      fetchData();
    },
    [toast, fetchData],
  );

  return {
    printers,
    logs,
    labSettings,
    setLabSettings,
    reservePrinter,
    queueReservation,
    forceStop,
    reportBroken,
    resetPrinter,
    getLabStatus,
    addPrinter,
    removePrinter,
    resolvePrinter,
    editPrinter,
    editLog,
    deleteLog,
  };
}
