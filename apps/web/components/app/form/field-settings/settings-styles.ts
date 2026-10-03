// Shared by the form and question tabs so the two line up.

// A minimum width keeps the content from reflowing while the panel narrows;
// the panel edge clips it instead. Padding tightens so a 32px icon fits the rail.
export const PANEL =
  "flex min-w-64 flex-col gap-4 px-4 pt-4 pb-4 transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:px-2"

// Fades out while the panel is collapsed to its icon rail, like the Elements panel.
export const FADE =
  "transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0"
