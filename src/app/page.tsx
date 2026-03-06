"use client";

import { useState, useEffect } from "react";
import { usePrinters } from "@/hooks/use-printers";
import { PrinterCard } from "@/components/printer-card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutGrid,
  List,
  Activity,
  Settings,
  Clock,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminGuard } from "@/components/admin-guard";
import { UsageLogsView } from "@/components/usage-logs-view";
import { LabConfigView } from "@/components/lab-config-view";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { WelcomeModal } from "@/components/welcome-modal";
import { ClosedModal } from "@/components/closed-modal";
import logoIdig from "../../public/asssets/images/logo-idig.png";

export default function Home() {
  const {
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
  } = usePrinters();

  const [isMounted, setIsMounted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const labStatus = getLabStatus();
  const isLabOpen = labStatus === "operational";

  const availableCount = printers.filter(
    (p) => p.status === "available",
  ).length;
  const inUseCount = printers.filter((p) => p.status === "in-use").length;
  const bufferCount = printers.filter((p) => p.status === "buffer").length;
  const brokenCount = printers.filter((p) => p.status === "broken").length;

  const logoData = PlaceHolderImages.find((img) => img.id === "lab-logo");

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeModal open={showWelcome} onOpenChange={setShowWelcome} />
      <ClosedModal labStatus={getLabStatus()} />
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg border border-white/10 overflow-hidden relative">
              <Image
                src={logoIdig}
                alt="Logo"
                fill
                className="object-contain p-1"
              />{" "}
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold text-foreground leading-tight tracking-tight">
                Lab iDIG | HealthTech
              </h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] opacity-80">
                Teknologi Kedokteran
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setShowWelcome(true)}
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors font-medium border rounded-md px-3 py-1.5 shadow-sm bg-card hover:bg-muted"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Guide</span>
            </button>
            <ThemeToggle />
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                Access Status
              </span>
              {isMounted ? (
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isLabOpen
                        ? "bg-secondary animate-pulse"
                        : "bg-destructive",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase",
                      isLabOpen ? "text-secondary" : "text-destructive",
                    )}
                  >
                    {isLabOpen ? "Operational" : "Closed"}
                  </span>
                </div>
              ) : (
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Dashboard Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <TabsList className="bg-card border h-10">
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutGrid className="w-4 h-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <List className="w-4 h-4" /> Usage Logs
              </TabsTrigger>
              <TabsTrigger value="config" className="gap-2">
                <Settings className="w-4 h-4" /> Config
              </TabsTrigger>
            </TabsList>

            {isMounted && !isLabOpen && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-full border border-destructive/20 animate-pulse">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold uppercase text-[10px]">
                  Restricted: Lab is currently closed
                </span>
              </div>
            )}
          </div>

          <TabsContent value="dashboard" className="m-0 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-card p-4 rounded-xl border border-primary/20 flex flex-col justify-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                  Total Units
                </span>
                <span className="text-2xl font-headline font-bold">
                  {printers.length}
                </span>
              </div>
              <div className="bg-card p-4 rounded-xl border border-primary/20 flex flex-col justify-center">
                <span className="text-[10px] text-primary uppercase tracking-wider font-semibold mb-1">
                  Available
                </span>
                <span className="text-2xl font-headline font-bold text-primary">
                  {availableCount}
                </span>
              </div>
              <div className="bg-card p-4 rounded-xl border border-secondary/20 flex flex-col justify-center">
                <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold mb-1">
                  Active
                </span>
                <span className="text-2xl font-headline font-bold text-secondary">
                  {inUseCount}
                </span>
              </div>
              <div className="bg-card p-4 rounded-xl border border-yellow-500/20 flex flex-col justify-center">
                <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-semibold mb-1">
                  Buffer/Prep
                </span>
                <span className="text-2xl font-headline font-bold text-yellow-500">
                  {bufferCount}
                </span>
              </div>
              <div className="bg-card p-4 rounded-xl border border-destructive/20 flex flex-col justify-center">
                <span className="text-[10px] text-destructive uppercase tracking-wider font-semibold mb-1">
                  Offline
                </span>
                <span className="text-2xl font-headline font-bold text-destructive">
                  {brokenCount}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {printers.map((printer) => (
                <PrinterCard
                  key={printer.id}
                  printer={printer}
                  isLabOpen={isLabOpen}
                  onReserve={reservePrinter}
                  onQueue={queueReservation}
                  onForceStop={forceStop}
                  onReportBroken={reportBroken}
                  onReset={resetPrinter}
                  onResolve={resolvePrinter}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <AdminGuard>
              <UsageLogsView
                logs={logs}
                onEditLog={editLog}
                onDeleteLog={deleteLog}
              />
            </AdminGuard>
          </TabsContent>

          <TabsContent value="config">
            <AdminGuard>
              <LabConfigView
                settings={labSettings}
                printers={printers}
                onUpdate={setLabSettings}
                onAddPrinter={addPrinter}
                onRemovePrinter={removePrinter}
                onEditPrinter={editPrinter}
              />
            </AdminGuard>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-card/30 py-6 mt-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>&copy; 2026 Lab iDIG HealtTech</span>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Lab Hours: {labSettings.openTime} - {labSettings.closeTime}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
