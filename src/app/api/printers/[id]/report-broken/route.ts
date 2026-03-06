import { NextResponse } from "next/server";
import { prisma } from "../../../db";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { reason } = await request.json();

    const printer = await prisma.printer.findUnique({
      where: { id },
    });

    if (!printer) {
      return NextResponse.json({ error: "Printer not found" }, { status: 404 });
    }

    if (printer.currentUser) {
      const currentUser = printer.currentUser as any;

      // Log the broken usage
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
          stopReason: reason || "Printer broke during use",
          statusAtEnd: "broken",
          deviceType: printer.type,
        },
      });
    }

    const updatedPrinter = await prisma.printer.update({
      where: { id },
      data: {
        status: "broken",
        brokenReason: reason,
        // @ts-ignore
        currentUser: null,
        endTime: null,
      },
    });

    await pusherServer.trigger("lab-channel", "printers_updated", {});

    return NextResponse.json(updatedPrinter, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to report broken" },
      { status: 500 },
    );
  }
}
