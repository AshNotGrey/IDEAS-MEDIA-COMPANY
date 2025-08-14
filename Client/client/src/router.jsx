import React from "react";
import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute, { RequireAuth, RequireGuest } from "./components/auth/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SignIn from "./components/auth/signIn";
import SignUp from "./components/auth/signUp";
import ForgotPassword from "./components/auth/forgotPassword";
import ResetPassword from "./components/auth/resetPassword";
import EmailVerification from "./components/auth/emailVerification";
import EquipmentRentals from "./pages/EquipmentRentals";
import MakeoverBookings from "./pages/MakeoverBookings";
import PhotoshootBookings from "./pages/PhotoshootBookings";
import EventCoverage from "./pages/EventCoverage";
import MiniMart from "./pages/MiniMart";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import RentalBookingDetails from "./pages/RentalBookingDetails";
import Notifications from "./pages/Notifications";
import Wishlist from "./pages/Wishlist";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import {
  AccountDeactivated,
  AccountLocked,
  EmailVerificationRequired,
} from "./pages/AccountStatus";

/**
 * Main site layout with Navbar, Footer, and routed content.
 */
function MainLayout() {
  return (
    <div className='min-h-screen flex flex-col bg-ideas-white dark:bg-ideas-black transition-colors'>
      <Navbar />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      // Public routes (no authentication required - fully browsable)
      { path: "/", element: <Home /> },
      { path: "/about", element: <AboutUs /> },
      { path: "/contact", element: <ContactUs /> },
      { path: "/faqs", element: <FAQs /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/terms", element: <TermsConditions /> },
      { path: "/product/:id", element: <ProductDetails /> },
      { path: "/equipment", element: <EquipmentRentals /> },
      { path: "/makeover", element: <MakeoverBookings /> },
      { path: "/photoshoot", element: <PhotoshootBookings /> },
      { path: "/events", element: <EventCoverage /> },
      { path: "/mini-mart", element: <MiniMart /> },
      { path: "/cart", element: <Cart /> },

      // User account routes (authentication required for personalized features)
      {
        path: "/dashboard",
        element: (
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        ),
      },
      {
        path: "/history",
        element: (
          <RequireAuth>
            <History />
          </RequireAuth>
        ),
      },
      {
        path: "/settings",
        element: (
          <RequireAuth>
            <Settings />
          </RequireAuth>
        ),
      },
      {
        path: "/notifications",
        element: (
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        ),
      },

      // Public shopping & booking routes (guests can browse, add to cart, view details)
      { path: "/wishlist", element: <Wishlist /> },
      { path: "/rental/:id", element: <RentalBookingDetails /> },

      // Checkout - only step requiring authentication
      {
        path: "/checkout",
        element: (
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        ),
      },

      // Account status pages
      { path: "/account-deactivated", element: <AccountDeactivated /> },
      { path: "/account-locked", element: <AccountLocked /> },
      { path: "/email-verification-required", element: <EmailVerificationRequired /> },

      // 404 fallback
      { path: "*", element: <NotFound /> },
    ],
  },

  // Guest-only routes (redirect if authenticated)
  {
    path: "/signin",
    element: (
      <RequireGuest>
        <SignIn />
      </RequireGuest>
    ),
  },
  {
    path: "/signup",
    element: (
      <RequireGuest>
        <SignUp />
      </RequireGuest>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <RequireGuest>
        <ForgotPassword />
      </RequireGuest>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <RequireGuest>
        <ResetPassword />
      </RequireGuest>
    ),
  },

  // Email verification can be accessed by authenticated users
  { path: "/email-verification", element: <EmailVerification /> },
]);

/**
 * AppRouter provides the main router for the application.
 * Wrapped with AuthProvider to provide global authentication state.
 */
export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  );
}
