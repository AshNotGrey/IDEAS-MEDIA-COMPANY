import React from "react";
import Hero from "../components/Hero";
import ServiceCard from "../components/ServiceCard";
import FeatureCard from "../components/FeatureCard";
import ProductCard from "../components/ProductCard";
import Stats from "../components/Stats";
import { DUMMY_PRODUCTS, OUR_SERVICES, WHY_CHOOSE_US } from "../constants";

const Home = () => (
  <div className='space-y-16 sm:space-y-20 lg:space-y-24'>
    {/* Hero Section */}
    <Hero />

    {/* Our Services Section */}
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

    {/* Featured Products Section */}
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
      <h2 className='text-2xl sm:text-3xl font-heading font-bold mb-2 text-black dark:text-white text-center'>
        Featured Products
      </h2>
      <p className='mb-6 sm:mb-8 text-center text-sm sm:text-lg text-black/80 dark:text-white/80 max-w-2xl mx-auto px-4'>
        Discover our top-rated cameras and accessories, handpicked for quality and value.
      </p>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8'>
        {DUMMY_PRODUCTS.slice(0, 6).map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
      {/* TODO: Replace DUMMY_PRODUCTS with real data from server */}
    </section>

    {/* Why Choose Us Section */}
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

    {/* Stats Section */}
    <section>
      <Stats />
    </section>
  </div>
);

export default Home;
