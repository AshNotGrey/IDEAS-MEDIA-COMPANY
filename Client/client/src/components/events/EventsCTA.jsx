import React from "react";
import Button from "../Button";
import { MessageCircle } from "lucide-react";

/**
 * EventsCTA — themed CTA section with WhatsApp action
 */
const EventsCTA = ({
  title = "Ready to Capture Your Event?",
  description = "Let's discuss your event coverage needs and create a custom package that's perfect for your special occasion",
  whatsappHref,
}) => {
  return (
    <section className='bg-ideas-accent text-white transition-all shadow-cardDark dark:shadow-cardDark rounded-2xl py-section px-gutter mx-auto max-w-7xl'>
      <div className='max-w-4xl mx-auto text-center px-4'>
        <h2 className='text-3xl md:text-4xl font-heading font-bold mb-6 text-white'>{title}</h2>
        <p className='text-xl mb-8 text-white'>{description}</p>
        <div className='justify-center'>
          <Button
            variant='whatsapp'
            size='lg'
            href={whatsappHref}
            leftIcon={<MessageCircle size={20} />}>
            Start Planning Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsCTA;
