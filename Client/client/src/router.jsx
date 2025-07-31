import React from "react";
import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SignIn from "./components/auth/signIn";
import SignUp from "./components/auth/signUp";
import ForgotPassword from "./components/auth/forgotPassword";
import ResetPassword from "./components/auth/resetPassword";
import EquipmentRentals from "./pages/EquipmentRentals";
import MakeoverBookings from "./pages/MakeoverBookings";
import PhotoshootBookings from "./pages/PhotoshootBookings";
import EventCoverage from "./pages/EventCoverage";
import MiniMart from "./pages/MiniMart";
import AccountDashboard from "./pages/AccountDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PastRentalsBookings from "./pages/PastRentalsBookings";
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
      { path: "/", element: <Home /> },
      { path: "/equipment", element: <EquipmentRentals /> },
      { path: "/makeover", element: <MakeoverBookings /> },
      { path: "/photoshoot", element: <PhotoshootBookings /> },
      { path: "/events", element: <EventCoverage /> },
      { path: "/mini-mart", element: <MiniMart /> },
      { path: "/account", element: <AccountDashboard /> },
      { path: "/cart", element: <Cart /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/history", element: <PastRentalsBookings /> },
      { path: "/product/:id", element: <ProductDetails /> },
      { path: "/about", element: <AboutUs /> },
      { path: "/contact", element: <ContactUs /> },
      { path: "/faqs", element: <FAQs /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/terms", element: <TermsConditions /> },
      { path: "/settings", element: <Settings /> },
      { path: "/rental/:id", element: <RentalBookingDetails /> },
      { path: "/notifications", element: <Notifications /> },
      { path: "/wishlist", element: <Wishlist /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
]);

/**
 * AppRouter provides the main router for the application.
 */
export default function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
