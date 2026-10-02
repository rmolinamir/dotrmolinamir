import { BlockNoteSchema } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";

export { FormattingToolbar } from "@blocknote/react";

import "@blocknote/shadcn/style.css";

import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import { Skeleton } from "../components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { Toggle } from "../components/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/tooltip";

const base = BlockNoteSchema.create();

type BlockNoteEditorProps = Omit<
  React.ComponentProps<typeof BlockNoteView>,
  "shadCNComponents"
>;

export function BlockNoteEditor(props: BlockNoteEditorProps) {
  return (
    <BlockNoteView
      shadCNComponents={{
        // Pass modified ShadCN components from your project here.
        // Otherwise, the default ShadCN components will be used.
        Avatar: {
          Avatar,
          AvatarFallback,
          AvatarImage,
        },
        Badge: {
          Badge: Badge,
        },
        Button: {
          Button: Button,
        },
        Card: {
          Card: Card,
          CardContent: CardContent,
        },
        DropdownMenu: {
          DropdownMenu,
          DropdownMenuCheckboxItem,
          DropdownMenuContent,
          DropdownMenuGroup,
          DropdownMenuItem,
          DropdownMenuLabel,
          DropdownMenuSeparator,
          DropdownMenuSub,
          DropdownMenuSubContent,
          DropdownMenuSubTrigger,
          DropdownMenuTrigger,
        },
        Input: {
          Input: Input,
        },
        Label: {
          Label: Label,
        },
        Popover: {
          Popover: Popover,
          PopoverContent: PopoverContent,
          PopoverTrigger: PopoverTrigger,
        },
        Select: {
          Select: Select,
          SelectContent: SelectContent,
          SelectItem: SelectItem,
          SelectTrigger: SelectTrigger,
          SelectValue: SelectValue,
        },
        Skeleton: {
          Skeleton: Skeleton,
        },
        Tabs: {
          Tabs: Tabs,
          TabsContent: TabsContent,
          TabsList: TabsList,
          TabsTrigger: TabsTrigger,
        },
        Toggle: {
          Toggle: Toggle,
        },
        Tooltip: {
          Tooltip,
          TooltipContent,
          TooltipProvider,
          TooltipTrigger,
        },
      }}
      {...props}
    />
  );
}

type UseBlockNoteEditorOptions = Omit<
  Parameters<typeof useCreateBlockNote>[0],
  "schema"
>;
type UseBlockNoteEditorDependencies = Parameters<typeof useCreateBlockNote>[1];

export function useBlockNoteEditor(
  options: UseBlockNoteEditorOptions = {},
  dependencies: UseBlockNoteEditorDependencies = [],
) {
  return useCreateBlockNote(
    {
      ...options,
      schema: base,
    },
    dependencies,
  ) as unknown as BlockNoteEditorProps["editor"]; // The library types kinda suck, so had to cast...
}
