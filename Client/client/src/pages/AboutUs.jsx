import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Stats from "../components/Stats.jsx";

gsap.registerPlugin(ScrollTrigger);

const visionBlurb = {
  title: "Our Vision",
  content:
    "We aim to be Africa’s most innovative hub for photography equipment rentals, makeover and shoot bookings, and digital creative commerce — all under one cohesive experience.",
};

const values = [
  "Transparency & Trust",
  "Creativity First",
  "Community Driven",
  "Sustainability",
  "Tech + Craft Balance",
  "User Obsession",
];

const team = [
  { name: "Jane Doe", role: "Founder & CEO", image: null },
  { name: "Chuka Obi", role: "Head of Ops", image: null },
  { name: "Zainab Musa", role: "Lead Dev", image: null },
  // Add more team members easily
];

const AboutUs = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(
      sectionRef.current.querySelectorAll(".animate-in"),
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      }
    );
  }, []);

  return (
    <div ref={sectionRef} className='max-w-6xl mx-auto px-4 py-section space-y-16'>
      {/* Section Heading */}
      <div className='text-center animate-in'>
        <h1 className='section-title mb-4'>About Us</h1>
        <p className='text-lg text-subtle max-w-2xl mx-auto'>
          We’re not just a platform — we’re a movement. Our mission is to democratize photography
          access, simplify creative bookings, and empower visual storytelling through seamless
          digital tools.
        </p>
      </div>

      {/* Vision Card */}
      <div className='card card-hover text-center animate-in'>
        <h2 className='text-xl font-semibold mb-2'>{visionBlurb.title}</h2>
        <p className='text-subtle'>{visionBlurb.content}</p>
      </div>

      {/* Stats Component */}
      <div className='animate-in'>
        <Stats />
      </div>

      {/* Core Values */}
      <div className='space-y-6 animate-in'>
        <h2 className='text-xl font-semibold text-center'>Our Core Values</h2>
        <ul className='grid md:grid-cols-3 gap-4'>
          {values.map((value, idx) => (
            <li key={idx} className='card card-hover text-center'>
              <p className='text-subtle'>{value}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Team Intro */}
      <div className='animate-in'>
        <h2 className='text-xl font-semibold mb-4 text-center'>Meet the Team</h2>
        <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {team.map((member, idx) => (
            <div key={idx} className='card card-hover text-center'>
              <div className='w-24 h-24 mx-auto mb-2 rounded-full bg-gray-300 dark:bg-gray-600 skeleton' />
              <div className='font-medium'>{member.name}</div>
              <div className='text-subtle text-sm'>{member.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
