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

function FooterFeatureCard({ iconType, title }) {
  const Icon = iconMap[iconType] || Camera;

  return (
    <div className='flex flex-col items-center text-center transition-transform duration-300 group hover:scale-105 p-2'>
      <div className='w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full mb-2 sm:mb-4 bg-ideas-lightInput dark:bg-ideas-darkInput shadow-md'>
        <Icon className='w-4 h-4 sm:w-5 sm:h-5 text-ideas-accent' />
      </div>
      <h5 className='text-xs sm:text-sm font-semibold text-black dark:text-white leading-tight min-h-[2rem] flex items-center justify-center'>
        {title}
      </h5>
    </div>
  );
}

export default FooterFeatureCard;
