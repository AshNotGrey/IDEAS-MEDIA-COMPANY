import React from "react";
import { Users, Calendar, Heart, Zap } from "lucide-react";
import EventsHero from "../components/events/EventsHero";
import EventsJumbotrons from "../components/events/EventsJumbotrons";
import EventsGallery from "../components/events/EventsGallery";
import EventsCTA from "../components/events/EventsCTA";

const EventCoverage = () => {
  const eventTypes = [
    {
      title: "Weddings",
      description:
        "Capture your special day with elegance and style. From intimate ceremonies to grand celebrations, we document every precious moment with artistic flair and attention to detail.",
      icon: Heart,
      image: "/images/idealPhotography-gallery-1.jpg",
      features: ["Full day coverage", "Engagement shoots", "Wedding albums", "Drone footage"],
      cta: "Plan Your Wedding",
    },
    {
      title: "Corporate Events",
      description:
        "Professional documentation for your business events. We capture the energy and professionalism of conferences, product launches, and team events with corporate-grade quality.",
      icon: Users,
      image: "/images/idealPhotography-gallery-2.jpg",
      features: ["Conference coverage", "Product launches", "Team events", "Executive portraits"],
      cta: "Book Corporate Event",
    },
    {
      title: "Birthday Parties",
      description:
        "Make memories last with beautiful party photography. We capture the joy, laughter, and special moments that make birthdays unforgettable for years to come.",
      icon: Calendar,
      image: "/images/idealPhotography-gallery-3.jpg",
      features: ["Candid moments", "Group photos", "Decor shots", "Cake cutting"],
      cta: "Capture Your Party",
    },
    {
      title: "Concerts & Shows",
      description:
        "Dynamic coverage for live performances. From intimate acoustic sessions to large-scale concerts, we bring the energy and excitement of live music to life through stunning visuals.",
      icon: Zap,
      image: "/images/idealPhotography-gallery-4.jpg",
      features: ["Stage photography", "Backstage access", "Crowd shots", "Artist portraits"],
      cta: "Cover Your Show",
    },
  ];

  const galleryImages = Array.from(
    { length: 12 },
    (_, index) => `/images/idealPhotography-gallery-${index + 1}.jpg`
  );

  const handleError = (event) => {
    event.currentTarget.src = "/images/idealPhotography-Asset product-placeholder.png";
  };

  return (
    <div className='min-h-screen'>
      <EventsHero whatsappHref="https://wa.me/+1234567890?text=Hi! I'm interested in event coverage services. Can you tell me more about your packages and pricing?" />

      <EventsJumbotrons
        items={eventTypes}
        whatsappHref="https://wa.me/+1234567890?text=Hi! I'm interested in event coverage services. Can you tell me more about your packages and pricing?"
        onImageError={handleError}
      />

      <EventsGallery images={galleryImages} onImageError={handleError} />

      <EventsCTA whatsappHref="https://wa.me/+1234567890?text=Hi! I'd like to discuss event coverage for my upcoming event. Can you help me with package options and availability?" />
    </div>
  );
};

export default EventCoverage;
