import React from "react";
import ProductCard from "./ProductCard";
import { DUMMY_PRODUCTS } from "../constants";

/**
 * Featured Products section component for the homepage
 * Displays the first 6 featured products in a responsive grid layout
 *
 * @component
 * @example
 * <FeaturedProductsSection />
 *
 * @returns {JSX.Element} Featured products section with grid of product cards
 */
const FeaturedProductsSection = () => {
  return (
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
  );
};

export default FeaturedProductsSection;
