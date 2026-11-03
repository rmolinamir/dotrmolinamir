import {
  BlockNoteEditor,
  FormattingToolbar,
  useBlockNoteEditor,
} from "@acme/ui/blocknote/editor";
import { useTheme } from "@acme/ui/components/theme";
import { cn } from "@acme/ui/lib/utils";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/socials/constants";

export function About() {
  const { theme } = useTheme();
  const editor = useBlockNoteEditor({
    initialContent: [
      {
        content: "About",
        props: { level: 1 },
        type: "heading",
      },
      {
        content:
          "My name is Robert Molina. I was born in Venezuela. I studied mechanical engineering, then took a hard turn into software because I liked building systems more than writing reports about them.",
        type: "paragraph",
      },
      {
        content:
          "Likewise, I care a lot about developer experience and scalability, so I invest in tooling, observability, and clear working models. I like using Domain-Driven Design to keep boundaries sharp and align engineering with the business, especially in event-driven systems.",
        type: "paragraph",
      },
      {
        type: "divider",
      },
      {
        content: "What I’m good at",
        props: { level: 2 },
        type: "heading",
      },
      {
        content:
          "I’m a software engineer. I like taking something from zero to shipping an experience people actually use. In practice, that shows up as:",
        type: "paragraph",
      },
      {
        content: [
          {
            styles: { bold: true },
            text: "Quality first: ",
            type: "text",
          },
          {
            styles: {},
            text: "I don’t like trading it away. I look for ways to move faster by improving the system (durable speed), not by cutting corners (fake speed).",
            type: "text",
          },
        ],
        type: "bulletListItem",
      },
      {
        content: [
          {
            styles: { bold: true },
            text: "Products with real value: ",
            type: "text",
          },
          {
            styles: {},
            text: "Shipping things people actually use and keep using is extremely rewarding, instead of vaporware.",
            type: "text",
          },
        ],
        type: "bulletListItem",
      },
      {
        content: [
          {
            styles: { bold: true },
            text: "Velocity and developer productivity: ",
            type: "text",
          },
          {
            styles: {},
            text: "Tighter feedback loops and faster iterations compound without dropping quality. See #1.",
            type: "text",
          },
        ],
        type: "bulletListItem",
      },
      {
        type: "divider",
      },
      {
        content: "Contact",
        props: { level: 2 },
        type: "heading",
      },
      {
        content: [
          {
            styles: {},
            text: "You can find me here: ",
            type: "text",
          },
        ],
        type: "paragraph",
      },
      {
        content: [
          {
            content: "LinkedIn",
            href: LINKEDIN_URL,
            type: "link",
          },
        ],
        type: "bulletListItem",
      },
      {
        content: [
          {
            content: "GitHub",
            href: GITHUB_URL,
            type: "link",
          },
        ],
        type: "bulletListItem",
      },
      {
        content: [
          {
            content: "robertmolina.dev",
            href: "https://www.robertmolina.dev/",
            type: "link",
          },
        ],
        type: "bulletListItem",
      },
    ],
  });

  return (
    <article
      className={cn(
        "h-full text-sm [&_.bn-container]:flex",
        "[&_.bn-container]:flex-col-reverse [&_.bn-container]:pb-60! [&_.tiptap]:bg-transparent!",
        "[&_.bn-toolbar]:z-formatting [&_.bn-toolbar]:sticky! [&_.bn-toolbar]:top-0 [&_.bn-toolbar]:mb-8 [&_.bn-toolbar]:border-s-0 [&_.bn-toolbar]:border-e-0 [&_.bn-toolbar]:border-t-0 [&_.bn-toolbar]:shadow-none",
        "[&_.bn-toolbar_[data-slot=select-trigger]]:w-50! [&_.bn-toolbar_[data-slot=select-trigger]]:shadow-none",
      )}
    >
      <BlockNoteEditor theme={theme} editor={editor} formattingToolbar={false}>
        <FormattingToolbar />
      </BlockNoteEditor>
    </article>
  );
}
