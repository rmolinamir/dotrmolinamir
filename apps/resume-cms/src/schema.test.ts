import assert from "node:assert/strict";
import { test } from "node:test";
import resumeContent from "./content.ts";
import { validateResume } from "./schema.ts";

test("validates content and defaults optional page breaks", () => {
  const input = {
    ...resumeContent,
    roles: resumeContent.roles.map((role) => ({
      ...role,
      pageBreak: undefined,
    })),
  };
  const resume = validateResume(input);
  assert.equal(resume.roles[0]?.pageBreak, false);
  assert.equal(resume.name, input.name);
  assert.deepEqual(
    resume.roles.map((role) => role.bullets),
    input.roles.map((role) => role.bullets),
  );
});

test("reports missing fields, empty bullets, and unknown keys", () => {
  const input = {
    ...resumeContent,
    contact: { ...resumeContent.contact, email: undefined },
    roles: resumeContent.roles.map((role) => ({
      ...role,
      bullets: [],
      employer: "Unexpected field",
    })),
  };
  assert.throws(
    () => validateResume(input),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /contact.email/);
      assert.match(error.message, /roles.0.bullets/);
      assert.match(error.message, /employer/);
      return true;
    },
  );
});

test("rejects empty prose and unsupported website protocols", () => {
  assert.throws(
    () =>
      validateResume({
        ...resumeContent,
        contact: { ...resumeContent.contact, website: "javascript:alert(1)" },
        summary: "   ",
      }),
    /summary|contact.website/,
  );
});
