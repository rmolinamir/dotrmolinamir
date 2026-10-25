import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { XMLParser } from "fast-xml-parser";
import { strFromU8, unzipSync } from "fflate";
import resumeContent from "./content.ts";
import { generateResume } from "./generate.ts";
import { validateResume } from "./schema.ts";

test("generates edited content, repeated roles, XML characters, and website links while preserving the template", () => {
  const directory = mkdtempSync(join(tmpdir(), "resume-generator-test-"));
  try {
    const input = validateResume(resumeContent);
    input.name = "Example <Name> & Co";
    input.contact.website = "https://example.com/work?a=1&b=2";
    const role = input.roles[0];
    assert.ok(role);
    input.roles.push({
      ...role,
      bullets: ["A new bullet with <tags> & symbols."],
      pageBreak: false,
      title: "An additional role",
    });
    const output = unzipSync(readFileSync(generateResume(directory, input)));
    const template = unzipSync(
      readFileSync(new URL("../assets/resume-template.docx", import.meta.url)),
    );
    for (const [path, data] of Object.entries(template)) {
      if (
        path !== "word/document.xml" &&
        path !== "word/_rels/document.xml.rels"
      )
        assert.deepEqual(output[path], data, path);
    }
    const document = output["word/document.xml"];
    const relationships = output["word/_rels/document.xml.rels"];
    assert.ok(document);
    assert.ok(relationships);
    const xml = strFromU8(document);
    const parser = new XMLParser({ parseTagValue: false, preserveOrder: true });
    const tree = JSON.stringify(parser.parse(xml, true));
    assert.ok(tree.includes(input.name));
    assert.ok(tree.includes("An additional role"));
    assert.ok(tree.includes("A new bullet with <tags> & symbols."));
    for (const item of input.roles)
      for (const bullet of item.bullets) assert.ok(tree.includes(bullet));
    assert.equal(xml.includes("{{"), false);
    const links = JSON.stringify(
      new XMLParser({ ignoreAttributes: false }).parse(
        strFromU8(relationships),
        true,
      ),
    );
    assert.ok(links.includes(input.contact.website));
    assert.match(xml, /w:val="right"/);
    // The location must follow the tab, or it runs into the company name.
    assert.match(xml, /<w:tab><\/w:tab><w:t[^>]*>Remote<\/w:t>/);
    assert.match(xml, /w:pageBreakBefore w:val="1"/);
    assert.doesNotMatch(xml, /<w:tbl[ >]/);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
