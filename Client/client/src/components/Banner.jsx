import { useState, useEffect } from "react";
import { X, Calendar, ArrowRight } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Banner component for announcements and campaigns with dismiss persistence.
 *
 * Uses localStorage to remember dismissal state of each banner by ID.
 *
 * @component
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the banner
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {boolean} [props.dismissible=true] - Enables dismiss button
 *
 * @example
 * <Banner
 *   id="summer-workshop-2025"
 *   title="Summer Photography Workshop"
 *   description="Join us for an intensive 3-day experience"
 *   dismissible={true}
 * />
 */
export default function Banner({ id, title, description, dismissible = true }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(`banner-dismissed-${id}`);
    if (!isDismissed) {
      setVisible(true);
    }
  }, [id]);

  const handleDismiss = () => {
    localStorage.setItem(`banner-dismissed-${id}`, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className='relative isolate flex items-center justify-between gap-4 overflow-hidden bg-ideas-lightInput dark:bg-ideas-darkInput px-6 py-4 sm:px-8 rounded-xl shadow-card dark:shadow-cardDark'>
      {/* Decorative blurred shape */}
      <div
        aria-hidden='true'
        className='absolute -z-10 top-1/2 left-[-8rem] -translate-y-1/2 transform-gpu blur-2xl opacity-20'>
        <div
          className='aspect-[577/310] w-[36rem] bg-gradient-to-r from-ideas-accent to-ideas-accentHover'
          style={{
            clipPath:
              "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
          }}
        />
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <p className='text-sm text-black dark:text-white'>
          <strong className='font-semibold'>{title}</strong>
          <Calendar className='mx-2 inline size-4 text-black/60 dark:text-white/60' />
          {description}
        </p>
        <a href='#' className='btn-primary px-4 py-1.5 text-sm'>
          Register now <ArrowRight className='ml-1 size-4' />
        </a>
      </div>

      {dismissible && (
        <button
          type='button'
          className='p-2 text-black hover:text-ideas-accent dark:text-white dark:hover:text-ideas-accentLight transition-colors'
          aria-label='Dismiss'
          onClick={handleDismiss}>
          <X className='size-5' />
        </button>
      )}
    </div>
  );
}

Banner.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  dismissible: PropTypes.bool,
};
