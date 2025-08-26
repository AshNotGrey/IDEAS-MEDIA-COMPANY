import React, { useState } from "react";
import {
  Image,
  Video,
  File,
  Eye,
  Download,
  Edit3,
  Trash2,
  Clock,
  User,
  Tag,
  Copy,
  ExternalLink,
} from "lucide-react";

const MediaGrid = ({ media, selectedMedia, onSelect, onSelectAll, onPreview, onDelete }) => {
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Get media type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "image":
        return <Image className='w-4 h-4' />;
      case "video":
        return <Video className='w-4 h-4' />;
      default:
        return <File className='w-4 h-4' />;
    }
  };

  // Get media type color
  const getTypeColor = (type) => {
    switch (type) {
      case "image":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      case "video":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
      case "document":
        return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  // Copy URL to clipboard
  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  // Check if media is selected
  const isSelected = (mediaItem) => {
    return selectedMedia.some((item) => item._id === mediaItem._id);
  };

  if (!media || media.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4'>
          <Image className='w-8 h-8 text-gray-400' />
        </div>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>No media files</h3>
        <p className='text-gray-600 dark:text-gray-400'>Upload some files to get started</p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <input
            type='checkbox'
            checked={selectedMedia.length === media.length && media.length > 0}
            onChange={onSelectAll}
            className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
          />
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {media.length} item{media.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Media Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
        {media.map((mediaItem) => (
          <div
            key={mediaItem._id}
            className={`relative group bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 ${
              isSelected(mediaItem)
                ? "border-purple-500 shadow-lg"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}>
            {/* Selection Checkbox */}
            <div className='absolute top-2 left-2 z-10'>
              <input
                type='checkbox'
                checked={isSelected(mediaItem)}
                onChange={() => onSelect(mediaItem)}
                className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
              />
            </div>

            {/* Media Preview */}
            <div
              className='aspect-square rounded-t-lg overflow-hidden cursor-pointer'
              onClick={() => onPreview(mediaItem)}>
              {mediaItem.type === "image" ? (
                <img
                  src={mediaItem.transformations?.thumbnail || mediaItem.url}
                  alt={mediaItem.alt || mediaItem.originalName}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                />
              ) : mediaItem.type === "video" ? (
                <div className='w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center'>
                  <Video className='w-8 h-8 text-gray-400' />
                </div>
              ) : (
                <div className='w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center'>
                  <File className='w-8 h-8 text-gray-400' />
                </div>
              )}

              {/* Overlay Actions */}
              <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200'>
                <div className='flex gap-2'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(mediaItem);
                    }}
                    className='p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                    title='Preview'>
                    <Eye className='w-4 h-4 text-gray-700 dark:text-gray-300' />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(mediaItem.url);
                    }}
                    className='p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                    title={copiedUrl === mediaItem.url ? "Copied!" : "Copy URL"}>
                    {copiedUrl === mediaItem.url ? (
                      <span className='w-4 h-4 text-green-600 text-xs'>✓</span>
                    ) : (
                      <Copy className='w-4 h-4 text-gray-700 dark:text-gray-300' />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(mediaItem.url, "_blank");
                    }}
                    className='p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                    title='Open in new tab'>
                    <ExternalLink className='w-4 h-4 text-gray-700 dark:text-gray-300' />
                  </button>
                </div>
              </div>
            </div>

            {/* Media Info */}
            <div className='p-3'>
              {/* File Name */}
              <div className='mb-2'>
                <h3
                  className='text-sm font-medium text-gray-900 dark:text-white truncate'
                  title={mediaItem.originalName}>
                  {mediaItem.originalName}
                </h3>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {mediaItem.formattedSize}
                </p>
              </div>

              {/* Type Badge */}
              <div className='flex items-center justify-between mb-2'>
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(mediaItem.type)}`}>
                  {getTypeIcon(mediaItem.type)}
                  <span className='ml-1 capitalize'>{mediaItem.type}</span>
                </span>

                {mediaItem.category && (
                  <span className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
                    {mediaItem.category}
                  </span>
                )}
              </div>

              {/* Tags */}
              {mediaItem.tags && mediaItem.tags.length > 0 && (
                <div className='flex items-center gap-1 mb-2'>
                  <Tag className='w-3 h-3 text-gray-400' />
                  <div className='flex flex-wrap gap-1'>
                    {mediaItem.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className='inline-block px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded'>
                        {tag}
                      </span>
                    ))}
                    {mediaItem.tags.length > 2 && (
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        +{mediaItem.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Info */}
              <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
                <div className='flex items-center gap-1'>
                  <User className='w-3 h-3' />
                  <span>{mediaItem.uploadedBy?.name || "Unknown"}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Clock className='w-3 h-3' />
                  <span>{new Date(mediaItem.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-1 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700'>
                <button
                  onClick={() => onPreview(mediaItem)}
                  className='p-1.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
                  title='Preview'>
                  <Eye className='w-3.5 h-3.5' />
                </button>

                <button
                  onClick={() => onDelete(mediaItem._id)}
                  className='p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors'
                  title='Delete'>
                  <Trash2 className='w-3.5 h-3.5' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGrid;
