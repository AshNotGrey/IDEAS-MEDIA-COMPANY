import HeroCarousel from "./HeroCarousel.jsx";
import { MessageCircle } from "lucide-react";
const slides = [
  {
    id: "rent-pro-gear",
    title: "Rent Pro Gear",
    subtitle: "DSLRs, lenses, lighting — get studio-quality equipment at budget prices.",
    ctas: [
      { label: "Rent Now", href: "/equipment", variant: "primary" },
      { label: "Browse Equipment", href: "/equipment", variant: "secondary" },
    ],
    images: {
      base: "/images/idealphotography-hero-background.png",
      mobile: "/images/idealphotography-hero-background-mobile.png",
      desktop: "/images/idealphotography-hero-background.png",
    },
    blur: 1, // Less blur for equipment-focused slide
  },
  {
    id: "makeover-sessions",
    title: "Makeover Sessions",
    subtitle: "Transform your look with our professional stylists and makeup artists.",
    ctas: [{ label: "Book Makeover", href: "/makeover", variant: "primary" }],
    images: {
      base: "/images/idealPhotography-hero-bg-2.jpg",
      mobile: "/images/idealPhotography-hero-bg-2-mobile.jpg",
      desktop: "/images/idealPhotography-hero-bg-2.jpg",
    },
    blur: 0.1,
  },
  {
    id: "photoshoot",
    title: "Capture Your Moments",
    subtitle: "Book a photoshoot for portraits, families, or creative projects — all in one place.",
    ctas: [{ label: "Book Now", href: "/photoshoot", variant: "primary" }],
    images: {
      base: "/images/idealPhotography-hero-bg-3.jpg",
      mobile: "/images/idealPhotography-hero-bg-3-mobile.jpg",
      desktop: "/images/idealPhotography-hero-bg-3.jpg",
    },
    blur: 0.1,
  },
  {
    id: "cover-events",
    title: "Cover Your Events",
    subtitle: "From weddings to concerts — our team brings your stories to life.",
    ctas: [
      { label: "View gallery", href: "/events", variant: "primary" },
      {
        label: "Let's discuss",
        href: "https://wa.me/+1234567890?text=Hi! I'm interested in event coverage services.",
        variant: "whatsapp",
        leftIcon: <MessageCircle size={20} className='flex-shrink-0' />,
      },
    ],
    images: {
      base: "/images/idealPhotography-hero-bg-4.jpg",
      mobile: "/images/idealPhotography-hero-bg-4-mobile.jpg",
      desktop: "/images/idealPhotography-hero-bg-4.jpg",
    },
    blur: 0.1,
  },
];

/**
 * Hero component with carousel functionality
 *
 * Uses the HeroCarousel component to display multiple slides with
 * responsive images, call-to-action buttons, and autoplay functionality.
 *
 * @component
 * @example
 * ```jsx
 * <Hero />
 * ```
 */
const Hero = () => (
  <HeroCarousel slides={slides} autoPlay={true} interval={20000} className='hero-section' />
);

export default Hero;
