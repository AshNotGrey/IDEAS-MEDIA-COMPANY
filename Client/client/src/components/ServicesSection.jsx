import React from "react";
import ServiceCard from "./ServiceCard";
import { OUR_SERVICES } from "../constants";

/**
 * Services section component for the homepage
 * Displays all available services in a responsive grid layout
 *
 * @component
 * @example
 * <ServicesSection />
 *
 * @returns {JSX.Element} Services section with grid of service cards
 */
const ServicesSection = () => {
  return (
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
      <h2 className='text-2xl sm:text-3xl font-heading font-bold mb-2 text-black dark:text-white text-center'>
        Our Services
      </h2>
      <p className='mb-6 sm:mb-8 text-center text-sm sm:text-lg text-black/80 dark:text-white/80 max-w-2xl mx-auto px-4'>
        Explore our range of professional photography services, from equipment rentals to makeover
        sessions and more.
      </p>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8'>
        {OUR_SERVICES.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
