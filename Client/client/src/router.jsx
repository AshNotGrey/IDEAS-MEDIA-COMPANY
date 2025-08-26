import React, { Suspense, lazy } from "react";
import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute, { RequireAuth, RequireGuest } from "./components/auth/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
// import CampaignRenderer from "./components/campaigns/CampaignRenderer";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./components/auth/signIn"));
const SignUp = lazy(() => import("./components/auth/signUp"));
const ForgotPassword = lazy(() => import("./components/auth/forgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/resetPassword"));
const EmailVerification = lazy(() => import("./components/auth/emailVerification"));
const IDVerification = lazy(() => import("./components/auth/idVerification"));
const EquipmentRentals = lazy(() => import("./pages/EquipmentRentals"));
const MakeoverBookings = lazy(() => import("./pages/MakeoverBookings"));
const PhotoshootBookings = lazy(() => import("./pages/PhotoshootBookings"));
const EventCoverage = lazy(() => import("./pages/EventCoverage"));
const MiniMart = lazy(() => import("./pages/MiniMart"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const FAQs = lazy(() => import("./pages/FAQs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));
const RentalBookingDetails = lazy(() => import("./pages/RentalBookingDetails"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
const AccountDeactivated = lazy(() =>
  import("./pages/AccountStatus").then((module) => ({ default: module.AccountDeactivated }))
);
const AccountLocked = lazy(() =>
  import("./pages/AccountStatus").then((module) => ({ default: module.AccountLocked }))
);
const EmailVerificationRequired = lazy(() =>
  import("./pages/AccountStatus").then((module) => ({ default: module.EmailVerificationRequired }))
);
const IDValidationRequired = lazy(() =>
  import("./pages/AccountStatus").then((module) => ({ default: module.IDValidationRequired }))
);

// Suspense wrapper component for lazy-loaded routes
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

/**
 * Main site layout with Navbar, Footer, and routed content.
 */
function MainLayout() {
  return (
    <div className='min-h-screen flex flex-col bg-ideas-white dark:bg-ideas-black transition-colors'>
      {/* Top Banner Area - Campaign Integration Point */}
      {/*   <CampaignRenderer
        placement='top_banner'
        className='w-full z-10'
        options={{
          bannerStyle: "hero",
          showCloseButton: true,
          autoClose: false,
          animation: "slide-down",
        }}
      /> */}
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
      {
        path: "/",
        element: (
          <SuspenseWrapper>
            <Home />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/about",
        element: (
          <SuspenseWrapper>
            <AboutUs />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/contact",
        element: (
          <SuspenseWrapper>
            <ContactUs />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/faqs",
        element: (
          <SuspenseWrapper>
            <FAQs />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/privacy",
        element: (
          <SuspenseWrapper>
            <PrivacyPolicy />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/terms",
        element: (
          <SuspenseWrapper>
            <TermsConditions />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/product/:id",
        element: (
          <SuspenseWrapper>
            <ProductDetails />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/equipment",
        element: (
          <SuspenseWrapper>
            <EquipmentRentals />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/makeover",
        element: (
          <SuspenseWrapper>
            <MakeoverBookings />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/photoshoot",
        element: (
          <SuspenseWrapper>
            <PhotoshootBookings />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/events",
        element: (
          <SuspenseWrapper>
            <EventCoverage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/mini-mart",
        element: (
          <SuspenseWrapper>
            <MiniMart />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/cart",
        element: (
          <SuspenseWrapper>
            <Cart />
          </SuspenseWrapper>
        ),
      },

      // User account routes (authentication required for personalized features)
      {
        path: "/dashboard",
        element: (
          <RequireAuth>
            <SuspenseWrapper>
              <Dashboard />
            </SuspenseWrapper>
          </RequireAuth>
        ),
      },
      {
        path: "/history",
        element: (
          <RequireAuth>
            <SuspenseWrapper>
              <History />
            </SuspenseWrapper>
          </RequireAuth>
        ),
      },
      {
        path: "/settings",
        element: (
          <RequireAuth>
            <SuspenseWrapper>
              <Settings />
            </SuspenseWrapper>
          </RequireAuth>
        ),
      },
      {
        path: "/notifications",
        element: (
          <RequireAuth>
            <SuspenseWrapper>
              <Notifications />
            </SuspenseWrapper>
          </RequireAuth>
        ),
      },

      // Public shopping & booking routes (guests can browse, add to cart, view details)
      {
        path: "/wishlist",
        element: (
          <SuspenseWrapper>
            <Wishlist />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/rental/:id",
        element: (
          <SuspenseWrapper>
            <RentalBookingDetails />
          </SuspenseWrapper>
        ),
      },

      // Checkout - only step requiring authentication
      {
        path: "/checkout",
        element: (
          <RequireAuth>
            <SuspenseWrapper>
              <Checkout />
            </SuspenseWrapper>
          </RequireAuth>
        ),
      },

      // Account status pages
      {
        path: "/account-deactivated",
        element: (
          <SuspenseWrapper>
            <AccountDeactivated />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/account-locked",
        element: (
          <SuspenseWrapper>
            <AccountLocked />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/email-verification-required",
        element: (
          <SuspenseWrapper>
            <EmailVerificationRequired />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/id-verification-required",
        element: (
          <SuspenseWrapper>
            <IDValidationRequired />
          </SuspenseWrapper>
        ),
      },

      // 404 fallback
      {
        path: "*",
        element: (
          <SuspenseWrapper>
            <NotFound />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Guest-only routes (redirect if authenticated)
  {
    path: "/signin",
    element: (
      <RequireGuest>
        <SuspenseWrapper>
          <SignIn />
        </SuspenseWrapper>
      </RequireGuest>
    ),
  },
  {
    path: "/signup",
    element: (
      <RequireGuest>
        <SuspenseWrapper>
          <SignUp />
        </SuspenseWrapper>
      </RequireGuest>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <RequireGuest>
        <SuspenseWrapper>
          <ForgotPassword />
        </SuspenseWrapper>
      </RequireGuest>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <RequireGuest>
        <SuspenseWrapper>
          <ResetPassword />
        </SuspenseWrapper>
      </RequireGuest>
    ),
  },

  // Email verification can be accessed by authenticated users
  {
    path: "/email-verification",
    element: (
      <SuspenseWrapper>
        <EmailVerification />
      </SuspenseWrapper>
    ),
  },

  // ID verification can be accessed by authenticated users
  {
    path: "/id-verification",
    element: (
      <SuspenseWrapper>
        <IDVerification />
      </SuspenseWrapper>
    ),
  },
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
