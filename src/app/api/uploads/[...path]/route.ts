import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: routePath } = await params;

    const filePath = path.join(process.cwd(), "uploads", ...routePath);

    // Security check to prevent directory traversal
    if (!filePath.startsWith(path.join(process.cwd(), "uploads"))) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      // Fallback check in case they are from previous public/uploads directory
      const fallbackPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        ...routePath,
      );
      if (fs.existsSync(fallbackPath)) {
        const fileBuffer = await readFile(fallbackPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: getHeaders(fallbackPath),
        });
      }
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: getHeaders(filePath),
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function getHeaders(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".webp") contentType = "image/webp";
  else if (ext === ".gif") contentType = "image/gif";

  return {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  };
}
