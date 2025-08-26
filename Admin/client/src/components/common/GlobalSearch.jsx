import React, { useState, useEffect, useRef } from "react";
import { Search, User, Calendar, Package, Image, FileText, Settings, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * GlobalSearch component - Provides universal search across all admin data
 * Currently uses mock data, can be updated to use REST API calls later
 */
const GlobalSearch = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Execute search query (mock implementation)
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSearchResults(null);
      return;
    }

    setLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Mock search results - replace with actual REST API call
      const mockResults = {
        users: [
          { id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", avatar: null },
          {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            avatar: null,
          },
        ].filter(
          (user) =>
            `${user.firstName} ${user.lastName}`
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(debouncedQuery.toLowerCase())
        ),
        bookings: [
          {
            id: "1",
            serviceType: "Photoshoot",
            scheduledDate: "2024-01-15",
            status: "confirmed",
            user: { firstName: "John", lastName: "Doe" },
          },
          {
            id: "2",
            serviceType: "Event Coverage",
            scheduledDate: "2024-01-20",
            status: "pending",
            user: { firstName: "Jane", lastName: "Smith" },
          },
        ].filter(
          (booking) =>
            booking.serviceType.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            `${booking.user.firstName} ${booking.user.lastName}`
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase())
        ),
        services: [
          {
            id: "1",
            name: "Portrait Session",
            category: "Photography",
            price: 150,
            isActive: true,
          },
          { id: "2", name: "Event Coverage", category: "Events", price: 300, isActive: true },
        ].filter(
          (service) =>
            service.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            service.category.toLowerCase().includes(debouncedQuery.toLowerCase())
        ),
        media: [
          {
            id: "1",
            filename: "portrait-001.jpg",
            type: "image",
            category: "Portraits",
            url: "/media/portrait-001.jpg",
          },
          {
            id: "2",
            filename: "event-001.jpg",
            type: "image",
            category: "Events",
            url: "/media/event-001.jpg",
          },
        ].filter(
          (media) =>
            media.filename.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            media.category.toLowerCase().includes(debouncedQuery.toLowerCase())
        ),
        emailTemplates: [
          { id: "1", name: "Welcome Email", type: "welcome", category: "Onboarding" },
          { id: "2", name: "Booking Confirmation", type: "confirmation", category: "Bookings" },
        ].filter(
          (template) =>
            template.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            template.category.toLowerCase().includes(debouncedQuery.toLowerCase())
        ),
      };

      setSearchResults(mockResults);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedQuery]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }

      // Escape to close
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle result selection
  const handleResultClick = (type, id) => {
    setIsOpen(false);
    setQuery("");

    switch (type) {
      case "user":
        navigate(`/users?highlight=${id}`);
        break;
      case "booking":
        navigate(`/bookings?highlight=${id}`);
        break;
      case "service":
        navigate(`/services?highlight=${id}`);
        break;
      case "media":
        navigate(`/media?highlight=${id}`);
        break;
      case "emailTemplate":
        navigate(`/email-templates?highlight=${id}`);
        break;
      default:
        break;
    }
  };

  const getResultIcon = (type) => {
    const icons = {
      user: User,
      booking: Calendar,
      service: Package,
      media: Image,
      emailTemplate: FileText,
    };
    const Icon = icons[type] || Search;
    return <Icon className='w-4 h-4' />;
  };

  const formatResultTitle = (item, type) => {
    switch (type) {
      case "user":
        return `${item.firstName} ${item.lastName}`;
      case "booking":
        return `${item.serviceType} - ${item.user.firstName} ${item.user.lastName}`;
      case "service":
        return item.name;
      case "media":
        return item.filename;
      case "emailTemplate":
        return item.name;
      default:
        return "";
    }
  };

  const formatResultSubtitle = (item, type) => {
    switch (type) {
      case "user":
        return item.email;
      case "booking":
        return `${new Date(item.scheduledDate).toLocaleDateString()} • ${item.status}`;
      case "service":
        return `${item.category} • $${item.price}`;
      case "media":
        return `${item.type} • ${item.category}`;
      case "emailTemplate":
        return `${item.type} • ${item.category}`;
      default:
        return "";
    }
  };

  const allResults = searchResults
    ? [
        ...searchResults.users.map((item) => ({ ...item, type: "user" })),
        ...searchResults.bookings.map((item) => ({ ...item, type: "booking" })),
        ...searchResults.services.map((item) => ({ ...item, type: "service" })),
        ...searchResults.media.map((item) => ({ ...item, type: "media" })),
        ...searchResults.emailTemplates.map((item) => ({ ...item, type: "emailTemplate" })),
      ]
    : [];

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}>
        <Search className='w-4 h-4' />
        <span>Search...</span>
        <kbd className='hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded'>
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex min-h-full items-start justify-center p-4 text-center sm:p-0'>
            {/* Backdrop */}
            <div
              className='fixed inset-0 bg-black bg-opacity-25 transition-opacity'
              onClick={() => setIsOpen(false)}
            />

            {/* Modal panel */}
            <div className='relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
              {/* Search input */}
              <div className='border-b border-gray-200 dark:border-gray-700 p-4'>
                <div className='flex items-center gap-3'>
                  <Search className='w-5 h-5 text-gray-400' />
                  <input
                    ref={searchRef}
                    type='text'
                    placeholder='Search users, bookings, services...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className='flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500'
                    autoFocus
                  />
                  {loading && <Loader2 className='w-4 h-4 animate-spin text-gray-400' />}
                </div>
              </div>

              {/* Search results */}
              <div className='max-h-80 overflow-y-auto'>
                {query.length < 2 && (
                  <div className='p-8 text-center text-gray-500'>
                    <Search className='w-8 h-8 mx-auto mb-3 text-gray-300' />
                    <p>Type at least 2 characters to search</p>
                    <p className='text-xs mt-1'>
                      Search across users, bookings, services, and more
                    </p>
                  </div>
                )}

                {query.length >= 2 && !loading && allResults.length === 0 && (
                  <div className='p-8 text-center text-gray-500'>
                    <Search className='w-8 h-8 mx-auto mb-3 text-gray-300' />
                    <p>No results found for "{query}"</p>
                    <p className='text-xs mt-1'>Try different keywords</p>
                  </div>
                )}

                {allResults.length > 0 && (
                  <div className='py-2'>
                    {allResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result.type, result.id)}
                        className='w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
                        <div className='flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center'>
                          {getResultIcon(result.type)}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                            {formatResultTitle(result, result.type)}
                          </p>
                          <p className='text-xs text-gray-500 truncate'>
                            {formatResultSubtitle(result, result.type)}
                          </p>
                        </div>
                        <div className='flex-shrink-0'>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize'>
                            {result.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className='border-t border-gray-200 dark:border-gray-700 px-4 py-3'>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Use ↑↓ to navigate</span>
                  <span>Press ESC to close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
