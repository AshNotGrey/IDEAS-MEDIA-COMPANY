import React from "react";
import FeatureCard from "./FeatureCard";
import { WHY_CHOOSE_US } from "../constants";

/**
 * Why Choose Us section component for the homepage
 * Displays reasons why customers should choose Ideal Photography
 *
 * @component
 * @example
 * <WhyChooseUsSection />
 *
 * @returns {JSX.Element} Why choose us section with grid of feature cards
 */
const WhyChooseUsSection = () => {
  return (
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
      <h2 className='text-2xl sm:text-3xl font-heading font-bold mb-4 sm:mb-8 text-black dark:text-white text-center'>
        Why Choose Ideal Photography?
      </h2>
      <p className='mb-8 sm:mb-12 text-center text-sm sm:text-lg text-black/80 dark:text-white/80 max-w-2xl mx-auto px-4'>
        We're more than just a rental service. We're your creative partners, providing the tools and
        support you need to bring your vision to life.
      </p>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8'>
        {WHY_CHOOSE_US.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
