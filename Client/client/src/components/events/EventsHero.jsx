import React, { useEffect, useState } from "react";
import Button from "../Button";
import { MessageCircle } from "lucide-react";

/**
 * EventsHero — full-screen hero with responsive GIF and fallback image
 */
const EventsHero = ({
  title = "Event Coverage",
  subtitle = "From intimate gatherings to grand celebrations, we bring your events to life through stunning photography and videography that captures every moment",
  whatsappHref,
  fallbackImg = "/images/idealPhotography-hero-bg-4.jpg",
  gifDesktop = "/GIFs/idealPhotography-events-header.gif",
  gifMobile = "/GIFs/idealPhotography-events-header-mobile.gif",
}) => {
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <section className='relative h-screen flex items-center justify-center overflow-hidden'>
      <div className='absolute inset-0'>
        {/* Fallback image - always visible */}
        <img src={fallbackImg} alt={title} className='w-full h-full object-cover' />
        {/* GIF - loads and fades in when ready */}
        <img
          src={isMobile ? gifMobile : gifDesktop}
          alt={title}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${
            isGifLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsGifLoaded(true)}
        />
        <div className='absolute inset-0 bg-black/60' />
      </div>

      <div className='relative z-10 text-center text-white px-4 max-w-5xl mx-auto'>
        <h1 className='text-5xl text-white md:text-7xl font-heading font-bold mb-8'>{title}</h1>
        <p className='text-xl md:text-2xl mb-12 text-white/90 max-w-4xl mx-auto'>{subtitle}</p>
        <div className='flex justify-center'>
          <Button
            variant='whatsapp'
            size='lg'
            href={whatsappHref}
            leftIcon={<MessageCircle size={24} />}
            className='text-xl px-10 py-5'>
            Get Quote Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsHero;
