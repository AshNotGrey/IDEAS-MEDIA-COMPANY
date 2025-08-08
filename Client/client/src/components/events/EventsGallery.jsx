import React from "react";
import Image from "../Image";
import { motion as Motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * EventsGallery — responsive grid gallery styled like CustomerGallerySection
 */
const EventsGallery = ({ images = [], onImageError }) => {
  return (
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16'>
      <Motion.div
        className='text-center mb-6 sm:mb-8 lg:mb-10'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}>
        <h2 className='text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white'>
          Our Event Gallery
        </h2>
        <p className='mt-2 text-sm sm:text-base text-black/70 dark:text-white/70 max-w-2xl mx-auto px-4'>
          Take a look at some of our recent event coverage work
        </p>
      </Motion.div>
      <Motion.div
        className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
        variants={containerVariants}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, amount: 0.2 }}>
        {images.map((src, index) => (
          <Motion.div key={src} className='group' variants={itemVariants}>
            <div className='relative overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-black/5 dark:bg-white/5 shadow-sm hover:shadow-md transition-shadow duration-300'>
              <Image
                src={src}
                alt={`Event coverage photo ${index + 1}`}
                className='w-full h-48 md:h-56 object-cover will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.04]'
                onError={onImageError}
                loading='lazy'
              />
              <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </div>
          </Motion.div>
        ))}
      </Motion.div>
    </section>
  );
};

export default EventsGallery;
