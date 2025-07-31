/**
 * BrandingNewsletter Component
 *
 * A styled component that displays a brief branding block and newsletter signup UI
 * for Ideal Photography. Includes logo, description, and email subscription field.
 *
 * - Responsive and theme-aware using Tailwind and project-defined tokens
 * - Uses shared Button component
 *
 * @component
 * @example
 * return <BrandingNewsletter />
 */

import Button from "./Button";

function BrandingNewsletter() {
  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Branding: logo and title */}
      <div className='flex items-center gap-2 sm:gap-3'>
        <img
          src='/images/idealphotography-logo-main.jpg'
          alt='IdealPhoto Logo'
          className='h-7 w-auto sm:h-9 rounded-sm drop-shadow-sm flex-shrink-0'
        />
        <h2 className='text-lg sm:text-xl font-heading font-bold text-black dark:text-white leading-tight capitalize'>
          IDEAS MEDIA COMPANY
        </h2>
      </div>

      {/* Company tagline */}
      <p className='text-xs sm:text-sm text-subtle max-w-md leading-relaxed'>
        Your premier destination for professional photography equipment rentals. We provide
        top-quality gear to help you capture every moment with excellence.
      </p>

      {/* Newsletter signup section */}
      <div className='space-y-2 sm:space-y-3'>
        <h4 className='font-heading text-sm sm:text-base font-semibold text-black dark:text-white'>
          Stay Updated
        </h4>
        <div className='flex flex-col sm:flex-row w-full max-w-md gap-2'>
          {/* Email input field */}
          <input
            type='email'
            placeholder='Enter your email'
            className='input w-full rounded-md sm:rounded-l-md sm:rounded-r-none text-sm flex-1'
          />

          {/* Subscribe button */}
          <Button
            variant='secondary'
            animated
            className='rounded-md sm:rounded-l-none sm:rounded-r-md text-sm px-4 py-2 sm:px-6 flex-shrink-0'>
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BrandingNewsletter;
