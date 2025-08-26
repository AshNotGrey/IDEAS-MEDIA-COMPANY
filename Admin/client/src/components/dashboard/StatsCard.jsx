import React from "react";
import { Users, Calendar, DollarSign, MessageCircle, TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({ title, value, icon, trend, trendDirection, color }) => {
  const getIcon = () => {
    switch (icon) {
      case "users":
        return <Users size={24} />;
      case "calendar":
        return <Calendar size={24} />;
      case "dollar":
        return <DollarSign size={24} />;
      case "message-circle":
        return <MessageCircle size={24} />;
      default:
        return <Users size={24} />;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
      case "green":
        return "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400";
      case "purple":
        return "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400";
      case "orange":
        return "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400";
    }
  };

  const getTrendIcon = () => {
    if (trendDirection === "up") {
      return <TrendingUp size={16} className='text-green-600 dark:text-green-400' />;
    }
    return <TrendingDown size={16} className='text-red-600 dark:text-red-400' />;
  };

  const getTrendColor = () => {
    if (trendDirection === "up") {
      return "text-green-600 dark:text-green-400";
    }
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className='card card-hover'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-subtle mb-1'>{title}</p>
          <p className='text-3xl font-bold text-black dark:text-white'>{value}</p>
          {trend && (
            <div className='flex items-center mt-2'>
              {getTrendIcon()}
              <span className={`text-sm font-medium ml-1 ${getTrendColor()}`}>{trend}</span>
              <span className='text-xs text-subtle ml-1'>from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${getColorClasses()}`}>{getIcon()}</div>
      </div>
    </div>
  );
};

export default StatsCard;
