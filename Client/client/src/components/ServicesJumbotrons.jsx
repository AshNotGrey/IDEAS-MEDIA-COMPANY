import React from "react";
import Image from "./Image";
import Button from "./Button";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const items = [
  {
    title: "Studio & Equipment Rentals",
    description:
      "Top-tier cameras, lenses, lighting and studio spaces ready for your next shoot. Flexible plans for day, week or month.",
    href: "/equipment",
    image: "/images/idealPhotography-jumbotron-1.png",
    cta: "Browse Equipment",
  },
  {
    title: "Makeover Sessions",
    description:
      "Professional makeup and styling for bridal, editorial and everyday looks. Step in confident and camera-ready.",
    href: "/makeover",
    image: "/images/idealPhotography-jumbotron-2.jpg",
    cta: "Book a Makeover",
  },
  {
    title: "Photoshoot Bookings",
    description:
      "Studio or outdoor sessions with expert guidance, lighting and creative direction tailored to your vision.",
    href: "/photoshoot",
    image: "/images/idealPhotography-jumbotron-3.jpg",
    cta: "Schedule a Session",
  },
];

const ServicesJumbotrons = () => {
  const handleError = (e) => {
    e.currentTarget.src = "/images/idealPhotography-Asset product-placeholder.png";
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
          What We Offer
        </h2>
        <p className='mt-2 text-sm sm:text-base text-black/70 dark:text-white/70 max-w-2xl mx-auto px-4'>
          Dive deeper into our core services.
        </p>
      </motion.div>

      <motion.div
        className='space-y-10 sm:space-y-12 lg:space-y-16'
        variants={containerVariants}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, amount: 0.2 }}>
        {items.map((item, index) => {
          const isReversed = index % 2 === 1;

          return (
            <motion.article
              key={item.title}
              variants={itemVariants}
              className='grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center'>
              {/* Image */}
              <div className={`lg:col-span-7 ${isReversed ? "lg:order-2" : "lg:order-1"}`}>
                <div className='relative overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-black/5 dark:bg-white/5 shadow-cardDark dark:shadow-cardDark'>
                  <Image
                    src={item.image}
                    alt={item.title}
                    className='w-full h-auto object-cover transition-transform duration-500 ease-out hover:scale-[1.03]'
                    onError={handleError}
                  />
                  <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent' />
                </div>
              </div>

              {/* Text */}
              <div className={`lg:col-span-5 ${isReversed ? "lg:order-1" : "lg:order-2"}`}>
                <div className='h-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left'>
                  <h3 className='text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white'>
                    {item.title}
                  </h3>
                  <p className='mt-3 sm:mt-4 text-sm sm:text-base text-black/70 dark:text-white/70 max-w-2xl'>
                    {item.description}
                  </p>
                  <div className='mt-5 sm:mt-6 flex justify-center lg:justify-start'>
                    <Button href={item.href} variant='primary' size='md' animated>
                      {item.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
};

export default ServicesJumbotrons;
