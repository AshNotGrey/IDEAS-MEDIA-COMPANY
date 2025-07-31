/**
 * ContactUs Component
 *
 * A contact form with email sending functionality using EmailJS.
 * Includes form validation via react-hook-form and local state management.
 *
 * Optional: You can add toast notifications using a library like `react-hot-toast`.
 * Example:
 * import { toast } from 'react-hot-toast';
 * toast.success("Message sent!");
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import { emailConfig } from "../config/email.config";

/**
 * Handles the contact form submission and email dispatch.
 * @returns {JSX.Element} Contact form and company contact info
 */
const ContactUs = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Submit handler for contact form.
   * @param {{ name: string, email: string, message: string }} data - User input data
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        {
          from_name: data.name,
          from_email: data.email,
          message: data.message,
        },
        emailConfig.publicKey
      );

      if (result.status === 200) {
        setSuccess(true);
        reset();

        // Optional: Add toast notification for success
        // toast.success("Message sent successfully!");
      } else {
        throw new Error("Email not sent");
      }
    } catch (err) {
      console.error("Email sending error:", err);
      setError("Something went wrong. Please try again.");

      // Optional: Add toast notification for error
      // toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-section space-y-12'>
      <h1 className='section-title'>Contact Us</h1>

      <div className='grid md:grid-cols-2 gap-8'>
        {/* Contact Form */}
        <div className='card space-y-6'>
          <h2 className='text-xl font-semibold'>Send us a message</h2>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <input
              type='text'
              placeholder='Your Name'
              className='input w-full'
              {...register("name", { required: true })}
            />
            {errors.name && <p className='text-red-500 text-sm'>Name is required</p>}

            <input
              type='email'
              placeholder='Your Email'
              className='input w-full'
              {...register("email", { required: true })}
            />
            {errors.email && <p className='text-red-500 text-sm'>Email is required</p>}

            <textarea
              placeholder='Your Message'
              className='input w-full h-32 resize-none'
              {...register("message", { required: true })}
            />
            {errors.message && <p className='text-red-500 text-sm'>Message is required</p>}

            <button
              type='submit'
              className='btn-primary w-full disabled:opacity-50'
              disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>

            {success && <p className='text-green-500 text-sm'>Message sent successfully!</p>}
            {error && <p className='text-red-500 text-sm'>{error}</p>}
          </form>
        </div>

        {/* Contact Info */}
        <div className='card space-y-6'>
          <h2 className='text-xl font-semibold'>Reach us directly</h2>
          <div className='space-y-2 text-subtle'>
            <p>
              <strong>Email:</strong> support@idealphotography.com
            </p>
            <p>
              <strong>Phone:</strong> +234 800 000 0000
            </p>
            <p>
              <strong>Hours:</strong> Mon - Fri, 9am - 6pm (WAT)
            </p>
            <a
              href='https://wa.me/2348000000000'
              target='_blank'
              rel='noopener noreferrer'
              className='btn-secondary mt-4 inline-block'>
              Message on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
