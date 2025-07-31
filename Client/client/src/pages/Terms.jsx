import React from "react";
import { Link } from "react-router-dom";
import { Camera, ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className='min-h-screen bg-ideas-white dark:bg-ideas-black'>
      {/* Header */}
      <header className='bg-white dark:bg-ideas-darkInput border-b border-black/10 dark:border-white/10'>
        <div className='max-w-4xl mx-auto px-6 py-6 flex items-center justify-between'>
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
      </header>

      {/* Page Content */}
      <main className='max-w-4xl mx-auto px-6 py-12'>
        <div className='card shadow-md dark:shadow-cardDark'>
          {/* Title */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-heading font-bold text-black dark:text-white mb-4'>
              Terms of Service
            </h1>
            <p className='text-subtle'>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Terms Body */}
          <div className='prose prose-lg dark:prose-invert max-w-none'>
            {[
              {
                title: "1. Acceptance of Terms",
                text: "By accessing and using Ideal Photography's services, you accept and agree to be bound by the terms and provision of this agreement.",
              },
              {
                title: "2. Description of Service",
                text: "Ideal Photography provides professional photography services including but not limited to portrait photography, event coverage, and photo editing services.",
              },
              {
                title: "3. User Accounts",
                text: "When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.",
              },
              {
                title: "4. Booking and Cancellation",
                text: "Bookings must be confirmed at least 48 hours in advance. Cancellations made within 24 hours of the scheduled session may incur a cancellation fee. We reserve the right to reschedule sessions due to weather conditions or other circumstances beyond our control.",
              },
              {
                title: "5. Payment Terms",
                text: "Payment is due at the time of booking. We accept various payment methods including credit cards, bank transfers, and digital payments. All prices are subject to change without notice.",
              },
              {
                title: "6. Intellectual Property",
                text: "All photographs taken by Ideal Photography remain the property of the photographer until full payment is received. Upon full payment, clients receive usage rights as specified in their service agreement.",
              },
              {
                title: "7. Privacy and Data Protection",
                text: "We are committed to protecting your privacy. Your personal information will be used only for the purposes outlined in our Privacy Policy and will not be shared with third parties without your consent.",
              },
              {
                title: "8. Limitation of Liability",
                text: "Ideal Photography shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.",
              },
              {
                title: "9. Changes to Terms",
                text: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of the modified terms.",
              },
              {
                title: "10. Contact Information",
                text: "If you have any questions about these Terms of Service, please contact us at:",
              },
            ].map((section, index) => (
              <section key={index} className='mb-8'>
                <h2 className='text-2xl font-semibold font-heading text-black dark:text-white mb-4'>
                  {section.title}
                </h2>
                <p className='text-subtle mb-4'>{section.text}</p>
                {section.title === "10. Contact Information" && (
                  <div className='bg-ideas-lightInput dark:bg-ideas-darkInput rounded-lg p-4'>
                    <p className='text-black dark:text-white'>
                      Email: legal@idealphotography.com
                      <br />
                      Phone: +1 (555) 123-4567
                      <br />
                      Address: 123 Photography Lane, Creative City, CC 12345
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Footer */}
          <div className='text-center mt-12 pt-8 divider'>
            <p className='text-subtle'>
              By using our services, you agree to these terms and conditions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
