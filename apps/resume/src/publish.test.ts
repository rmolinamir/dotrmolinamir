import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import { test } from "node:test";
import type { drive_v3 } from "@googleapis/drive";
import { publishResume } from "./publish.ts";

const pdf = Buffer.from("%PDF-1.7\nexample");
const checksum = createHash("md5").update(pdf).digest("hex");
const config = {
  fileId: "existing-file",
  pdf,
};
const metadata: drive_v3.Schema$File = {
  capabilities: { canEdit: true },
  id: config.fileId,
  mimeType: "application/pdf",
};

function mockFiles(
  current: drive_v3.Schema$File = metadata,
  updated: drive_v3.Schema$File = { id: config.fileId, md5Checksum: checksum },
) {
  const gets: drive_v3.Params$Resource$Files$Get[] = [];
  const updates: drive_v3.Params$Resource$Files$Update[] = [];
  return {
    create: () => {
      return {
        get: async (params: drive_v3.Params$Resource$Files$Get) => {
          gets.push(params);
          return current;
        },
        update: async (params: drive_v3.Params$Resource$Files$Update) => {
          updates.push(params);
          return updated;
        },
      };
    },
    gets,
    updates,
  };
}

test("uses the SDK to replace only the existing PDF and confirms its checksum", async () => {
  const mock = mockFiles();
  assert.deepEqual(await publishResume(config, mock.create), {
    changed: true,
    fileId: config.fileId,
  });
  assert.equal(mock.gets.length, 1);
  assert.equal(mock.updates.length, 1);
  assert.equal(mock.gets[0]?.fileId, config.fileId);
  const update = mock.updates[0];
  assert.ok(update);
  assert.equal(update.fileId, config.fileId);
  assert.equal(update.supportsAllDrives, true);
  assert.equal(update.media?.mimeType, "application/pdf");
  assert.equal(update.requestBody, undefined);
  assert.ok(update.media?.body instanceof Readable);
  const chunks: Buffer[] = [];
  for await (const chunk of update.media.body) chunks.push(chunk);
  assert.deepEqual(Buffer.concat(chunks), pdf);
});

test("skips an identical PDF", async () => {
  const mock = mockFiles({ ...metadata, md5Checksum: checksum });
  assert.equal((await publishResume(config, mock.create)).changed, false);
  assert.equal(mock.updates.length, 0);
});

for (const replacement of [
  { ...metadata, mimeType: "application/vnd.google-apps.document" },
  { ...metadata, capabilities: { canEdit: false } },
  { ...metadata, trashed: true },
  { ...metadata, id: "other-file" },
]) {
  test(`refuses an invalid target: ${JSON.stringify(replacement)}`, async () => {
    const mock = mockFiles(replacement);
    await assert.rejects(
      publishResume(config, mock.create),
      /editable, non-trashed PDF/,
    );
    assert.equal(mock.updates.length, 0);
  });
}

test("stops on SDK authorization failures without exposing request credentials", async () => {
  const mock = mockFiles();
  const create: Parameters<typeof publishResume>[1] = () => ({
    ...mock.create(),
    get: async () => {
      throw { code: 401, message: "private token details" };
    },
  });
  await assert.rejects(publishResume(config, create), {
    message: "Cannot inspect the existing Drive file (401).",
  });
  assert.equal(mock.updates.length, 0);
});

test("rejects invalid file IDs and non-PDF input before creating an SDK client", async () => {
  const create = () => {
    assert.fail("Should not create the SDK client");
  };
  for (const fileId of [undefined, "", "invalid/file"]) {
    await assert.rejects(
      publishResume({ ...config, fileId }, create),
      /Set GOOGLE_DRIVE/,
    );
  }
  await assert.rejects(
    publishResume({ ...config, pdf: Buffer.from("not a PDF") }, create),
    /must be a PDF/,
  );
});

test("reports SDK upload failures without exposing request credentials", async () => {
  const mock = mockFiles();
  const create: Parameters<typeof publishResume>[1] = () => ({
    ...mock.create(),
    update: async () => {
      throw { code: 403, message: "private request details" };
    },
  });
  await assert.rejects(publishResume(config, create), {
    message: "Drive update failed (403).",
  });
});

test("does not report success when Drive returns an unexpected ID or checksum", async () => {
  for (const result of [
    { id: "other-file", md5Checksum: checksum },
    { id: config.fileId, md5Checksum: "wrong" },
  ]) {
    const mock = mockFiles(metadata, result);
    await assert.rejects(publishResume(config, mock.create), /did not confirm/);
  }
});
