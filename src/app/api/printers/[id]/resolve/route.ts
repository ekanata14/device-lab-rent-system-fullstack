import { NextResponse } from "next/server";
import { prisma } from "../../../db";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bodyText = await request.text();
    let body = {};
    if (bodyText) {
      try {
        body = JSON.parse(bodyText);
      } catch (e) {}
    }
    const { adminPassword } = body as any;

    const printer = await prisma.printer.findUnique({
      where: { id },
    });

    if (!printer) {
      return NextResponse.json({ error: "Printer not found" }, { status: 404 });
    }

    if (
      !["in-use", "buffer"].includes(printer.status) ||
      (!printer.endTime && !printer.bufferEndTime)
    ) {
      return NextResponse.json(
        { error: "Printer doesn't have an active resolvable status or timer." },
        { status: 400 },
      );
    }

    const labSettings = await prisma.labSettings.findUnique({
      where: { id: 1 },
    });
    const globalAdminPass = labSettings?.adminPassword || "admin123";

    const timerToCompare =
      printer.status === "in-use" ? printer.endTime : printer.bufferEndTime;
    const now = new Date();

    // Only check timer if no valid admin password is provided
    if (new Date(timerToCompare!) > now && adminPassword !== globalAdminPass) {
      if (adminPassword) {
        return NextResponse.json(
          { error: "Invalid admin password" },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { error: "Time has not expired yet" },
        { status: 400 },
      );
    }

    let updatedPrinter;

    if (printer.status === "in-use") {
      const currentUser = printer.currentUser as any;
      if (currentUser && printer.endTime) {
        // Log the usage
        await prisma.usageLog.create({
          data: {
            printerId: printer.id,
            printerName: printer.name,
            userName: currentUser.name,
            studentId: currentUser.studentId,
            usageTime: currentUser.durationInMinutes,
            startTime: new Date(
              new Date(printer.endTime).getTime() -
                currentUser.durationInMinutes * 60000,
            ),
            endTime: new Date(),
            photoUrl: currentUser.photoUrl || null,
            stopReason: "Time Expired",
            statusAtEnd: "completed",
            deviceType: printer.type,
          },
        });
      }

      const bufferMinutes = labSettings?.bufferMinutes ?? 5;

      updatedPrinter = await prisma.printer.update({
        where: { id },
        data: {
          status: "buffer",
          bufferEndTime: new Date(Date.now() + bufferMinutes * 60000),
          // @ts-ignore
          currentUser: null,
          endTime: null,
        },
      });
    } else if (printer.status === "buffer") {
      const nextRes = printer.nextReservation as any;
      if (nextRes) {
        const newEndTime = new Date(
          Date.now() + nextRes.durationInMinutes * 60000,
        );
        updatedPrinter = await prisma.printer.update({
          where: { id },
          data: {
            status: "in-use",
            // @ts-ignore
            currentUser: nextRes,
            endTime: newEndTime,
            bufferEndTime: null,
            // @ts-ignore
            nextReservation: null,
          },
        });
      } else {
        updatedPrinter = await prisma.printer.update({
          where: { id },
          data: {
            status: "available",
            bufferEndTime: null,
          },
        });
      }
    }

    await pusherServer.trigger("lab-channel", "printers_updated", {});

    return NextResponse.json(
      { success: true, printer: updatedPrinter },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to resolve time expiration" },
      { status: 500 },
    );
  }
}
