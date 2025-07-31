import React from "react";
import { Link } from "react-router-dom";
/**
 * NotFound page component.
 * Renders a 404 error message and a link to return home.
 *
 * @component
 * @returns {JSX.Element} The rendered NotFound page.
 */

const NotFound = () => (
  <div className='min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12'>
    <h1 className='text-6xl font-bold text-ideas-accent mb-4'>404</h1>
    <h2 className='text-2xl font-heading font-bold mb-2 text-black dark:text-white'>
      Page Not Found
    </h2>
    <p className='mb-6 text-black/80 dark:text-white/80'>
      Sorry, the page you are looking for does not exist.
    </p>
    <Link to='/' className='btn btn-primary'>
      Go Home
    </Link>
  </div>
);

export default NotFound;
