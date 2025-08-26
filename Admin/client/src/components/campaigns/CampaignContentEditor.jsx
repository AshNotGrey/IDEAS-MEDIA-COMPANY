import React from "react";
import { PhotoIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CampaignContentEditor = ({ formData, errors, onChange }) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      alt: file.name
    }));
    
    onChange('images', [...(formData.images || []), ...newImages]);
  };

  const removeImage = (imageId) => {
    const updatedImages = formData.images?.filter(img => img.id !== imageId) || [];
    onChange('images', updatedImages);
  };

  const updateImageAlt = (imageId, alt) => {
    const updatedImages = formData.images?.map(img => 
      img.id === imageId ? { ...img, alt } : img
    ) || [];
    onChange('images', updatedImages);
  };

  const addCTA = () => {
    const newCTA = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      url: '',
      type: 'primary',
      isActive: true
    };
    onChange('ctas', [...(formData.ctas || []), newCTA]);
  };

  const updateCTA = (ctaId, field, value) => {
    const updatedCTAs = formData.ctas?.map(cta => 
      cta.id === ctaId ? { ...cta, [field]: value } : cta
    ) || [];
    onChange('ctas', updatedCTAs);
  };

  const removeCTA = (ctaId) => {
    const updatedCTAs = formData.ctas?.filter(cta => cta.id !== ctaId) || [];
    onChange('ctas', updatedCTAs);
  };

  return (
    <div className="space-y-6">
      {/* Basic Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Content</h3>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Campaign Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.title ? 'border-red-500' : ''
            }`}
            placeholder="Enter campaign title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter campaign description"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            rows={6}
            value={formData.content || ''}
            onChange={(e) => onChange('content', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.content ? 'border-red-500' : ''
            }`}
            placeholder="Enter campaign content"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Images</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formData.images?.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all duration-200"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={image.alt}
                onChange={(e) => updateImageAlt(image.id, e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Image alt text"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <PhotoIcon className="h-5 w-5 mr-2" />
            Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Call-to-Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Call-to-Actions</h3>
          <button
            type="button"
            onClick={addCTA}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add CTA
          </button>
        </div>

        <div className="space-y-3">
          {formData.ctas?.map((cta) => (
            <div key={cta.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={cta.text}
                  onChange={(e) => updateCTA(cta.id, 'text', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="CTA Text"
                />
                <input
                  type="url"
                  value={cta.url}
                  onChange={(e) => updateCTA(cta.id, 'url', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="URL"
                />
                <select
                  value={cta.type}
                  onChange={(e) => updateCTA(cta.id, 'type', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={cta.isActive}
                    onChange={(e) => updateCTA(cta.id, 'isActive', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Active</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeCTA(cta.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {(!formData.ctas || formData.ctas.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-4">
            No CTAs added yet. Click "Add CTA" to create your first call-to-action.
          </p>
        )}
      </div>
    </div>
  );
};

export default CampaignContentEditor;
