import React from "react";
import {
  X,
  Download,
  Edit3,
  Trash2,
  Image,
  Video,
  File,
  Calendar,
  Tag,
  Folder,
} from "lucide-react";

const MediaPreview = ({ media, isOpen, onClose, onDownload, onEdit, onDelete }) => {
  if (!isOpen || !media) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case "image":
        return <Image size={24} className='text-blue-500' />;
      case "video":
        return <Video size={24} className='text-purple-500' />;
      default:
        return <File size={24} className='text-gray-500' />;
    }
  };

  const getMediaTypeColor = (type) => {
    switch (type) {
      case "image":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "video":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const renderMediaContent = () => {
    switch (media.type) {
      case "image":
        return (
          <img
            src={media.url}
            alt={media.name}
            className='max-w-full max-h-96 object-contain rounded-lg'
          />
        );
      case "video":
        return (
          <video
            src={media.url}
            controls
            className='max-w-full max-h-96 rounded-lg'
            poster={media.thumbnail}>
            Your browser does not support the video tag.
          </video>
        );
      default:
        return (
          <div className='w-64 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center'>
            <File size={64} className='text-gray-400' />
            <span className='ml-2 text-gray-500 dark:text-gray-400'>{media.name}</span>
          </div>
        );
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        {/* Background overlay */}
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          onClick={onClose}></div>

        {/* Modal panel */}
        <div className='inline-block align-bottom bg-white dark:bg-ideas-darkInput rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full'>
          {/* Header */}
          <div className='bg-white dark:bg-ideas-darkInput px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                {getMediaIcon(media.type)}
                <div>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                    {media.name}
                  </h3>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {media.folder} • {formatFileSize(media.size)}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => onDownload(media)}
                  className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150'
                  title='Download'>
                  <Download size={20} />
                </button>
                <button
                  onClick={() => onEdit(media)}
                  className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150'
                  title='Edit'>
                  <Edit3 size={20} />
                </button>
                <button
                  onClick={() => onDelete(media)}
                  className='p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150'
                  title='Delete'>
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={onClose}
                  className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150'
                  title='Close'>
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='px-6 py-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Media display */}
              <div className='flex justify-center'>{renderMediaContent()}</div>

              {/* Media details */}
              <div className='space-y-4'>
                <div>
                  <h4 className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'>
                    File Information
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600 dark:text-gray-300'>Type</span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMediaTypeColor(
                          media.type
                        )}`}>
                        {media.type}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600 dark:text-gray-300'>Category</span>
                      <span className='text-sm text-gray-900 dark:text-white capitalize'>
                        {media.category}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600 dark:text-gray-300'>Size</span>
                      <span className='text-sm text-gray-900 dark:text-white'>
                        {formatFileSize(media.size)}
                      </span>
                    </div>
                    {media.dimensions && (
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600 dark:text-gray-300'>Dimensions</span>
                        <span className='text-sm text-gray-900 dark:text-white'>
                          {media.dimensions.width} × {media.dimensions.height}
                        </span>
                      </div>
                    )}
                    {media.duration && (
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600 dark:text-gray-300'>Duration</span>
                        <span className='text-sm text-gray-900 dark:text-white'>
                          {Math.floor(media.duration / 60)}:
                          {(media.duration % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'>
                    Upload Details
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-2'>
                      <Calendar size={16} className='text-gray-400' />
                      <span className='text-sm text-gray-900 dark:text-white'>
                        {formatDate(media.uploadDate)}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Folder size={16} className='text-gray-400' />
                      <span className='text-sm text-gray-900 dark:text-white'>{media.folder}</span>
                    </div>
                  </div>
                </div>

                {media.tags && media.tags.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'>
                      Tags
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {media.tags.map((tag, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'>
                          <Tag size={12} className='mr-1' />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;
