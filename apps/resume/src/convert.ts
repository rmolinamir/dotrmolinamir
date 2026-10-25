import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateResume } from "./generate.ts";
import { verifyResume } from "./verify.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, process.argv[2] ?? "generated");
const image = "acme-resume-pdf:local";

try {
  execFileSync("docker", ["info", "--format", "{{.ServerVersion}}"], {
    stdio: "pipe",
    timeout: 15_000,
  });
} catch {
  throw new Error(
    "PDF generation requires Docker to be installed and running. Start Docker and retry. To generate only Word, run pnpm --filter @acme/resume docx.",
  );
}

// Docker caches this tools-only image. Content edits do not rebuild its packages.
execFileSync("docker", ["build", "--tag", image, resolve(root, "docker")], {
  stdio: "inherit",
  timeout: 600_000,
});

const source = generateResume(output);
const pdf = resolve(output, "robert-molina-resume.pdf");
const user = `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`;

function runTool(command: string, args: readonly string[]): string {
  return execFileSync(
    "docker",
    [
      "run",
      "--rm",
      "--network",
      "none",
      "--user",
      user,
      "--volume",
      `${output}:/work`,
      image,
      command,
      ...args.map((arg) => (arg === pdf ? basename(pdf) : arg)),
    ],
    { encoding: "utf8", timeout: 120_000 },
  );
}

// LibreOffice can exit successfully without producing output. Remove stale output first.
rmSync(pdf, { force: true });
console.info(
  runTool("soffice", [
    "-env:UserInstallation=file:///tmp/libreoffice",
    "--headless",
    "--convert-to",
    "pdf:writer_pdf_Export",
    "--outdir",
    ".",
    basename(source),
  ]).trim(),
);
verifyResume(source, pdf, runTool);
runTool("pdftoppm", ["-scale-to", "1500", "-png", basename(pdf), "page"]);
console.info(`DOCX, PDF, and page previews: ${output}`);
