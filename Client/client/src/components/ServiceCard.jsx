import React, { useState, useEffect } from "react";
import { Camera, ShoppingBag, Sparkles, Users, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * FeatureCard — UI component representing a service or category.
 *
 * Displays an animated card with:
 * - Dynamic background (GIF > Image fallback)
 * - Overlay for contrast
 * - Centered icon
 * - Title and description
 *
 * Tailored to work with the Ideal Photography theme configuration.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Feature title
 * @param {string} props.subtitle - Feature description
 * @param {string} props.href - Target link
 * @param {string} [props.iconType='camera'] - Icon key (camera, shop, makeover, studio, booking, users)
 * @param {string} [props.imageUrl] - Optional static image URL
 * @param {string} [props.gifUrl] - Optional animated GIF URL (takes priority over imageUrl)
 * @returns {JSX.Element}
 */
const FeatureCard = ({ title, subtitle, href, iconType = "camera", imageUrl, gifUrl }) => {
  const [backgroundSrc, setBackgroundSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const iconMap = {
    camera: Camera,
    shop: ShoppingBag,
    makeover: Sparkles,
    studio: MapPin,
    booking: Calendar,
    users: Users,
  };

  const IconComponent = iconMap[iconType] || Camera;
  const sources = [gifUrl, imageUrl].filter(Boolean);

  useEffect(() => {
    setMounted(true); // trigger entrance animation

    const loadBackground = async () => {
      setIsLoading(true);
      for (const src of sources) {
        try {
          await new Promise((res, rej) => {
            const img = new Image();
            img.onload = res;
            img.onerror = rej;
            img.src = src;
          });
          setBackgroundSrc(src);
          break;
        } catch {
          continue;
        }
      }
      setIsLoading(false);
    };

    loadBackground();
  }, [gifUrl, imageUrl]);

  return (
    <Link
      to={href}
      className={`group relative overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-ideas-darkInput p-4 sm:p-6 text-center transition-all duration-300 hover:shadow-md ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } transform transition ease-out duration-700`}>
      {/* Background Image/GIF */}
      {backgroundSrc && (
        <div
          className='absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105'
          style={{ backgroundImage: `url(${backgroundSrc})` }}
        />
      )}

      {/* Skeleton Fallback */}
      {isLoading && <div className='absolute inset-0 skeleton' />}

      {/* Overlay */}
      <div className='absolute inset-0 bg-white/10 dark:bg-black/40 group-hover:bg-white/20 dark:group-hover:bg-black/60 transition-colors duration-300' />

      {/* Content */}
      <div className='relative z-10 flex flex-col items-center min-h-[120px] sm:min-h-[140px]'>
        <div className='w-10 h-10 sm:w-14 sm:h-14 mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-ideas-accent/20 group-hover:scale-105 transition-transform duration-300 delay-100'>
          <IconComponent className='w-5 h-5 sm:w-8 sm:h-8 text-ideas-accent' />
        </div>

        <h3 className='text-base sm:text-xl font-bold font-heading text-white mb-2 drop-shadow leading-tight'>
          {title}
        </h3>

        <p className='text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm'>{subtitle}</p>
      </div>
    </Link>
  );
};

export default FeatureCard;
