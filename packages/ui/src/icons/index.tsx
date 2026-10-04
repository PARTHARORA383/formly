import * as React from "react"

// The app's icon set. Every icon is drawn on an 18x18 grid in two tones of one
// colour: the main shape in `fill` (the --icon slate by default; pass
// fill="currentColor" on a coloured background, e.g. a logo on a primary tile) and a supporting shape in the same colour at 40% opacity.
// Pure glyphs (plus, close, check, chevrons) are single-tone, since there is
// nothing to put in the background.
//
// Size with a class (`size-4`); the default is 1em.

type IconProps = Omit<React.SVGProps<SVGSVGElement>, "fill"> & {
  fill?: string
  /** Colour of the lighter tone. Defaults to `fill`, shown at 40% opacity. */
  secondaryfill?: string
}

type IconComponent = React.ComponentType<IconProps>

const LIGHT = 0.4
// The text icons are mostly line work, so their light tone needs more weight to read.
const LIGHT_STRONG = 0.65

type Tones = { fill: string; light: string }

// A line is a stroked path with round ends, so it takes these three together.
const line = {
  fill: "none",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

function createIcon(displayName: string, draw: (tones: Tones) => React.ReactNode): IconComponent {
  function Icon({
    fill = "var(--icon, currentColor)",
    secondaryfill,
    width = "1em",
    height = "1em",
    ...props
  }: IconProps) {
    return (
      <svg
        height={height}
        width={width}
        // Drawn on 18x18, shown cropped to 16x16: nothing sits in the outer unit,
        // and trimming it makes every icon fill its box more.
        viewBox="1 1 16 16"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...props}
      >
        {draw({ fill, light: secondaryfill ?? fill })}
      </svg>
    )
  }

  Icon.displayName = displayName
  return Icon
}

// ---- Glyphs ----------------------------------------------------------------

const PlusIcon = createIcon("PlusIcon", ({ fill }) => (
  <path d="M9 3.5v11M3.5 9h11" stroke={fill} {...line} />
))

const CloseIcon = createIcon("CloseIcon", ({ fill }) => (
  <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke={fill} {...line} />
))

const CheckIcon = createIcon("CheckIcon", ({ fill }) => (
  <path d="M4 9.5l3.5 3.5 7-7.5" stroke={fill} {...line} />
))

const ChevronDownIcon = createIcon("ChevronDownIcon", ({ fill }) => (
  <path d="M4.5 7l4.5 4.5L13.5 7" stroke={fill} {...line} />
))

const ChevronUpIcon = createIcon("ChevronUpIcon", ({ fill }) => (
  <path d="M4.5 11L9 6.5 13.5 11" stroke={fill} {...line} />
))

const ChevronRightIcon = createIcon("ChevronRightIcon", ({ fill }) => (
  <path d="M7 4.5L11.5 9 7 13.5" stroke={fill} {...line} />
))

const ChevronsUpDownIcon = createIcon("ChevronsUpDownIcon", ({ fill }) => (
  <path d="M5.5 7L9 3.5 12.5 7M5.5 11L9 14.5 12.5 11" stroke={fill} {...line} />
))

// The leading chevron is the strong one; the trailing one echoes it.
const ChevronsLeftIcon = createIcon("ChevronsLeftIcon", ({ fill, light }) => (
  <>
    <path d="M8 4.5L3.5 9 8 13.5" stroke={fill} {...line} />
    <path d="M14 4.5L9.5 9l4.5 4.5" stroke={light} opacity={LIGHT} {...line} />
  </>
))

const ChevronsRightIcon = createIcon("ChevronsRightIcon", ({ fill, light }) => (
  <>
    <path d="M10 4.5L14.5 9 10 13.5" stroke={fill} {...line} />
    <path d="M4 4.5L8.5 9 4 13.5" stroke={light} opacity={LIGHT} {...line} />
  </>
))

// ---- Field types -----------------------------------------------------------

// "Aa": the large A in the light tone, the small a in the main one.
const TextIcon = createIcon("TextIcon", ({ fill, light }) => (
  <>
    <path d="M2.5 14L6.25 4 10 14M4 10.75h4.5" stroke={light} opacity={LIGHT_STRONG} {...line} />
    <g stroke={fill} {...line}>
      <circle cx="13" cy="11.25" r="2.25" />
      <path d="M15.25 9v5" />
    </g>
  </>
))

const LongTextIcon = createIcon("LongTextIcon", ({ fill, light }) => (
  <>
    <path d="M3 4.5h12M3 13.5h12" stroke={fill} {...line} />
    <path d="M3 9h6" stroke={light} opacity={LIGHT_STRONG} {...line} />
  </>
))

// An envelope split by a chevron-shaped gap: the dark flap above, the light
// body below, and bare background between them (it is empty space, not a colour).
const MailIcon = createIcon("MailIcon", ({ fill, light }) => (
  <>
    <path
      d="M1.75 7.5V6.75A3.25 3.25 0 0 1 5 3.5H13A3.25 3.25 0 0 1 16.25 6.75V7.5L9 10.5Z"
      fill={fill}
    />
    <path
      d="M1.75 8.5V11.25A3.25 3.25 0 0 0 5 14.5H13A3.25 3.25 0 0 0 16.25 11.25V8.5L9 11.5Z"
      fill={light}
      opacity={LIGHT}
    />
  </>
))

const HashIcon = createIcon("HashIcon", ({ fill, light }) => (
  <>
    <path d="M7.25 2.75L6 15.25M12 2.75l-1.25 12.5" stroke={fill} {...line} />
    <path d="M3 6.5h12M3 11.5h12" stroke={light} opacity={LIGHT} {...line} />
  </>
))

// The dark header and the light body are split by a thin gap of bare background.
const CalendarIcon = createIcon("CalendarIcon", ({ fill, light }) => (
  <>
    <path d="M2 7.5V6.5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v1Z" fill={fill} />
    <path d="M2 8.5V13a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8.5Z" fill={light} opacity={LIGHT} />
    <path d="M6 1.75v3M12 1.75v3" stroke={fill} {...line} />
  </>
))

// A dropdown field: the field's line, with the chevron that opens it below.
const SelectBoxIcon = createIcon("SelectBoxIcon", ({ fill, light }) => (
  <>
    <path d="M3 5h12" stroke={light} opacity={LIGHT} {...line} />
    <path d="M6 10l3 3 3-3" stroke={fill} {...line} />
  </>
))

// A thick ring with an open centre, in the light tone.
const RadioIcon = createIcon("RadioIcon", ({ light }) => (
  <circle cx="9" cy="9" r="5.25" fill="none" stroke={light} strokeWidth="3.5" opacity={LIGHT} />
))

const CheckSquareIcon = createIcon("CheckSquareIcon", ({ fill }) => (
  <path d="M3.75 9.5l3.75 3.75 6.75-7.5" stroke={fill} {...line} />
))

// ---- Interface -------------------------------------------------------------

const CursorIcon = createIcon("CursorIcon", ({ fill, light }) => (
  <>
    <path d="M3.2 2.9L14.9 7.7 9.9 9.6 7.9 14.8Z" fill={light} opacity={LIGHT} />
    <path d="M3.2 2.9L14.9 7.7 9.9 9.6 7.9 14.8Z" stroke={fill} {...line} />
  </>
))

const NoteIcon = createIcon("NoteIcon", ({ fill, light }) => (
  <>
    <rect x="3.5" y="2" width="11" height="14" rx="3" fill={light} opacity={LIGHT} />
    <path d="M6.5 6.5h5M6.5 9.5h5M6.5 12.5H9" stroke={fill} {...line} />
  </>
))

const GridIcon = createIcon("GridIcon", ({ fill, light }) => (
  <>
    <rect x="2" y="2" width="5.5" height="5.5" rx="1.75" fill={fill} />
    <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.75" fill={fill} />
    <rect x="10.5" y="2" width="5.5" height="5.5" rx="1.75" fill={light} opacity={LIGHT} />
    <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.75" fill={light} opacity={LIGHT} />
  </>
))

// The eye: a light almond with a dark pupil.
const EyeIcon = createIcon("EyeIcon", ({ fill, light }) => (
  <>
    <path
      d="M1.75 9C3.5 5.5 6 4 9 4s5.5 1.5 7.25 5c-1.75 3.5-4.25 5-7.25 5S3.5 12.5 1.75 9Z"
      fill={light}
      opacity={LIGHT}
    />
    <circle cx="9" cy="9" r="2.6" fill={fill} />
  </>
))

const HelpCircleIcon = createIcon("HelpCircleIcon", ({ fill, light }) => (
  <>
    <circle cx="9" cy="9" r="7" fill={light} opacity={LIGHT} />
    <path d="M7.1 7.2a1.9 1.9 0 1 1 2.9 1.6c-.7.45-1 .8-1 1.5" stroke={fill} {...line} />
    <circle cx="9" cy="12.6" r=".85" fill={fill} />
  </>
))

const SunIcon = createIcon("SunIcon", ({ fill }) => (
  <>
    <circle cx="9" cy="9" r="3.25" fill="none" stroke={fill} strokeWidth="1.5" />
    <path
      d="M9 1.75v1.5M9 14.75v1.5M1.75 9h1.5M14.75 9h1.5M3.87 3.87l1.06 1.06M13.07 13.07l1.06 1.06M14.13 3.87l-1.06 1.06M4.93 13.07l-1.06 1.06"
      stroke={fill}
      {...line}
    />
  </>
))

const MoonIcon = createIcon("MoonIcon", ({ fill }) => (
  <>
    <path
      d="M15.75 9.59A6.75 6.75 0 1 1 8.41 2.25 5.25 5.25 0 0 0 15.75 9.59Z"
      fill="none"
      stroke={fill}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="13.2" cy="4.8" r=".9" fill={fill} />
  </>
))

const SidebarIcon = createIcon("SidebarIcon", ({ fill, light }) => (
  <>
    <rect x="1.75" y="3" width="14.5" height="12" rx="3.5" fill={light} opacity={LIGHT} />
    <rect x="3.5" y="4.75" width="4" height="8.5" rx="1.75" fill={fill} />
  </>
))

// Also the app's logo mark.
const LayoutBottomIcon = createIcon("LayoutBottomIcon", ({ fill, light }) => (
  <>
    <rect x="1.75" y="3" width="14.5" height="12" rx="3.5" fill={light} opacity={LIGHT} />
    <rect x="3.5" y="9.75" width="11" height="3.5" rx="1.75" fill={fill} />
  </>
))

export {
  PlusIcon,
  CloseIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  TextIcon,
  LongTextIcon,
  MailIcon,
  HashIcon,
  CalendarIcon,
  SelectBoxIcon,
  RadioIcon,
  CheckSquareIcon,
  CursorIcon,
  NoteIcon,
  GridIcon,
  HelpCircleIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
  SidebarIcon,
  LayoutBottomIcon,
}
export type { IconProps, IconComponent }
