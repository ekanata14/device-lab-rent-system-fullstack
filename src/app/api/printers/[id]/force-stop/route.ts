import { NextResponse } from "next/server";
import { prisma } from "../../../db";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { password, reason, clearQueue } = await request.json();

    const printer = await prisma.printer.findUnique({
      where: { id },
    });

    if (!printer) {
      return NextResponse.json({ error: "Printer not found" }, { status: 404 });
    }

    if (
      printer.status !== "buffer" &&
      !printer.currentUser &&
      !printer.nextReservation
    ) {
      return NextResponse.json(
        { error: "No active reservation, queue, or buffer to stop" },
        { status: 400 },
      );
    }

    const currentUser = printer.currentUser as any;

    const labSettings = await prisma.labSettings.findUnique({
      where: { id: 1 },
    });
    const globalAdminPass = labSettings?.adminPassword || "admin123";

    // Verify Password
    const isUserPassMatch =
      currentUser &&
      currentUser.sessionPassword &&
      currentUser.sessionPassword === password;
    const isAdminPassMatch = password === globalAdminPass;

    if (!isUserPassMatch && !isAdminPassMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 },
      );
    }

    if (currentUser) {
      // Log the usage
      await prisma.usageLog.create({
        data: {
          printerId: printer.id,
          printerName: printer.name,
          userName: currentUser.name,
          studentId: currentUser.studentId,
          usageTime: currentUser.durationInMinutes,
          startTime: new Date(
            new Date(printer.endTime!).getTime() -
              currentUser.durationInMinutes * 60000,
          ),
          endTime: new Date(),
          photoUrl: currentUser.photoUrl || null,
          stopReason: reason || "User finished",
          statusAtEnd: reason ? "force-stopped" : "completed",
        },
      });
    }

    let newStatus = "available";
    let newBufferEndTime = null;
    let newCurrentUser = null;
    let newEndTime = null;
    let newNextReservation = clearQueue ? null : printer.nextReservation;

    const bufferMinutes = labSettings?.bufferMinutes ?? 5;

    // Determine the status after force stopping
    if (currentUser && !clearQueue) {
      newStatus = "buffer";
      newBufferEndTime = new Date(Date.now() + bufferMinutes * 60000);
    } else if (
      printer.status === "buffer" &&
      !clearQueue &&
      printer.nextReservation
    ) {
      newStatus = "buffer";
      newBufferEndTime = printer.bufferEndTime;
    }

    const updatedPrinter = await prisma.printer.update({
      where: { id },
      data: {
        status: newStatus,
        bufferEndTime: newBufferEndTime,
        // @ts-ignore
        currentUser: newCurrentUser,
        endTime: newEndTime,
        // @ts-ignore
        nextReservation: newNextReservation,
      },
    });

    await pusherServer.trigger("lab-channel", "printers_updated", {});

    return NextResponse.json(
      { success: true, printer: updatedPrinter },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to force stop" },
      { status: 500 },
    );
  }
}
