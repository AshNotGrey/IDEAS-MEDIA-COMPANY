import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  File,
  Image,
  Video,
  CheckCircle,
  AlertCircle,
  Loader,
  Plus,
  Trash2,
} from "lucide-react";

const UploadManager = ({ isOpen, onClose, onSuccess, currentFolder = "uploads" }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [category, setCategory] = useState("other");
  const [tags, setTags] = useState("");
  const fileInputRef = useRef(null);

  const categories = [
    { value: "gallery", label: "Gallery" },
    { value: "service_image", label: "Service Image" },
    { value: "profile_image", label: "Profile Image" },
    { value: "thumbnail", label: "Thumbnail" },
    { value: "document", label: "Document" },
    { value: "logo", label: "Logo" },
    { value: "banner", label: "Banner" },
    { value: "portfolio", label: "Portfolio" },
    { value: "equipment", label: "Equipment" },
    { value: "other", label: "Other" },
  ];

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Process selected files
  const handleFiles = (newFiles) => {
    const processedFiles = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: getFileType(file.type),
      status: "pending", // pending, uploading, success, error
      progress: 0,
      error: null,
      url: null,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));

    setFiles((prev) => [...prev, ...processedFiles]);
  };

  // Get file type
  const getFileType = (mimeType) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.includes("pdf") || mimeType.includes("document")) return "document";
    return "other";
  };

  // Get file icon
  const getFileIcon = (type) => {
    switch (type) {
      case "image":
        return <Image className='w-5 h-5' />;
      case "video":
        return <Video className='w-5 h-5' />;
      default:
        return <File className='w-5 h-5' />;
    }
  };

  // Remove file
  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const fileItem of pendingFiles) {
      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, status: "uploading", progress: 0 } : f))
        );

        // Create form data
        const formData = new FormData();
        formData.append("file", fileItem.file);
        formData.append("category", category);
        formData.append("folder", currentFolder);
        formData.append("tags", tags);

        // Upload file with progress tracking
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, progress } : f)));
          }
        };

        // Handle completion
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Upload failed"));
        });

        // Send request
        xhr.open("POST", "/api/upload/single");
        xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("adminToken")}`);
        xhr.send(formData);

        const result = await uploadPromise;

        // Update status to success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: "success",
                  progress: 100,
                  url: result.data.media.url,
                }
              : f
          )
        );
      } catch (error) {
        console.error(`Upload failed for ${fileItem.name}:`, error);

        // Update status to error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: "error",
                  error: error.message,
                }
              : f
          )
        );
      }
    }

    setUploading(false);

    // Check if all uploads succeeded
    const allSuccessful = files.every((f) => f.status === "success" || f.status === "error");
    if (allSuccessful) {
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  };

  // Close modal
  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setCategory("other");
      setTags("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        {/* Backdrop */}
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          onClick={handleClose}
        />

        {/* Modal */}
        <div className='inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full'>
          {/* Header */}
          <div className='bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Upload Files</h3>
              <button
                onClick={handleClose}
                disabled={uploading}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50'>
                <X className='w-6 h-6' />
              </button>
            </div>

            {/* Upload Configuration */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={uploading}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50'>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Tags (comma-separated)
                </label>
                <input
                  type='text'
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={uploading}
                  placeholder='tag1, tag2, tag3'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50'
                />
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}>
              <input
                ref={fileInputRef}
                type='file'
                multiple
                accept='image/*,video/*,.pdf,.doc,.docx'
                onChange={handleFileSelect}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                disabled={uploading}
              />

              <Upload className='mx-auto h-8 w-8 text-gray-400 mb-4' />
              <p className='text-gray-600 dark:text-gray-400 mb-2'>
                <span className='font-medium'>Click to upload</span> or drag and drop
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-500'>
                Images, videos, and documents up to 10MB
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className='mt-6'>
                <h4 className='text-sm font-medium text-gray-900 dark:text-white mb-3'>
                  Files ({files.length})
                </h4>
                <div className='space-y-2 max-h-60 overflow-y-auto'>
                  {files.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                      {/* File Preview/Icon */}
                      <div className='flex-shrink-0'>
                        {fileItem.preview ? (
                          <img
                            src={fileItem.preview}
                            alt={fileItem.name}
                            className='w-10 h-10 object-cover rounded'
                          />
                        ) : (
                          <div className='w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center'>
                            {getFileIcon(fileItem.type)}
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                          {fileItem.name}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          {formatFileSize(fileItem.size)}
                        </p>

                        {/* Progress Bar */}
                        {fileItem.status === "uploading" && (
                          <div className='mt-1'>
                            <div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5'>
                              <div
                                className='bg-purple-600 h-1.5 rounded-full transition-all duration-300'
                                style={{ width: `${fileItem.progress}%` }}
                              />
                            </div>
                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                              {fileItem.progress}%
                            </p>
                          </div>
                        )}

                        {/* Error Message */}
                        {fileItem.status === "error" && (
                          <p className='text-xs text-red-600 dark:text-red-400 mt-1'>
                            {fileItem.error}
                          </p>
                        )}
                      </div>

                      {/* Status Icon */}
                      <div className='flex-shrink-0'>
                        {fileItem.status === "pending" && !uploading && (
                          <button
                            onClick={() => removeFile(fileItem.id)}
                            className='text-gray-400 hover:text-red-600 dark:hover:text-red-400'>
                            <Trash2 className='w-4 h-4' />
                          </button>
                        )}
                        {fileItem.status === "uploading" && (
                          <Loader className='w-4 h-4 text-purple-600 animate-spin' />
                        )}
                        {fileItem.status === "success" && (
                          <CheckCircle className='w-4 h-4 text-green-600' />
                        )}
                        {fileItem.status === "error" && (
                          <AlertCircle className='w-4 h-4 text-red-600' />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            <button
              onClick={handleUpload}
              disabled={
                files.length === 0 || uploading || files.every((f) => f.status === "success")
              }
              className='w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed'>
              {uploading ? (
                <>
                  <Loader className='w-4 h-4 mr-2 animate-spin' />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className='w-4 h-4 mr-2' />
                  Upload Files
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              disabled={uploading}
              className='mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'>
              {uploading ? "Uploading..." : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadManager;
