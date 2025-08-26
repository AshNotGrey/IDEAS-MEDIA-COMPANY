import React from "react";
import { Image, Video, File, HardDrive, Folder } from "lucide-react";

const MediaStats = ({ stats }) => {
  if (!stats) {
    return null;
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "image":
        return <Image className='w-5 h-5' />;
      case "video":
        return <Video className='w-5 h-5' />;
      case "document":
        return <File className='w-5 h-5' />;
      default:
        return <Folder className='w-5 h-5' />;
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case "image":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      case "video":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
      case "document":
        return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20";
      case "audio":
        return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const totalFiles = stats.totalFiles || 0;
  const totalSize = stats.totalSize || 0;
  const byType = stats.byType || [];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      {/* Total Files */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center'>
              <Folder className='w-5 h-5 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Total Files</p>
            <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {totalFiles.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Total Storage */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center'>
              <HardDrive className='w-5 h-5 text-purple-600 dark:text-purple-400' />
            </div>
          </div>
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Total Storage</p>
            <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {formatFileSize(totalSize)}
            </p>
          </div>
        </div>
      </div>

      {/* File Types Breakdown */}
      {byType.slice(0, 2).map((typeStats, index) => {
        const percentage = totalFiles > 0 ? ((typeStats.count / totalFiles) * 100).toFixed(1) : 0;

        return (
          <div
            key={typeStats._id}
            className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(typeStats._id)}`}>
                  {getTypeIcon(typeStats._id)}
                </div>
              </div>
              <div className='ml-4 flex-1'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400 capitalize'>
                  {typeStats._id}s
                </p>
                <div className='flex items-center justify-between'>
                  <p className='text-2xl font-semibold text-gray-900 dark:text-white'>
                    {typeStats.count}
                  </p>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>{percentage}%</span>
                </div>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  {formatFileSize(typeStats.totalSize)}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Show all types if there are more */}
      {byType.length > 2 && (
        <div className='md:col-span-2 lg:col-span-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
              File Type Distribution
            </h3>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {byType.map((typeStats) => {
                const percentage =
                  totalFiles > 0 ? ((typeStats.count / totalFiles) * 100).toFixed(1) : 0;

                return (
                  <div key={typeStats._id} className='text-center'>
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${getTypeColor(typeStats._id)}`}>
                      {getTypeIcon(typeStats._id)}
                    </div>
                    <p className='text-sm font-medium text-gray-900 dark:text-white capitalize'>
                      {typeStats._id}
                    </p>
                    <p className='text-lg font-semibold text-gray-700 dark:text-gray-300'>
                      {typeStats.count}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {percentage}% • {formatFileSize(typeStats.totalSize)}
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>
                      Avg: {formatFileSize(typeStats.avgSize)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaStats;
