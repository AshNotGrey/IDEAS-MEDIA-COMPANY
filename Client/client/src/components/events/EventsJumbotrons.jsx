import React from "react";
import Image from "../Image";
import Button from "../Button";
import { Star, MessageCircle } from "lucide-react";

/**
 * EventsJumbotrons — alternating image/text blocks styled like ServicesJumbotrons
 */
const EventsJumbotrons = ({ items = [], whatsappHref, onImageError }) => {
  return (
    <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16'>
      <div className='text-center mb-6 sm:mb-8 lg:mb-10'>
        <h2 className='text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white'>
          Events We Cover
        </h2>
        <p className='mt-2 text-sm sm:text-base text-black/70 dark:text-white/70 max-w-2xl mx-auto px-4'>
          From weddings to corporate events, we specialize in capturing the magic of every occasion
        </p>
      </div>

      <div className='space-y-10 sm:space-y-12 lg:space-y-16'>
        {items.map((event, index) => {
          const isReversed = index % 2 === 1;
          const Icon = event.icon;

          return (
            <article
              key={event.title}
              className='grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center'>
              {/* Image */}
              <div className={`lg:col-span-7 ${isReversed ? "lg:order-2" : "lg:order-1"}`}>
                <div className='relative overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-black/5 dark:bg-white/5 shadow-cardDark dark:shadow-cardDark'>
                  <Image
                    src={event.image}
                    alt={event.title}
                    className='w-full h-auto object-cover transition-transform duration-500 ease-out hover:scale-[1.03]'
                    onError={onImageError}
                  />
                  <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent' />
                </div>
              </div>

              {/* Text */}
              <div className={`lg:col-span-5 ${isReversed ? "lg:order-1" : "lg:order-2"}`}>
                <div className='h-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left'>
                  <div className='flex items-center mb-4'>
                    {Icon && <Icon className='w-8 h-8 text-ideas-accent mr-3' />}
                    <h3 className='text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white'>
                      {event.title}
                    </h3>
                  </div>
                  <p className='mt-3 sm:mt-4 text-sm sm:text-base text-black/70 dark:text-white/70 max-w-2xl mb-6'>
                    {event.description}
                  </p>
                  {Array.isArray(event.features) && event.features.length > 0 && (
                    <ul className='space-y-2 mb-6 text-left'>
                      {event.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className='text-sm text-black/70 dark:text-white/70 flex items-center'>
                          <Star className='w-4 h-4 text-ideas-accent mr-2 flex-shrink-0' />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className='flex justify-center lg:justify-start'>
                    <Button
                      variant='whatsapp'
                      size='md'
                      href={whatsappHref}
                      leftIcon={<MessageCircle size={18} />}>
                      {event.cta || "Let's discuss"}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default EventsJumbotrons;
