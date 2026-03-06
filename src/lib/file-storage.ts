import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Saves a base64 string to a predefined local /public/uploads/ folder.
 *
 * @param base64String Raw Base64 or DataURL String
 * @param directory Target Subdirectory (e.g. "reservations")
 * @returns The relative /uploads/... URL path to serve
 */
export async function saveBase64Image(
  base64String: string,
  directory: string = "reservations",
): Promise<string> {
  // If no photo or already stored as standard URL, ignore decoding
  if (!base64String || !base64String.startsWith("data:image")) {
    return base64String;
  }

  // Parse mime type and decode base64 string
  // Format: data:image/jpeg;base64,/9j/4AAQ...
  const matches = base64String.match(
    /^data:image\/([A-Za-z-+\/]+);base64,(.+)$/,
  );

  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image data");
  }

  const extension = matches[1] === "jpeg" ? "jpg" : matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  const fileName = `${Date.now()}-${uuidv4()}.${extension}`;

  // Resolve path relative to process.cwd()
  const targetDir = path.join(process.cwd(), "uploads", directory);
  const filePath = path.join(targetDir, fileName);

  try {
    // Ensure directory exists
    await mkdir(targetDir, { recursive: true });

    // Write buffer via Promise I/O
    await writeFile(filePath, buffer);

    // Return URL meant for the API fetching
    return `/api/uploads/${directory}/${fileName}`;
  } catch (error) {
    console.error("Failed to save base64 image:", error);
    throw new Error("Disk I/O failure while saving image");
  }
}
