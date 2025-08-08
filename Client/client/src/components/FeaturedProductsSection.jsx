import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { DUMMY_PRODUCTS } from "../constants";
import { useCart } from "../utils/useCart";
import { motion } from "framer-motion";

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
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleViewDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleAddToCart = (product) => {
    addItem({
      ...product,
      quantity: 1,
    });
  };

  return (
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
      <motion.h2
        className='text-2xl sm:text-3xl font-heading font-bold mb-2 text-black dark:text-white text-center'
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}>
        Featured Products
      </motion.h2>
      <motion.p
        className='mb-6 sm:mb-8 text-center text-sm sm:text-lg text-black/80 dark:text-white/80 max-w-2xl mx-auto px-4'
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        viewport={{ once: true, amount: 0.3 }}>
        Discover our top-rated cameras and accessories, handpicked for quality and value.
      </motion.p>
      <motion.div
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8'
        variants={containerVariants}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, amount: 0.2 }}>
        {DUMMY_PRODUCTS.slice(0, 6).map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard
              {...product}
              onViewDetails={() => handleViewDetails(product)}
              onAddToCart={() => handleAddToCart(product)}
            />
          </motion.div>
        ))}
      </motion.div>
      {/* TODO: Replace DUMMY_PRODUCTS with real data from server */}
    </section>
  );
};

export default FeaturedProductsSection;
