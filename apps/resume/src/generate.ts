import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import resumeContent from "./content.ts";
import { validateResume } from "./schema.ts";

interface XmlNode {
  ":@"?: Record<string, string>;
  [key: string]: XmlNode[] | string | Record<string, string> | undefined;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  preserveOrder: true,
  trimValues: false,
});
const builder = new XMLBuilder({
  ignoreAttributes: false,
  preserveOrder: true,
});

function children(node: XmlNode, key: string): XmlNode[] {
  const value = node[key];
  if (!Array.isArray(value))
    throw new Error(`Missing DOCX template element: ${key}`);
  return value;
}

function find(nodes: XmlNode[], key: string): XmlNode {
  const found = nodes.find((node) => key in node);
  if (!found) throw new Error(`Missing DOCX template element: ${key}`);
  return found;
}

function replace(nodes: XmlNode[], values: Record<string, string>): void {
  for (const node of nodes) {
    for (const [key, value] of Object.entries(node)) {
      if (key === "#text" && typeof value === "string") {
        node[key] = value.replace(/\{\{(\w+)\}\}/g, (token, name: string) => {
          if (!(name in values))
            throw new Error(`Unknown DOCX template field: ${token}`);
          return values[name] ?? "";
        });
      } else if (Array.isArray(value)) replace(value, values);
    }
  }
}

export function generateResume(
  output = resolve(root, "generated"),
  content: unknown = resumeContent,
): string {
  const resume = validateResume(content);
  const archive = unzipSync(
    readFileSync(resolve(root, "assets/resume-template.docx")),
  );
  const document = archive["word/document.xml"];
  if (!document)
    throw new Error("The DOCX template is missing word/document.xml.");
  const xml = parser.parse(strFromU8(document), true) as XmlNode[];
  const body = children(
    find(children(find(xml, "w:document"), "w:document"), "w:body"),
    "w:body",
  );
  const templates = body.filter((node) => "w:p" in node);
  const sectionProperties = find(body, "w:sectPr");
  const paragraphs: XmlNode[] = [];
  function add(marker: string, values: Record<string, string>): XmlNode {
    const source = templates.find((node) =>
      JSON.stringify(node).includes(`{{${marker}}}`),
    );
    if (!source) throw new Error(`Missing DOCX template paragraph: ${marker}`);
    const node = structuredClone(source);
    replace([node], values);
    paragraphs.push(node);
    return node;
  }
  add("name", { name: resume.name });
  const website = new URL(resume.contact.website);
  add("email", {
    contact_location: resume.contact.location,
    email: resume.contact.email,
    website_label: `${website.host}${website.pathname === "/" ? "" : website.pathname}`,
  });
  add("target", { target: resume.target });
  add("section", { section: "SUMMARY" });
  add("summary", { summary: resume.summary });
  add("section", { section: "EXPERIENCE" });
  for (const role of resume.roles) {
    const company = add("company", {
      company: role.company,
      location: role.location,
    });
    if (role.pageBreak) {
      const properties = children(
        find(children(company, "w:p"), "w:pPr"),
        "w:pPr",
      );
      const pageBreak = find(properties, "w:pageBreakBefore");
      pageBreak[":@"] = { "@_w:val": "1" };
    }
    add("title", { dates: role.dates, title: role.title });
    for (const bullet of role.bullets) add("bullet", { bullet });
  }
  add("section", { section: "TECHNICAL SKILLS" });
  for (const skill of resume.skills)
    add("skill_label", {
      skill_items: ` ${skill.items}`,
      skill_label: skill.label,
    });
  add("section", { section: "EDUCATION" });
  add("school", {
    education_location: resume.education.location,
    school: resume.education.school,
  });
  add("degree", {
    degree: resume.education.degree,
    education_date: resume.education.date,
  });
  if (resume.education.thesis)
    add("bullet", { bullet: resume.education.thesis });
  body.splice(0, body.length, ...paragraphs, sectionProperties);
  archive["word/document.xml"] = strToU8(builder.build(xml));
  const relationshipsFile = "word/_rels/document.xml.rels";
  const relationships = archive[relationshipsFile];
  if (!relationships)
    throw new Error("The DOCX template is missing its relationships.");
  const links = parser.parse(strFromU8(relationships), true) as XmlNode[];
  const websiteLink = children(
    find(links, "Relationships"),
    "Relationships",
  ).find((node) => node[":@"]?.["@_Id"] === "rId6");
  if (!websiteLink)
    throw new Error("The DOCX template is missing the website hyperlink.");
  websiteLink[":@"] = {
    ...websiteLink[":@"],
    "@_Target": resume.contact.website,
  };
  archive[relationshipsFile] = strToU8(builder.build(links));
  mkdirSync(output, { recursive: true });
  const destination = resolve(output, "robert-molina-resume.docx");
  writeFileSync(destination, zipSync(archive));
  console.info(`Generated DOCX from content.ts: ${destination}`);
  return destination;
}

if (import.meta.main)
  generateResume(process.argv[2] ? resolve(process.argv[2]) : undefined);
