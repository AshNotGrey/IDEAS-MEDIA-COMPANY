import React from "react";
import Hero from "../components/Hero";
import ServicesSection from "../components/ServicesSection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import Stats from "../components/Stats";

const Home = () => (
  <div className='space-y-16 sm:space-y-20 lg:space-y-24'>
    {/* Hero Section */}
    <Hero />

    {/* Our Services Section */}
    <ServicesSection />

    {/* Featured Products Section */}
    <FeaturedProductsSection />

    {/* Why Choose Us Section */}
    <WhyChooseUsSection />

    {/* Stats Section */}
    <Stats />
  </div>
);

export default Home;
