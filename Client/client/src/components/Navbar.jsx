/**
 * Navbar component
 *
 * Renders the site's navigation bar with responsive layout and theme toggling.
 * Uses framer-motion for animations and GSAP for theme icon rotation.
 *
 * Includes:
 * - Desktop and mobile navigation links
 * - Dark/light mode toggle
 * - Shopping cart and notification icons
 * - Dropdown menu for account actions
 *
 * @component
 */
import { useEffect, useState, useRef } from "react";
import { Menu, X, User, CalendarDays, Heart, LogOut, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "./Button.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import CartIcon from "./CartIcon.jsx";
import NotificationIcon from "./NotificationIcon.jsx";
import { useAuth } from "../graphql/hooks/useAuth";

/**
 * Navigation link configuration
 * @type {Array<{label: string, href: string}>}
 */
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Equipment", href: "/equipment" },
  { label: "Make overs", href: "/makeover" },
  { label: "Studio", href: "/photoshoot" },
  { label: "Shop", href: "/mini-mart" },
  { label: "Event Coverage", href: "/events" },
];

/**
 * Main Navbar component
 * @returns {JSX.Element}
 */
export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const closeOnEsc = (e) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", closeOnEsc);
    return () => document.removeEventListener("keydown", closeOnEsc);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <>
      <header className='sticky top-0 z-50 bg-ideas-white dark:bg-ideas-black shadow-sm transition-shadow'>
        <nav className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between'>
          {/* Left */}
          <div className='flex items-center gap-2 sm:gap-4'>
            <button
              onClick={() => setSidebarOpen(true)}
              className='lg:hidden text-black dark:text-white p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors'
              aria-label='Open menu'>
              <Menu className='w-5 h-5 sm:w-6 sm:h-6' />
            </button>
            <Link to='/' className='flex items-center gap-1 sm:gap-2 h-8 no-underline'>
              <img
                src='/images/idealphotography-logo-main.jpg'
                alt='IdealPhoto Logo'
                className='h-6 w-auto sm:h-8 rounded-sm drop-shadow-sm'
              />
              <span className='hidden sm:inline lg:inline text-sm sm:text-lg font-heading font-bold text-black dark:text-white capitalize'>
                IDEAS MEDIA COMPANY
              </span>
            </Link>
          </div>

          {/* Center - Desktop Navigation */}
          <ul className='hidden lg:flex gap-4 xl:gap-6 items-center text-sm font-medium'>
            {NAV_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className='px-2 py-1 rounded text-black dark:text-white hover:text-ideas-accent transition-colors hover:scale-105 active:scale-95'>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right */}
          <div className='flex gap-2 sm:gap-3 md:gap-4 items-baseline'>
            <ThemeToggle size='md' variant='icon' />

            <CartIcon size='md' variant='icon' animated={true} />

            <NotificationIcon size='md' variant='icon' animated={true} />

            <div className='relative' ref={dropdownRef}>
              {isAuthenticated ? (
                <>
                  <Button
                    variant='secondary'
                    className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full'
                    onClick={() => setDropdownOpen((v) => !v)}>
                    <User className='w-4 h-4 sm:w-5 sm:h-5 text-ideas-accent' />
                    <span className='hidden sm:inline text-ideas-accent'>Account</span>
                  </Button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        className='absolute right-0 mt-2 w-40 sm:w-48 bg-ideas-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50'
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}>
                        <Link
                          to='/account'
                          className='flex items-center gap-2 px-3 sm:px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white w-full'>
                          <User className='w-4 h-4 text-ideas-accent' />
                          My Account
                        </Link>
                        <Link
                          to='/history'
                          className='flex items-center gap-2 px-3 sm:px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white w-full'>
                          <CalendarDays className='w-4 h-4 text-ideas-accent' />
                          Bookings
                        </Link>
                        <Link
                          to='/wishlist'
                          className='flex items-center gap-2 px-3 sm:px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white w-full'>
                          <Heart className='w-4 h-4 text-ideas-accent' />
                          Wishlist
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className='flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 w-full'>
                          <LogOut className='w-4 h-4 text-red-500' />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to='/signin'>
                  <Button
                    variant='secondary'
                    className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full'>
                    <User className='w-4 h-4 sm:w-5 sm:h-5 text-ideas-accent' />
                    <span className='hidden sm:inline text-ideas-accent'>Sign In</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className='fixed top-0 left-0 h-full w-72 sm:w-80 bg-ideas-white dark:bg-ideas-black border-r border-gray-200 dark:border-gray-700 z-50 shadow-lg'
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className='p-4 sm:p-6 space-y-4'>
                <div className='flex items-center justify-between'>
                  <Link
                    to='/'
                    className='flex items-center gap-2'
                    onClick={() => setSidebarOpen(false)}>
                    <img
                      src='/images/idealphotography-logo-main.jpg'
                      alt='IdealPhoto Logo'
                      className='h-8 w-auto rounded-sm drop-shadow-sm'
                    />
                    <span className='text-lg font-heading font-bold text-black dark:text-white capitalize leading-tight'>
                      IDEAS MEDIA COMPANY
                    </span>
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className='text-black dark:text-white p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors'
                    aria-label='Close menu'>
                    <X className='w-6 h-6' />
                  </button>
                </div>

                <nav className='space-y-2 mt-6'>
                  {NAV_LINKS.map((item) => (
                    <div key={item.label}>
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className='block text-base font-medium text-black dark:text-white hover:text-ideas-accent hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors hover:scale-105 active:scale-95'>
                        {item.label}
                      </Link>
                    </div>
                  ))}
                </nav>

                {/* Mobile Account Actions */}
                <div className='pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2'>
                  {isAuthenticated ? (
                    <>
                      <Link
                        to='/account'
                        onClick={() => setSidebarOpen(false)}
                        className='flex items-center gap-2 text-base font-medium text-black dark:text-white hover:text-ideas-accent hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors'>
                        <User className='w-5 h-5 text-ideas-accent' />
                        <span>My Account</span>
                      </Link>
                      <Link
                        to='/cart'
                        onClick={() => setSidebarOpen(false)}
                        className='flex items-center gap-2 text-base font-medium text-black dark:text-white hover:text-ideas-accent hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors'>
                        <ShoppingCart className='w-5 h-5 text-ideas-accent' />
                        <span>Cart</span>
                      </Link>
                      <Link
                        to='/wishlist'
                        onClick={() => setSidebarOpen(false)}
                        className='flex items-center gap-2 text-base font-medium text-black dark:text-white hover:text-ideas-accent hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors'>
                        <Heart className='w-5 h-5 text-ideas-accent' />
                        <span>Wishlist</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setSidebarOpen(false);
                        }}
                        className='flex items-center gap-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors w-full text-left'>
                        <LogOut className='w-5 h-5 text-red-500' />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to='/signin'
                        onClick={() => setSidebarOpen(false)}
                        className='flex items-center gap-2 text-base font-medium text-black dark:text-white hover:text-ideas-accent hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors'>
                        <User className='w-5 h-5 text-ideas-accent' />
                        <span>Sign In</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
            <motion.div
              className='fixed inset-0 bg-black/50 z-40'
              onClick={() => setSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
