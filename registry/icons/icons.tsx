/*
 * The icons the components use, as inline SVG (24x24, stroke 2). The shapes follow the Lucide set
 * (ISC license, https://lucide.dev). Swap in any icon library by editing the imports of the
 * components that use these.
 */
import { splitProps } from "@shadow-js/core";
import type { ComponentProps, JSX } from "@shadow-js/web";
import { cn } from "@/lib/utils";

/**
 * Props of every icon: the attributes of an `<svg>`.
 *
 * Every icon renders at `size-4` by default. Pass `class` to change the size or color; the classes
 * are merged with `cn`, so your utilities win over the defaults. Icons are decorative and carry
 * `aria-hidden="true"`. When an icon carries meaning on its own, pass `aria-hidden="false"` and an
 * `aria-label`.
 * @since 1.0.0
 * @see {@link CheckIcon}
 * @see {@link XIcon}
 */
export type IconProps = ComponentProps<"svg">;

/** The shared `<svg>` frame. */
function Icon(props: IconProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={cn("size-4", local.class)}
      {...rest}
    >
      {local.children}
    </svg>
  );
}

/**
 * A check mark. Use it for a selected item or a completed step.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { CheckIcon } from "@/components/ui/icons";
 *
 * export const Selected = <CheckIcon class="size-4 text-primary" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function CheckIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

/**
 * A minus sign. Use it for the indeterminate state of a checkbox.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { MinusIcon } from "@/components/ui/icons";
 *
 * export const Partial = <MinusIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function MinusIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
    </Icon>
  );
}

/**
 * A ring that is filled with `fill-current` (or `fill-primary`). Radio buttons and menu radio items
 * use it as the selected mark.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { CircleIcon } from "@/components/ui/icons";
 *
 * export const Option = <CircleIcon class="size-2 fill-current" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function CircleIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
    </Icon>
  );
}

/**
 * A cross. Use it for closing a panel or clearing a value.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { XIcon } from "@/components/ui/icons";
 *
 * export const Close = <XIcon class="size-4" aria-hidden="false" aria-label="Close" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function XIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

/**
 * A chevron pointing down. Use it in select and disclosure triggers.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ChevronDownIcon } from "@/components/ui/icons";
 *
 * export const Caret = <ChevronDownIcon class="size-4 opacity-50" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ChevronDownIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

/**
 * A chevron pointing up. Use it in disclosure triggers that open upward.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ChevronUpIcon } from "@/components/ui/icons";
 *
 * export const Collapse = <ChevronUpIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ChevronUpIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m18 15-6-6-6 6" />
    </Icon>
  );
}

/**
 * A chevron pointing right. Use it for a submenu or a next step. Pass `class="rtl:rotate-180"` to
 * flip it in right-to-left layouts.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ChevronRightIcon } from "@/components/ui/icons";
 *
 * export const Submenu = <ChevronRightIcon class="ms-auto size-4 rtl:rotate-180" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ChevronRightIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}

/**
 * A chevron pointing left. Use it for a previous step. Pass `class="rtl:rotate-180"` to flip it in
 * right-to-left layouts.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ChevronLeftIcon } from "@/components/ui/icons";
 *
 * export const Previous = <ChevronLeftIcon class="size-4 rtl:rotate-180" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ChevronLeftIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  );
}

/**
 * Up and down chevrons. Use it for the trigger of a select or combobox.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ChevronsUpDownIcon } from "@/components/ui/icons";
 *
 * export const SelectCaret = <ChevronsUpDownIcon class="size-4 opacity-50" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ChevronsUpDownIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </Icon>
  );
}

/**
 * Three horizontal dots. Use it for a "more actions" button or an overflow marker.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { EllipsisIcon } from "@/components/ui/icons";
 *
 * export const More = <EllipsisIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function EllipsisIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </Icon>
  );
}

/**
 * A magnifying glass. Use it on search fields and search buttons.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { SearchIcon } from "@/components/ui/icons";
 *
 * export const SearchMark = <SearchIcon class="size-4 text-muted-foreground" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function SearchIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Icon>
  );
}

/**
 * A window with a sidebar column. Use it on a button that shows or hides a sidebar.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { PanelLeftIcon } from "@/components/ui/icons";
 *
 * export const SidebarToggle = <PanelLeftIcon class="size-4 rtl:rotate-180" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function PanelLeftIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </Icon>
  );
}

/**
 * Six dots in two columns. Use it as the drag handle of a resizable panel or a sortable item.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { GripVerticalIcon } from "@/components/ui/icons";
 *
 * export const DragHandle = <GripVerticalIcon class="size-4 text-muted-foreground" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function GripVerticalIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </Icon>
  );
}

/**
 * A spinner arc. Add `animate-spin` to the class to turn it while work is in progress.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { LoaderIcon } from "@/components/ui/icons";
 *
 * export const Loading = <LoaderIcon class="size-4 animate-spin" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function LoaderIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </Icon>
  );
}

/**
 * A circled "i". Use it for an informational notice.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { InfoIcon } from "@/components/ui/icons";
 *
 * export const Info = <InfoIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function InfoIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </Icon>
  );
}

/**
 * A circled check mark. Use it for a success notice.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { CircleCheckIcon } from "@/components/ui/icons";
 *
 * export const Success = <CircleCheckIcon class="size-4 text-green-600" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function CircleCheckIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

/**
 * A circled cross. Use it for an error notice.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { CircleXIcon } from "@/components/ui/icons";
 *
 * export const Failure = <CircleXIcon class="size-4 text-destructive" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function CircleXIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </Icon>
  );
}

/**
 * A warning triangle. Use it for a warning notice.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { TriangleAlertIcon } from "@/components/ui/icons";
 *
 * export const Warning = <TriangleAlertIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function TriangleAlertIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icon>
  );
}

/**
 * An arrow pointing left. Use it for a back action. Pass `class="rtl:rotate-180"` to flip it in
 * right-to-left layouts.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ArrowLeftIcon } from "@/components/ui/icons";
 *
 * export const Back = <ArrowLeftIcon class="size-4 rtl:rotate-180" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ArrowLeftIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Icon>
  );
}

/**
 * An arrow pointing right. Use it for a forward action. Pass `class="rtl:rotate-180"` to flip it in
 * right-to-left layouts.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ArrowRightIcon } from "@/components/ui/icons";
 *
 * export const Forward = <ArrowRightIcon class="size-4 rtl:rotate-180" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ArrowRightIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Icon>
  );
}

/**
 * Centered text lines. Use it for a text alignment control.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { AlignCenterIcon } from "@/components/ui/icons";
 *
 * export const Mark = <AlignCenterIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function AlignCenterIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M17 12H7" />
      <path d="M19 18H5" />
      <path d="M21 6H3" />
    </Icon>
  );
}

/**
 * Left-aligned text lines. Use it for a text alignment control.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { AlignLeftIcon } from "@/components/ui/icons";
 *
 * export const Mark = <AlignLeftIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function AlignLeftIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M15 12H3" />
      <path d="M17 18H3" />
      <path d="M21 6H3" />
    </Icon>
  );
}

/**
 * Right-aligned text lines. Use it for a text alignment control.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { AlignRightIcon } from "@/components/ui/icons";
 *
 * export const Mark = <AlignRightIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function AlignRightIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M21 12H9" />
      <path d="M21 18H7" />
      <path d="M21 6H3" />
    </Icon>
  );
}

/**
 * An arrow that points up. Use it for a send or an upload action.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ArrowUpIcon } from "@/components/ui/icons";
 *
 * export const Mark = <ArrowUpIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ArrowUpIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </Icon>
  );
}

/**
 * A bell. Use it for notifications.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { BellIcon } from "@/components/ui/icons";
 *
 * export const Mark = <BellIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function BellIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Icon>
  );
}

/**
 * The letter B in a bold stroke. Use it for a bold text control.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { BoldIcon } from "@/components/ui/icons";
 *
 * export const Mark = <BoldIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function BoldIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M14 12a4 4 0 0 0 0-8H6v8" />
      <path d="M15 20a4 4 0 0 0 0-8H6v8Z" />
    </Icon>
  );
}

/**
 * A bookmark. Use it for a saved item.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { BookmarkIcon } from "@/components/ui/icons";
 *
 * export const Mark = <BookmarkIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function BookmarkIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </Icon>
  );
}

/**
 * A robot head. Use it for an assistant or an agent.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { BotIcon } from "@/components/ui/icons";
 *
 * export const Mark = <BotIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function BotIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M12 8V4H8" />
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </Icon>
  );
}

/**
 * A calendar page. Use it for a date field or a schedule.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { CalendarIcon } from "@/components/ui/icons";
 *
 * export const Mark = <CalendarIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function CalendarIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </Icon>
  );
}

/**
 * A clock face. Use it for a time or a duration.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ClockIcon } from "@/components/ui/icons";
 *
 * export const Mark = <ClockIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ClockIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Icon>
  );
}

/**
 * Angle brackets. Use it for code.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { CodeIcon } from "@/components/ui/icons";
 *
 * export const Mark = <CodeIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function CodeIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </Icon>
  );
}

/**
 * The command key. Use it for a shortcut or a command palette.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { CommandIcon } from "@/components/ui/icons";
 *
 * export const Mark = <CommandIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function CommandIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </Icon>
  );
}

/**
 * Two overlapping sheets. Use it for a copy action.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { CopyIcon } from "@/components/ui/icons";
 *
 * export const Mark = <CopyIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function CopyIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect x="8" y="8" width="14" height="14" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </Icon>
  );
}

/**
 * A payment card. Use it for billing.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { CreditCardIcon } from "@/components/ui/icons";
 *
 * export const Mark = <CreditCardIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function CreditCardIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Icon>
  );
}

/**
 * An arrow into a tray. Use it for a download.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { DownloadIcon } from "@/components/ui/icons";
 *
 * export const Mark = <DownloadIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function DownloadIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </Icon>
  );
}

/**
 * An arrow leaving a box. Use it for a link that opens somewhere else.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ExternalLinkIcon } from "@/components/ui/icons";
 *
 * export const Mark = <ExternalLinkIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ExternalLinkIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Icon>
  );
}

/**
 * An open eye. Use it for show or preview.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { EyeIcon } from "@/components/ui/icons";
 *
 * export const Mark = <EyeIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function EyeIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

/**
 * A sheet with a folded corner. Use it for a file.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { FileIcon } from "@/components/ui/icons";
 *
 * export const Mark = <FileIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function FileIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </Icon>
  );
}

/**
 * A sheet with lines of text. Use it for a document.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { FileTextIcon } from "@/components/ui/icons";
 *
 * export const Mark = <FileTextIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function FileTextIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </Icon>
  );
}

/**
 * A closed folder. Use it for a directory.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { FolderIcon } from "@/components/ui/icons";
 *
 * export const Mark = <FolderIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function FolderIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </Icon>
  );
}

/**
 * A globe. Use it for a language or a region.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { GlobeIcon } from "@/components/ui/icons";
 *
 * export const Mark = <GlobeIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function GlobeIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </Icon>
  );
}

/**
 * A heart. Use it for a favorite or a like.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { HeartIcon } from "@/components/ui/icons";
 *
 * export const Mark = <HeartIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function HeartIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Icon>
  );
}

/**
 * A house. Use it for the start page.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { HomeIcon } from "@/components/ui/icons";
 *
 * export const Mark = <HomeIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function HomeIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </Icon>
  );
}

/**
 * A picture frame. Use it for an image.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ImageIcon } from "@/components/ui/icons";
 *
 * export const Mark = <ImageIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ImageIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </Icon>
  );
}

/**
 * The letter I slanted. Use it for an italic text control.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ItalicIcon } from "@/components/ui/icons";
 *
 * export const Mark = <ItalicIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ItalicIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M19 4H10" />
      <path d="M14 20H5" />
      <path d="M15 4 9 20" />
    </Icon>
  );
}

/**
 * Two chain links. Use it for a link.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { LinkIcon } from "@/components/ui/icons";
 *
 * export const Mark = <LinkIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function LinkIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Icon>
  );
}

/**
 * A closed padlock. Use it for a protected or private item.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { LockIcon } from "@/components/ui/icons";
 *
 * export const Mark = <LockIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function LockIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
}

/**
 * An arrow leaving a door. Use it for sign out.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { LogOutIcon } from "@/components/ui/icons";
 *
 * export const Mark = <LogOutIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function LogOutIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

/**
 * An envelope. Use it for email.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { MailIcon } from "@/components/ui/icons";
 *
 * export const Mark = <MailIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function MailIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Icon>
  );
}

/**
 * Three horizontal lines. Use it for a menu button.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { MenuIcon } from "@/components/ui/icons";
 *
 * export const Mark = <MenuIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function MenuIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 12h16" />
      <path d="M4 18h16" />
      <path d="M4 6h16" />
    </Icon>
  );
}

/**
 * A crescent moon. Use it for the dark theme.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { MoonIcon } from "@/components/ui/icons";
 *
 * export const Mark = <MoonIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function MoonIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Icon>
  );
}

/**
 * A paperclip. Use it for an attachment.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { PaperclipIcon } from "@/components/ui/icons";
 *
 * export const Mark = <PaperclipIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function PaperclipIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </Icon>
  );
}

/**
 * A pencil. Use it for edit.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { PencilIcon } from "@/components/ui/icons";
 *
 * export const Mark = <PencilIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function PencilIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </Icon>
  );
}

/**
 * A plus sign. Use it for add or new.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { PlusIcon } from "@/components/ui/icons";
 *
 * export const Mark = <PlusIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function PlusIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Icon>
  );
}

/**
 * Two arrows chasing each other. Use it for retry or refresh.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { RefreshIcon } from "@/components/ui/icons";
 *
 * export const Mark = <RefreshIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function RefreshIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </Icon>
  );
}

/**
 * A path between two points. Use it for a plan or a route.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { RouteIcon } from "@/components/ui/icons";
 *
 * export const Mark = <RouteIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function RouteIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </Icon>
  );
}

/**
 * A cog. Use it for settings.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { SettingsIcon } from "@/components/ui/icons";
 *
 * export const Mark = <SettingsIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function SettingsIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

/**
 * A smiling face. Use it for a reaction.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { SmileIcon } from "@/components/ui/icons";
 *
 * export const Mark = <SmileIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function SmileIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
    </Icon>
  );
}

/**
 * Four-point stars. Use it for something an assistant generated.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { SparklesIcon } from "@/components/ui/icons";
 *
 * export const Mark = <SparklesIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function SparklesIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </Icon>
  );
}

/**
 * A rounded square. Use it for stop.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { SquareIcon } from "@/components/ui/icons";
 *
 * export const Mark = <SquareIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function SquareIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </Icon>
  );
}

/**
 * A star. Use it for a rating or a favorite.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { StarIcon } from "@/components/ui/icons";
 *
 * export const Mark = <StarIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function StarIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </Icon>
  );
}

/**
 * A sun. Use it for the light theme.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { SunIcon } from "@/components/ui/icons";
 *
 * export const Mark = <SunIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function SunIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </Icon>
  );
}

/**
 * A prompt and a cursor. Use it for a command line.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { TerminalIcon } from "@/components/ui/icons";
 *
 * export const Mark = <TerminalIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function TerminalIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </Icon>
  );
}

/**
 * A thumb pointing down. Use it for a bad response.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ThumbsDownIcon } from "@/components/ui/icons";
 *
 * export const Mark = <ThumbsDownIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ThumbsDownIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </Icon>
  );
}

/**
 * A thumb pointing up. Use it for a good response.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { ThumbsUpIcon } from "@/components/ui/icons";
 *
 * export const Mark = <ThumbsUpIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function ThumbsUpIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </Icon>
  );
}

/**
 * A bin. Use it for delete.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { TrashIcon } from "@/components/ui/icons";
 *
 * export const Mark = <TrashIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function TrashIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Icon>
  );
}

/**
 * The letter U with a rule under it. Use it for an underline text control.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { UnderlineIcon } from "@/components/ui/icons";
 *
 * export const Mark = <UnderlineIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function UnderlineIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <path d="M4 20h16" />
    </Icon>
  );
}

/**
 * An arrow out of a tray. Use it for an upload.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { UploadIcon } from "@/components/ui/icons";
 *
 * export const Mark = <UploadIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function UploadIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v12" />
    </Icon>
  );
}

/**
 * A head and shoulders. Use it for a person or an account.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { UserIcon } from "@/components/ui/icons";
 *
 * export const Mark = <UserIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function UserIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

/**
 * A wrench. Use it for a tool.
 * @param props - The `<svg>` attributes; see {@link IconProps}.
 * @returns The icon element.
 * @example
 * ```tsx
 * import { WrenchIcon } from "@/components/ui/icons";
 *
 * export const Mark = <WrenchIcon class="size-4" />;
 * ```
 * @since 1.0.0
 * @see {@link IconProps}
 */
function WrenchIcon(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </Icon>
  );
}

export {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BellIcon,
  BoldIcon,
  BookmarkIcon,
  BotIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  CircleCheckIcon,
  CircleIcon,
  CircleXIcon,
  ClockIcon,
  CodeIcon,
  CommandIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  GlobeIcon,
  GripVerticalIcon,
  HeartIcon,
  HomeIcon,
  ImageIcon,
  InfoIcon,
  ItalicIcon,
  LinkIcon,
  LoaderIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  MinusIcon,
  MoonIcon,
  PanelLeftIcon,
  PaperclipIcon,
  PencilIcon,
  PlusIcon,
  RefreshIcon,
  RouteIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  SparklesIcon,
  SquareIcon,
  StarIcon,
  SunIcon,
  TerminalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TrashIcon,
  TriangleAlertIcon,
  UnderlineIcon,
  UploadIcon,
  UserIcon,
  WrenchIcon,
  XIcon,
};
