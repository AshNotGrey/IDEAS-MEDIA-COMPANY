import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

/**
 * Pagination Component
 *
 * A reusable pagination component for navigating through filtered results.
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {boolean} props.showInfo - Whether to show pagination info
 * @returns {JSX.Element} Rendered pagination component
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  showInfo = true,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      // Adjust start if we're near the end
      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
      {/* Pagination Info */}
      {showInfo && (
        <div className='text-sm text-black/60 dark:text-white/60'>
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      )}

      {/* Pagination Controls */}
      <div className='flex items-center gap-2'>
        {/* Previous Button */}
        <Button
          variant='secondary'
          size='sm'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='flex items-center gap-1'>
          <ChevronLeft className='w-4 h-4' />
          Previous
        </Button>

        {/* Page Numbers */}
        <div className='flex items-center gap-1'>
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "primary" : "secondary"}
              size='sm'
              onClick={() => handlePageChange(page)}
              className='min-w-[40px]'>
              {page}
            </Button>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant='secondary'
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='flex items-center gap-1'>
          Next
          <ChevronRight className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
