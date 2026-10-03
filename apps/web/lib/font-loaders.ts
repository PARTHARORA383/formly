import { Playfair_Display, Space_Grotesk, Urbanist } from "next/font/google"

// Server only: the root layout puts these classes on <html>, which defines the
// CSS variables the form fonts point at (see form-fonts.ts). Inter is the app
// font and is loaded separately. preload is off so a page only downloads the
// font files it actually uses; the browser fetches a face when text needs it.
const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", preload: false })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", preload: false })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", preload: false })

export const FORM_FONT_VARIABLES = [urbanist.variable, playfair.variable, spaceGrotesk.variable].join(" ")
