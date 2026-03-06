import { NextResponse } from "next/server";
import { prisma } from "../../db";
import { pusherServer } from "@/lib/pusher";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.printer.delete({
      where: { id },
    });

    await pusherServer.trigger("lab-channel", "printers_updated", {});

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete printer" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedPrinter = await prisma.printer.update({
      where: { id },
      data: {
        name: body.name,
        model: body.model,
        ...(body.type !== undefined && { type: body.type }),
      },
    });

    await pusherServer.trigger("lab-channel", "printers_updated", {});

    return NextResponse.json(updatedPrinter, { status: 200 });
  } catch (error) {
    console.error("[PATCH PRINTER ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update printer" },
      { status: 500 },
    );
  }
}
