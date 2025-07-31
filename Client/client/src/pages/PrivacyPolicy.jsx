import React from "react";
import { Link } from "react-router-dom";
import { Camera, ArrowLeft, Shield, Eye, Lock, Info, Cookie } from "lucide-react";

const PRIVACY_POLICY_SECTIONS = [
  {
    title: "Information We Collect",
    icon: <Info size={24} />,
    content:
      "We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form.",
    list: ["Name", "Email address", "Phone number", "Address", "City", "Country"],
  },
  {
    title: "How We Use Your Information",
    icon: <Shield size={24} />,
    content:
      "We use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or fill out a form.",
    list: [
      "To personalize your experience",
      "To improve our website",
      "To send periodic emails",
      "To process transactions",
      "To administer a contest, promotion, survey or other site feature",
    ],
  },
  {
    title: "How We Protect Your Information",
    icon: <Shield size={24} />,
    content:
      "We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.",
  },
  {
    title: "How We Use Cookies",
    icon: <Cookie size={24} />,
    content:
      "We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.",
  },
];

const Privacy = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-ideas-white via-white to-ideas-white dark:from-ideas-black dark:via-ideas-darkInput dark:to-ideas-black'>
      {/* Header */}
      <div className='bg-white dark:bg-ideas-darkInput border-b border-black/10 dark:border-white/10'>
        <div className='max-w-4xl mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            {/* Logo */}
            <div className='flex items-center space-x-2'>
              <Camera size={28} className='text-ideas-accent' />
              <span className='text-xl font-heading font-bold text-black dark:text-white'>
                Ideal Photography
              </span>
            </div>

            {/* Back Button */}
            <Link
              to='/signup'
              className='inline-flex items-center text-sm text-ideas-accent hover:text-ideas-accentHover transition-colors'>
              <ArrowLeft size={16} className='mr-2' />
              Back to Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-4xl mx-auto px-6 py-12'>
        <div className='card shadow-xl'>
          {/* Title */}
          <div className='text-center mb-12'>
            <div className='flex items-center justify-center mb-4'>
              <Shield size={48} className='text-ideas-accent' />
            </div>
            <h1 className='text-4xl font-heading font-bold text-black dark:text-white mb-4'>
              Privacy Policy
            </h1>
            <p className='text-subtle'>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Privacy Content */}
          <div className='prose prose-lg dark:prose-invert max-w-none'>
            {PRIVACY_POLICY_SECTIONS.map(({ title, icon, content, list, custom }, idx) => (
              <section className='mb-8' key={idx}>
                <h2 className='text-2xl font-semibold text-black dark:text-white mb-4 flex items-center'>
                  {icon}
                  {title}
                </h2>
                <p className='text-subtle mb-4'>{content}</p>
                {list && (
                  <ul className='list-disc list-inside text-subtle ml-4 space-y-2'>
                    {list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {custom}
              </section>
            ))}
          </div>

          {/* Footer */}
          <div className='text-center mt-12 pt-8 border-t divider'>
            <p className='text-sm text-subtle'>
              Your privacy is important to us. We are committed to protecting your personal
              information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
