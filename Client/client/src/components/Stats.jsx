import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import gsap from "gsap";
/**
 * Animated statistics section for the Jumbotron/About page.
 *
 * Uses GSAP for animated counting and react-intersection-observer to trigger
 * the animation when the component enters the viewport.
 *
 * @component
 * @example
 * <Stats />
 *
 * @returns {JSX.Element} Animated stats section
 */

const stats = [
  { id: 1, name: "Equipment rented monthly", value: 2500, suffix: "+" },
  { id: 2, name: "Studio bookings completed", value: 1200, suffix: "+" },
  { id: 3, name: "Happy photographers", value: 850, suffix: "+" },
  { id: 4, name: "Cities served", value: 12, suffix: "" },
];

export default function Stats() {
  const [counts, setCounts] = useState(Array(stats.length).fill(0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);

      stats.forEach((stat, index) => {
        gsap.to(
          {},
          {
            duration: 3,
            ease: "power2.out",
            onUpdate: function () {
              const progress = this.progress();
              const currentValue = Math.floor(stat.value * progress);
              setCounts((prev) => {
                const newCounts = [...prev];
                newCounts[index] = currentValue;
                return newCounts;
              });
            },
            onComplete: function () {
              setCounts((prev) => {
                const newCounts = [...prev];
                newCounts[index] = stat.value;
                return newCounts;
              });
            },
          }
        );
      });
    }
  }, [inView, hasAnimated]);

  return (
    <section className='bg-white dark:bg-ideas-darkInput text-black dark:text-white transition-all shadow-cardDark dark:shadow-cardDark rounded-2xl py-section px-gutter mx-auto max-w-7xl'>
      <div className='text-center'>
        <h2 className='section-title text-4xl sm:text-5xl text-ideas-accent dark:text-ideas-accent'>
          Trusted by creative teams worldwide
        </h2>
        <p className='mt-4 text-lg text-subtle max-w-2xl mx-auto'>
          Join thousands of photographers who trust us with their equipment and studio needs.
        </p>

        <dl
          ref={ref}
          className='mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center'>
          {stats.map((stat, index) => (
            <div key={stat.id} className='card'>
              <dd className='text-4xl font-bold text-ideas-accent'>
                {counts[index].toLocaleString()}
                {stat.suffix}
              </dd>
              <dt className='mt-2 text-subtle'>{stat.name}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
