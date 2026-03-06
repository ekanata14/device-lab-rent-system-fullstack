import { NextResponse } from "next/server";
import { prisma } from "../db";
import { pusherServer } from "@/lib/pusher";

export async function GET() {
  try {
    const printers = await prisma.printer.findMany();
    return NextResponse.json(printers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch printers" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, model, type } = await request.json();

    // Generate a unique alphanumeric ID
    const uniqueSuffix = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    const prefix = type === "computer" ? "COM" : "PRN";
    const id = `${prefix}-${uniqueSuffix}`;

    const newPrinter = await prisma.printer.create({
      data: {
        id,
        name,
        model,
        type: type || "printer",
        status: "available",
      },
    });

    // Notify clients of the update
    await pusherServer.trigger("lab-channel", "printers_updated", {});

    return NextResponse.json(newPrinter, { status: 201 });
  } catch (error) {
    console.error("[POST PRINTER ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create printer" },
      { status: 400 },
    );
  }
}
