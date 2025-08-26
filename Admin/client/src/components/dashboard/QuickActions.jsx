import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  Calendar,
  Settings,
  FileText,
  Image,
  MessageSquare,
  BarChart3,
} from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Add New User",
      description: "Create a new client account",
      icon: <Users size={24} />,
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      action: () => navigate("/users/new"),
    },
    {
      title: "Create Booking",
      description: "Schedule a new appointment",
      icon: <Calendar size={24} />,
      color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      action: () => navigate("/bookings/new"),
    },
    {
      title: "Add Service",
      description: "Create a new service offering",
      icon: <Settings size={24} />,
      color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      action: () => navigate("/services/new"),
    },
    {
      title: "Upload Media",
      description: "Add images to gallery",
      icon: <Image size={24} />,
      color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
      action: () => navigate("/galleries/upload"),
    },
    {
      title: "View Reports",
      description: "Business analytics & insights",
      icon: <BarChart3 size={24} />,
      color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
      action: () => navigate("/analytics"),
    },
    {
      title: "Manage Reviews",
      description: "Handle customer feedback",
      icon: <MessageSquare size={24} />,
      color: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
      action: () => navigate("/reviews"),
    },
  ];

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-black dark:text-white'>Quick Actions</h3>
        <div className='w-8 h-8 bg-ideas-accent/10 rounded-full flex items-center justify-center'>
          <Plus size={20} className='text-ideas-accent' />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3'>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className='w-full p-3 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group'>
            <div className='flex items-center space-x-3'>
              <div
                className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                {action.icon}
              </div>
              <div className='flex-1'>
                <p className='font-medium text-black dark:text-white group-hover:text-ideas-accent transition-colors duration-200'>
                  {action.title}
                </p>
                <p className='text-sm text-subtle'>{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats Summary */}
      <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <h4 className='text-sm font-medium text-black dark:text-white mb-3'>Today's Summary</h4>
        <div className='grid grid-cols-2 gap-3'>
          <div className='text-center p-2 bg-ideas-accent/5 rounded-lg'>
            <p className='text-lg font-bold text-ideas-accent'>0</p>
            <p className='text-xs text-subtle'>New Users</p>
          </div>
          <div className='text-center p-2 bg-ideas-accent/5 rounded-lg'>
            <p className='text-lg font-bold text-ideas-accent'>0</p>
            <p className='text-xs text-subtle'>Bookings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
