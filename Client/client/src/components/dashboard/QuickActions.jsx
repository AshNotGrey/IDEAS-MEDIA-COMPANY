import React from "react";
import { Camera, Wrench, Sparkles, ShoppingBag, Calendar, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";

/**
 * QuickActions Component
 *
 * Provides quick navigation to main services and features
 */
const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: "equipment",
      title: "Rent Equipment",
      description: "Photography & video gear",
      icon: <Wrench className='w-5 h-5 text-ideas-accent' />,
      color: "border-ideas-accent hover:border-ideas-accentHover border-2",
      path: "/equipment",
    },
    {
      id: "makeover",
      title: "Book Makeover",
      description: "Professional styling services",
      icon: <Sparkles className='w-5 h-5 text-pink-500' />,
      color: "border-pink-500 hover:border-pink-600 border-2",
      path: "/makeover",
    },
    {
      id: "photoshoot",
      title: "Book Photoshoot",
      description: "Professional photography sessions",
      icon: <Camera className='w-5 h-5 text-blue-500' />,
      color: "border-blue-500 hover:border-blue-600 border-2",
      path: "/photoshoot",
    },
    {
      id: "shop",
      title: "Shop Products",
      description: "Photography accessories & more",
      icon: <ShoppingBag className='w-5 h-5 text-green-500' />,
      color: "border-green-500 hover:border-green-600 border-2",
      path: "/mini-mart",
    },
  ];

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => navigate(action.path)}
          className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ideas-accent group`}>
          <div className='flex flex-col items-center text-center space-y-2'>
            <div className='p-2 bg-transparent rounded-lg group-hover:bg-white/30 transition-colors'>
              {action.icon}
            </div>
            <div>
              <h3 className='font-semibold text-sm'>{action.title}</h3>
              <p className='text-xs opacity-90 hidden sm:block'>{action.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
