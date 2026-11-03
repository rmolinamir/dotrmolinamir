import {
  TabStrip,
  TabStripClose,
  TabStripList,
  TabStripRail,
  TabStripTab,
  TabStripTabTrigger,
  TabStripTitle,
} from "@acme/ui/os/tab-strip";
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

const meta = {
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "OS/Tab Strip",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const initialTabs = [
  { id: "overview", title: "Overview" },
  { id: "materials", title: "Materials Import" },
  { id: "scrap", title: "Pilfering & Scrap" },
  { id: "patch", title: "Patch 11.2" },
  { id: "notes", title: "Release Notes (Long Name Example)" },
  { id: "hidden", isHidden: true, title: "Hidden Window" },
];

export const Default: Story = {
  render: () => {
    const [tabs, setTabs] = React.useState(initialTabs);
    const [activeId, setActiveId] = React.useState(tabs[0]?.id ?? "");

    function handleClose(id: string) {
      setTabs((prev) => {
        const nextTabs = prev.filter((tab) => tab.id !== id);
        if (id === activeId) {
          const closedIndex = prev.findIndex((tab) => tab.id === id);
          const nextActive =
            nextTabs[closedIndex] ?? nextTabs[closedIndex - 1] ?? nextTabs[0];
          setActiveId(nextActive?.id ?? "");
        }
        return nextTabs;
      });
    }

    return (
      <div className="border-border/40 bg-background/80 w-120 max-w-full rounded-xl border p-4 shadow-sm">
        <TabStrip value={activeId} onValueChange={setActiveId}>
          <TabStripRail className="max-w-140">
            <TabStripList>
              {tabs.map((tab) => (
                <TabStripTab key={tab.id}>
                  <TabStripTabTrigger value={tab.id}>
                    <TabStripTitle>{tab.title}</TabStripTitle>
                  </TabStripTabTrigger>
                  <TabStripClose onClose={() => handleClose(tab.id)} />
                </TabStripTab>
              ))}
            </TabStripList>
          </TabStripRail>
        </TabStrip>
      </div>
    );
  },
};
