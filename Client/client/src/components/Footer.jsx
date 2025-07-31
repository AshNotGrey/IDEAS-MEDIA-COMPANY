/**
 * Footer component for the Ideal Photography website.
 *
 * This component includes:
 * - Branding and newsletter subscription block
 * - Quick access and equipment category links
 * - Feature cards showcasing services
 * - Copyright information with policy links
 *
 * Styles adapt to light and dark themes using Tailwind's custom theme tokens.
 */
import { Link } from "react-router-dom";
import { OUR_SERVICES } from "../constants";
import BrandingNewsletter from "./BrandNewsLetter.jsx";
import FooterFeatureCard from "./FooterFeatureCard.jsx";

const quickLinks = [
  { label: "Browse Equipment", href: "/equipment" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "My Account", href: "/account" },
  { label: "Help Center", href: "/faqs" },
];

const equipmentLinks = [
  { label: "DSLR Cameras", href: "/equipment" },
  { label: "Mirrorless Cameras", href: "/equipment" },
  { label: "Professional Lenses", href: "/equipment" },
  { label: "Drones & Aerial", href: "/equipment" },
  { label: "Lighting Equipment", href: "/equipment" },
  { label: "Accessories", href: "/equipment" },
];

const copyrightLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-ideas-white dark:bg-ideas-black text-black dark:text-white pt-8 sm:pt-section px-4 sm:px-gutter mt-16 sm:mt-20 border-t border-black/10 dark:border-white/10'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 pb-8 sm:pb-10'>
        {/* Branding & Newsletter */}
        <div className='lg:col-span-1'>
          <BrandingNewsletter />
        </div>

        {/* Link columns */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2'>
          <FooterLinks title='Quick Links' links={quickLinks} />
          <FooterLinks title='Equipment' links={equipmentLinks} />
        </div>
      </div>

      {/* Our Services */}
      <div className='max-w-7xl mx-auto pt-8 sm:pt-10'>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mt-4 sm:mt-6'>
          {OUR_SERVICES.map((service) => (
            <FooterFeatureCard key={service.title} {...service} />
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className='text-center text-subtle text-xs sm:text-sm py-4 sm:py-6 px-4'>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4'>
          <div>
            <span>© {currentYear} Ideal Photography. All rights reserved.</span>
          </div>
          <div>
            <div className='flex flex-wrap items-center justify-center gap-2 sm:gap-4'>
              {copyrightLinks.map((link, idx) => (
                <span key={link.label} className='flex items-center'>
                  <Link to={link.href} className='hover:text-ideas-accentHover transition-colors'>
                    {link.label}
                  </Link>
                  {idx < copyrightLinks.length - 1 && (
                    <span className='hidden sm:inline mx-2'>|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Renders a column of footer links under a heading.
 *
 * @param {Object} props
 * @param {string} props.title - Title for the section
 * @param {Array<{label: string, href: string}>} props.links - List of links
 * @returns {JSX.Element}
 */
function FooterLinks({ title, links }) {
  return (
    <div className='min-h-[120px] sm:min-h-[140px]'>
      <h4 className='text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-black dark:text-white'>
        {title}
      </h4>
      <ul className='space-y-1.5 sm:space-y-2'>
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className='text-xs sm:text-sm text-subtle hover:text-ideas-accentHover transition-colors block'>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
