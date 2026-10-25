import { z } from "zod";

const text = z.string().trim().min(1);

export const resumeSchema = z.strictObject({
  contact: z.strictObject({
    email: z.email(),
    location: text,
    website: z.url({ protocol: /^https$/ }),
  }),
  education: z.strictObject({
    date: text,
    degree: text,
    location: text,
    school: text,
    thesis: text.optional(),
  }),
  name: text,
  roles: z
    .array(
      z.strictObject({
        bullets: z.array(text).min(1),
        company: text,
        dates: text,
        location: text,
        pageBreak: z.boolean().default(false),
        title: text,
      }),
    )
    .min(1),
  skills: z.array(z.strictObject({ items: text, label: text })).min(1),
  summary: text,
  target: text,
});

export type ResumeContent = z.infer<typeof resumeSchema>;

export type ResumeInput = z.input<typeof resumeSchema>;

export function validateResume(value: unknown): ResumeContent {
  const result = resumeSchema.safeParse(value);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "resume"}: ${issue.message}`,
    );
    throw new Error(`Invalid content.ts:\n${issues.join("\n")}`);
  }
  return result.data;
}
