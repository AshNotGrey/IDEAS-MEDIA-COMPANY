import React from "react";
import { Eye, Download, Edit3, Trash2, Image, Video, File } from "lucide-react";

const MediaList = ({
  media,
  selectedMedia,
  onMediaSelect,
  onMediaPreview,
  onMediaEdit,
  onMediaDelete,
  onMediaDownload,
  currentFolder,
}) => {
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
      month: "short",
      day: "numeric",
    });
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case "image":
        return <Image size={16} className='text-blue-500' />;
      case "video":
        return <Video size={16} className='text-purple-500' />;
      default:
        return <File size={16} className='text-gray-500' />;
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

  if (!media || media.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center'>
          <Image size={24} className='text-gray-400' />
        </div>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>No media found</h3>
        <p className='text-gray-500 dark:text-gray-400'>
          {currentFolder === "uploads"
            ? "Upload your first media file to get started"
            : "This folder is empty"}
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-ideas-darkInput rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
          <thead className='bg-gray-50 dark:bg-gray-800'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                <input
                  type='checkbox'
                  className='rounded border-gray-300 text-ideas-accent focus:ring-ideas-accent'
                  checked={selectedMedia.length === media.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onMediaSelect(media.map((item) => item._id));
                    } else {
                      onMediaSelect([]);
                    }
                  }}
                />
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Media
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Size
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Upload Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-ideas-darkInput divide-y divide-gray-200 dark:divide-gray-700'>
            {media.map((item) => (
              <tr
                key={item._id}
                className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-300 text-ideas-accent focus:ring-ideas-accent'
                    checked={selectedMedia.includes(item._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onMediaSelect([...selectedMedia, item._id]);
                      } else {
                        onMediaSelect(selectedMedia.filter((id) => id !== item._id));
                      }
                    }}
                  />
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 h-12 w-12'>
                      <img
                        className='h-12 w-12 rounded-lg object-cover'
                        src={item.thumbnail || item.url}
                        alt={item.name}
                      />
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-900 dark:text-white'>
                        {item.name}
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>{item.folder}</div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    {getMediaIcon(item.type)}
                    <span className='ml-2 text-sm text-gray-900 dark:text-white capitalize'>
                      {item.type}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                  {formatFileSize(item.size)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMediaTypeColor(
                      item.category
                    )}`}>
                    {item.category}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                  {formatDate(item.uploadDate)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => onMediaPreview(item)}
                      className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150'
                      title='Preview'>
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onMediaDownload(item)}
                      className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150'
                      title='Download'>
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => onMediaEdit(item)}
                      className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150'
                      title='Edit'>
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => onMediaDelete(item)}
                      className='text-red-400 hover:text-red-600 transition-colors duration-150'
                      title='Delete'>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MediaList;
