import React from "react";
import {
  Camera,
  ShoppingBag,
  Sparkles,
  Users,
  Calendar,
  ShieldCheck,
  Headphones,
  CheckCheckIcon,
  Clock2,
} from "lucide-react";

/**
 * FeatureCard component — square, compact, on-brand
 *
 * @param {Object} props
 * @param {string} props.title - Feature title
 * @param {string} props.description - Description text
 * @param {string} props.iconType - Icon type from predefined map
 */
const FeatureCard = ({ title, description, iconType = "camera" }) => {
  const iconMap = {
    camera: Camera,
    shop: ShoppingBag,
    makeover: Sparkles,
    users: Users,
    photoshoot: Calendar,
    booking: Calendar,
    support: Headphones,
    secure: ShieldCheck,
    quality: CheckCheckIcon,
    time: Clock2,
  };

  const Icon = iconMap[iconType] || Camera;

  return (
    <div className='card card-hover flex flex-col items-center text-center transition-all duration-300 cursor-pointer'>
      <div className='w-16 h-16 flex items-center justify-center rounded-full mb-4 bg-ideas-accent/10 dark:bg-ideas-accent/20'>
        <Icon className='w-8 h-8 text-ideas-accent transition-colors duration-300' />
      </div>
      <h3 className='text-lg font-heading font-semibold text-black dark:text-white'>{title}</h3>
      <p className='text-black/80 dark:text-white/80 mt-1'>{description}</p>
    </div>
  );
};

export default FeatureCard;
