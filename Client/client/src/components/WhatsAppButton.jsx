/**
 * WhatsAppButton Component
 *
 * A floating or inline action button for WhatsApp integration. When no `text` is provided,
 * it renders an icon-only circular FAB. Integrates smoothly with the theme and dark mode.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.text='Chat with us'] - Text label shown beside the icon
 * @param {string} [props.phoneNumber='+1234567890'] - WhatsApp phone number in international format
 * @param {React.ReactNode} [props.icon] - Custom icon; defaults to a Lucide MessageCircle icon
 * @param {string} [props.message] - Pre-filled WhatsApp message
 * @param {string} [props.className] - Additional Tailwind classes
 * @param {boolean} [props.fixed=true] - If true, button is fixed to screen
 * @param {string} [props.position='bottom-right'] - Fixed position location key
 * @param {boolean} [props.animated=true] - Enable animation effects on hover and active
 * @param {Function} [props.onClick] - Custom click handler (overrides default open behavior)
 * @param {Object} [props.rest] - Additional props passed to the button element
 *
 * @example
 * <WhatsAppButton />
 * <WhatsAppButton text="Get Quote" phoneNumber="+2341234567890" message="I'm interested!" />
 * <WhatsAppButton text="" /> // icon-only FAB
 */
import React from "react";
import { MessageCircle } from "lucide-react";
import PropTypes from "prop-types";

const WhatsAppButton = ({
  text = "Chat with us",
  phoneNumber = "+1234567890",
  icon,
  message = "Hello! I'd like to know more about your services.",
  className = "",
  fixed = true,
  position = "bottom-right",
  animated = true,
  onClick,
  ...rest
}) => {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
    "center-right": "top-1/2 right-6 transform -translate-y-1/2",
    "center-left": "top-1/2 left-6 transform -translate-y-1/2",
  };

  const buildWhatsAppUrl = () => {
    const encoded = encodeURIComponent(message);
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  };

  const handleClick = (e) => {
    if (onClick) onClick(e);
    else window.open(buildWhatsAppUrl(), "_blank", "noopener,noreferrer");
  };

  const showText = Boolean(text && text.trim());

  const baseClasses = [
    "btn",
    "btn-primary",
    "z-50",
    "text-sm",
    "rounded-full",
    showText ? "gap-2 px-4 py-3" : "p-3 w-12 h-12 justify-center", // Icon-only fallback
  ];

  const animationClasses = animated
    ? ["hover:scale-[1.05]", "active:scale-95", "transition-all", "duration-300"]
    : [];

  const positionClass = fixed
    ? `fixed ${positionClasses[position] || positionClasses["bottom-right"]}`
    : "";

  const classes = [...baseClasses, ...animationClasses, positionClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      onClick={handleClick}
      aria-label={`Open WhatsApp chat with ${phoneNumber}`}
      title={`Chat with us on WhatsApp: ${phoneNumber}`}
      {...rest}>
      <span className='flex-shrink-0'>{icon || <MessageCircle size={20} />}</span>
      {showText && <span className='hidden sm:inline whitespace-nowrap'>{text}</span>}
    </button>
  );
};

WhatsAppButton.propTypes = {
  text: PropTypes.string,
  phoneNumber: PropTypes.string,
  icon: PropTypes.node,
  message: PropTypes.string,
  className: PropTypes.string,
  fixed: PropTypes.bool,
  position: PropTypes.oneOf([
    "bottom-right",
    "bottom-left",
    "top-right",
    "top-left",
    "center-right",
    "center-left",
  ]),
  animated: PropTypes.bool,
  onClick: PropTypes.func,
};

export default WhatsAppButton;
