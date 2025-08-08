import React from "react";
import Image from "./Image";
import { motion } from "framer-motion";

// Absolute paths to gallery images in public/images
const galleryImages = Array.from(
  { length: 12 },
  (_, index) => `/images/idealPhotography-gallery-${index + 1}.jpg`
);

// Masonry-style layout: we let images keep their natural aspect ratios
// and rely on CSS multi-column flow to avoid gaps entirely.

const CustomerGallerySection = () => {
  const handleError = (event) => {
    event.currentTarget.src = "/images/idealPhotography-Asset product-placeholder.png";
  };

  return (
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16'>
      <motion.div
        className='text-center mb-6 sm:mb-8 lg:mb-10'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}>
        <h2 className='text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white'>
          Customer Gallery
        </h2>
        <p className='mt-2 text-sm sm:text-base text-black/70 dark:text-white/70 max-w-2xl mx-auto px-4'>
          Recent shots from our community.
        </p>
      </motion.div>
      {/* CSS columns masonry to eliminate vertical gaps and keep uniform gutters */}
      <div className='[column-fill:_balance] columns-2 sm:columns-3 md:columns-4 gap-2 sm:gap-3 md:gap-4'>
        {galleryImages.map((src, index) => (
          <motion.div
            key={src}
            className='mb-2 sm:mb-3 md:mb-4 lg:mb-5  break-inside-avoid'
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.15 }}>
            <div className='group relative overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-black/5 dark:bg-white/5 shadow-sm hover:shadow-md transition-shadow duration-300'>
              <Image
                src={src}
                alt={`Customer gallery photo ${index + 1}`}
                className='w-full h-auto object-cover will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.04]'
                onError={handleError}
                loading='lazy'
              />
              <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CustomerGallerySection;
