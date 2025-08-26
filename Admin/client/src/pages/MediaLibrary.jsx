import React, { useState, useEffect } from "react";
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Folder,
  Image,
  File,
  Video,
  Plus,
  Settings,
  Trash2,
  Edit3,
  Eye,
  Download,
  FolderPlus,
} from "lucide-react";
import MediaGrid from "../components/media/MediaGrid";
import MediaList from "../components/media/MediaList";
import UploadManager from "../components/media/UploadManager";
import MediaFilters from "../components/media/MediaFilters";
import MediaStats from "../components/media/MediaStats";
import MediaPreview from "../components/media/MediaPreview";

const MediaLibrary = () => {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("uploads");

  const [filters, setFilters] = useState({
    category: "",
    type: "",
    search: "",
    dateFrom: "",
    dateTo: "",
    tags: [],
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  // Mock data - replace with real REST API calls when needed
  const [media, setMedia] = useState([
    {
      _id: "1",
      name: "wedding-ceremony-001.jpg",
      type: "image",
      category: "weddings",
      url: "https://via.placeholder.com/400x300",
      thumbnail: "https://via.placeholder.com/150x150",
      size: 2048576,
      dimensions: { width: 1920, height: 1080 },
      tags: ["wedding", "ceremony", "romantic"],
      uploadDate: "2024-01-15T10:30:00Z",
      folder: "weddings",
    },
    {
      _id: "2",
      name: "portrait-session-001.jpg",
      type: "image",
      category: "portraits",
      url: "https://via.placeholder.com/400x300",
      thumbnail: "https://via.placeholder.com/150x150",
      size: 1536000,
      dimensions: { width: 1600, height: 1200 },
      tags: ["portrait", "professional", "headshot"],
      uploadDate: "2024-01-14T14:20:00Z",
      folder: "portraits",
    },
    {
      _id: "3",
      name: "event-coverage-001.mp4",
      type: "video",
      category: "events",
      url: "https://via.placeholder.com/400x300",
      thumbnail: "https://via.placeholder.com/150x150",
      size: 52428800,
      duration: 120,
      tags: ["event", "coverage", "live"],
      uploadDate: "2024-01-13T16:45:00Z",
      folder: "events",
    },
    {
      _id: "4",
      name: "product-photo-001.jpg",
      type: "image",
      category: "products",
      url: "https://via.placeholder.com/400x300",
      thumbnail: "https://via.placeholder.com/150x150",
      size: 1024000,
      dimensions: { width: 1200, height: 800 },
      tags: ["product", "commercial", "ecommerce"],
      uploadDate: "2024-01-12T11:15:00Z",
      folder: "products",
    },
    {
      _id: "5",
      name: "family-session-001.jpg",
      type: "image",
      category: "family",
      url: "https://via.placeholder.com/400x300",
      thumbnail: "https://via.placeholder.com/150x150",
      size: 3072000,
      dimensions: { width: 2400, height: 1600 },
      tags: ["family", "portrait", "candid"],
      uploadDate: "2024-01-11T09:30:00Z",
      folder: "family",
    },
  ]);

  const [stats, setStats] = useState({
    totalFiles: 1250,
    totalSize: 15728640000, // 15GB in bytes
    imageCount: 890,
    videoCount: 120,
    documentCount: 240,
    categories: [
      { name: "Weddings", count: 320, size: 5120000000 },
      { name: "Portraits", count: 280, size: 2560000000 },
      { name: "Events", count: 180, size: 3840000000 },
      { name: "Products", count: 150, size: 1280000000 },
      { name: "Family", count: 120, size: 1920000000 },
    ],
  });

  // Handle media selection
  const handleSelectMedia = (mediaItem) => {
    setSelectedMedia((prev) => {
      const isSelected = prev.find((item) => item._id === mediaItem._id);
      if (isSelected) {
        return prev.filter((item) => item._id !== mediaItem._id);
      } else {
        return [...prev, mediaItem];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedMedia.length === media.length) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia([...media]);
    }
  };

  // Handle media preview
  const handlePreview = (mediaItem) => {
    setPreviewMedia(mediaItem);
  };

  // Handle media delete
  const handleDelete = async (mediaIds) => {
    if (window.confirm(`Are you sure you want to delete ${mediaIds.length} file(s)?`)) {
      try {
        if (mediaIds.length === 1) {
          setMedia(media.filter((item) => item._id !== mediaIds[0]));
        } else {
          setMedia(media.filter((item) => !mediaIds.includes(item._id)));
        }
        setSelectedMedia([]);
      } catch (error) {
        console.error("Error deleting media:", error);
      }
    }
  };

  // Handle media update
  const handleUpdateMedia = async (mediaId, updates) => {
    try {
      setMedia(media.map((item) => (item._id === mediaId ? { ...item, ...updates } : item)));
    } catch (error) {
      console.error("Error updating media:", error);
    }
  };

  // Handle folder creation
  const handleCreateFolder = async (folderName) => {
    try {
      // Mock folder creation
      console.log("Creating folder:", folderName);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  // Filter media based on current filters
  const filteredMedia = media.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase()))
      return false;
    if (filters.dateFrom && new Date(item.uploadDate) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(item.uploadDate) > new Date(filters.dateTo)) return false;
    if (filters.tags.length > 0 && !filters.tags.some((tag) => item.tags.includes(tag)))
      return false;
    return true;
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Media Library</h1>
          <p className='text-gray-600 dark:text-gray-400'>Manage and organize your media assets</p>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='btn-secondary flex items-center space-x-2'>
            <Filter className='w-4 h-4' />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className='btn-primary flex items-center space-x-2'>
            <Upload className='w-4 h-4' />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <MediaStats stats={stats} />

      {/* Filters */}
      {showFilters && (
        <MediaFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() =>
            setFilters({
              category: "",
              type: "",
              search: "",
              dateFrom: "",
              dateTo: "",
              tags: [],
            })
          }
        />
      )}

      {/* View Mode Toggle */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}>
            <Grid className='w-5 h-5' />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}>
            <List className='w-5 h-5' />
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedMedia.length > 0 && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              {selectedMedia.length} item(s) selected
            </span>
            <button
              onClick={() => handleDelete(selectedMedia.map((item) => item._id))}
              className='btn-danger text-sm flex items-center space-x-2'>
              <Trash2 className='w-4 h-4' />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Media Display */}
      {viewMode === "grid" ? (
        <MediaGrid
          media={filteredMedia}
          selectedMedia={selectedMedia}
          onSelectMedia={handleSelectMedia}
          onSelectAll={handleSelectAll}
          onPreview={handlePreview}
          onEdit={(item) => console.log("Edit:", item)}
          onDelete={(id) => handleDelete([id])}
          loading={false}
        />
      ) : (
        <MediaList
          media={filteredMedia}
          selectedMedia={selectedMedia}
          onSelectMedia={handleSelectMedia}
          onSelectAll={handleSelectAll}
          onPreview={handlePreview}
          onEdit={(item) => console.log("Edit:", item)}
          onDelete={(id) => handleDelete([id])}
          loading={false}
        />
      )}

      {/* Upload Manager Modal */}
      {showUpload && (
        <UploadManager
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUploadComplete={(newMedia) => {
            setMedia([...media, ...newMedia]);
            setShowUpload(false);
          }}
        />
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <MediaPreview
          media={previewMedia}
          isOpen={!!previewMedia}
          onClose={() => setPreviewMedia(null)}
          onEdit={(updates) => {
            handleUpdateMedia(previewMedia._id, updates);
            setPreviewMedia(null);
          }}
        />
      )}
    </div>
  );
};

export default MediaLibrary;
