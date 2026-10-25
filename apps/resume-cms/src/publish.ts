import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { auth, drive, type drive_v3 } from "@googleapis/drive";

interface PublishOptions {
  pdf: Buffer<ArrayBuffer>;
  fileId: string | undefined;
}

interface PublishResult {
  fileId: string;
  changed: boolean;
}

interface DriveFiles {
  get(
    params: drive_v3.Params$Resource$Files$Get,
  ): Promise<drive_v3.Schema$File>;
  update(
    params: drive_v3.Params$Resource$Files$Update,
  ): Promise<drive_v3.Schema$File>;
}

type CreateDriveFiles = () => DriveFiles;

function createDriveFiles(): DriveFiles {
  // The auth action supplies federated Application Default Credentials in CI.
  const credentials = new auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  const client = drive({ auth: credentials, version: "v3" });
  return {
    get: async (params) =>
      (await client.files.get(params, { timeout: 30_000 })).data,
    update: async (params) =>
      (await client.files.update(params, { timeout: 60_000 })).data,
  };
}

function requestFailure(operation: string, error: unknown): Error {
  // SDK errors may contain request credentials. Report only numeric status codes.
  const status =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "number"
      ? ` (${error.code})`
      : "";
  return new Error(`${operation}${status}.`);
}

// Read the environment at the CLI boundary. Never log credentials or token responses.
export async function publishResume(
  { pdf, fileId }: PublishOptions,
  createFiles: CreateDriveFiles = createDriveFiles,
): Promise<PublishResult> {
  if (!fileId || !/^[\w-]+$/.test(fileId)) {
    throw new Error("Set GOOGLE_DRIVE_FILE_ID to the existing PDF file ID.");
  }
  if (pdf.subarray(0, 5).toString() !== "%PDF-") {
    throw new Error("The upload must be a PDF.");
  }
  const files = createFiles();
  let current: drive_v3.Schema$File;
  try {
    current = await files.get({
      fields: "id,mimeType,trashed,capabilities(canEdit),md5Checksum",
      fileId,
      supportsAllDrives: true,
    });
  } catch (error) {
    throw requestFailure("Cannot inspect the existing Drive file", error);
  }
  if (
    current.id !== fileId ||
    current.mimeType !== "application/pdf" ||
    current.trashed ||
    !current.capabilities?.canEdit
  ) {
    throw new Error(
      "The existing Drive file must be an editable, non-trashed PDF.",
    );
  }
  const checksum = createHash("md5").update(pdf).digest("hex");
  if (current.md5Checksum === checksum) return { changed: false, fileId };
  // Update the existing file content without changing its ID or permissions.
  let updated: drive_v3.Schema$File;
  try {
    updated = await files.update({
      fields: "id,md5Checksum",
      fileId,
      media: { body: Readable.from([pdf]), mimeType: "application/pdf" },
      supportsAllDrives: true,
    });
  } catch (error) {
    throw requestFailure("Drive update failed", error);
  }
  if (updated.id !== fileId || updated.md5Checksum !== checksum) {
    throw new Error(
      "Drive did not confirm the expected file ID and PDF checksum. Inspect the file before retrying.",
    );
  }
  return { changed: true, fileId };
}

if (import.meta.main) {
  try {
    // process.env is confined to this executable entry point.
    // biome-ignore lint/style/noProcessEnv: Read the target file ID at the CLI boundary.
    const env = process.env;
    const result = await publishResume({
      fileId: env.GOOGLE_DRIVE_FILE_ID,
      pdf: await readFile(
        process.argv[2]
          ? resolve(process.argv[2])
          : resolve(
              dirname(fileURLToPath(import.meta.url)),
              "../generated/robert-molina-resume.pdf",
            ),
      ),
    });
    console.info(
      result.changed
        ? `Updated existing Drive file ${result.fileId}.`
        : "Drive already contains this PDF.",
    );
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Drive publishing failed.",
    );
    process.exitCode = 1;
  }
}
