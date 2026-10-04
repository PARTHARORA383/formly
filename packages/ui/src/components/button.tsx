import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

// The app's button theme: pill-shaped, with a hairline border and a light inset
// highlight along the top edge, which is what gives it a slightly raised look.
// `default` is the loud one (a soft top-to-bottom sheen on the primary colour),
// and `brand` is the same thing in the brand colour;
// `secondary` is the quiet one (the secondary surface with a darker hover).
// The other variants are plain: no highlight, just the same shape and motion.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,box-shadow,transform,opacity] duration-150 outline-none select-none touch-manipulation focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[color-mix(in_oklch,var(--primary),black_30%)] bg-primary bg-[linear-gradient(to_bottom,rgb(255_255_255/0.14),transparent)] text-primary-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.25)] hover:bg-[color-mix(in_oklch,var(--primary),white_8%)]",
        // The same raised look as `default`, in the brand colour instead of primary.
        brand:
          "border-[color-mix(in_oklch,var(--brand),black_30%)] bg-brand bg-[linear-gradient(to_bottom,rgb(255_255_255/0.14),transparent)] text-brand-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.25)] hover:bg-[color-mix(in_oklch,var(--brand),white_8%)]",
        secondary:
          "border-foreground/15 bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.7)] hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08)]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        ghost:
          "border-transparent hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      // Touch screens get a taller target, as in the theme's default size.
      size: {
        default:
          "h-9 gap-1.5 rounded-full px-4 pointer-coarse:h-11 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-full px-2.5 text-xs pointer-coarse:h-9 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-full px-3.5 text-[0.8rem] pointer-coarse:h-10 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 rounded-full px-5 pointer-coarse:h-12 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9 rounded-full pointer-coarse:size-11",
        "icon-xs":
          "size-6 rounded-full pointer-coarse:size-9 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full pointer-coarse:size-10",
        "icon-lg": "size-10 rounded-full pointer-coarse:size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
