import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner.jsx";

const ServiceForm = ({ service, onSubmit, onCancel, loading, error }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "portrait",
    basePrice: "",
    priceStructure: {
      type: "fixed",
      additionalHourRate: "",
      packageDetails: "",
    },
    duration: {
      min: 1,
      max: 8,
    },
    includes: [],
    addOns: [],
    equipment: [],
    deliverables: {
      photos: {
        digital: 0,
        prints: 0,
      },
      editedPhotos: 0,
      deliveryTime: "7-14 days",
      format: ["jpeg"],
    },
    featured: false,
    images: [],
    tags: [],
  });

  const [includeInput, setIncludeInput] = useState("");
  const [equipmentInput, setEquipmentInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [addOnForm, setAddOnForm] = useState({ name: "", description: "", price: "" });

  const categories = [
    { value: "portrait", label: "Portrait Photography" },
    { value: "wedding", label: "Wedding Photography" },
    { value: "event", label: "Event Photography" },
    { value: "commercial", label: "Commercial Photography" },
    { value: "fashion", label: "Fashion Photography" },
    { value: "landscape", label: "Landscape Photography" },
    { value: "product", label: "Product Photography" },
  ];

  const priceTypes = [
    { value: "fixed", label: "Fixed Price" },
    { value: "hourly", label: "Hourly Rate" },
    { value: "per_photo", label: "Per Photo" },
    { value: "package", label: "Package Deal" },
  ];

  const formatOptions = [
    { value: "jpeg", label: "JPEG" },
    { value: "raw", label: "RAW" },
    { value: "png", label: "PNG" },
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (service) {
      setFormData({
        ...service,
        basePrice: service.basePrice.toString(),
        priceStructure: {
          ...service.priceStructure,
          additionalHourRate: service.priceStructure.additionalHourRate?.toString() || "",
        },
        deliverables: {
          ...service.deliverables,
          photos: {
            digital: service.deliverables.photos.digital || 0,
            prints: service.deliverables.photos.prints || 0,
          },
          editedPhotos: service.deliverables.editedPhotos || 0,
        },
      });
    }
  }, [service]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleDeepNestedInputChange = (parent, subParent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [subParent]: {
          ...prev[parent][subParent],
          [field]: value,
        },
      },
    }));
  };

  const addToList = (listName, value, inputSetter) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [listName]: [...prev[listName], value.trim()],
      }));
      inputSetter("");
    }
  };

  const removeFromList = (listName, index) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }));
  };

  const addAddOn = () => {
    if (addOnForm.name && addOnForm.price) {
      setFormData((prev) => ({
        ...prev,
        addOns: [
          ...prev.addOns,
          {
            name: addOnForm.name,
            description: addOnForm.description,
            price: parseFloat(addOnForm.price),
          },
        ],
      }));
      setAddOnForm({ name: "", description: "", price: "" });
    }
  };

  const removeAddOn = (index) => {
    setFormData((prev) => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index),
    }));
  };

  const handleFormatChange = (format) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: {
        ...prev.deliverables,
        format: prev.deliverables.format.includes(format)
          ? prev.deliverables.format.filter((f) => f !== format)
          : [...prev.deliverables.format, format],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert string numbers to actual numbers
    const submissionData = {
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      priceStructure: {
        ...formData.priceStructure,
        additionalHourRate: formData.priceStructure.additionalHourRate
          ? parseFloat(formData.priceStructure.additionalHourRate)
          : undefined,
      },
    };

    onSubmit(submissionData);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            {service ? "Edit Service" : "Create New Service"}
          </h2>
          <button
            onClick={onCancel}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Error Message */}
          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg'>
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Service Name *
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                required>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Base Price (₦) *
              </label>
              <input
                type='number'
                value={formData.basePrice}
                onChange={(e) => handleInputChange("basePrice", e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                min='0'
                step='100'
                required
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows='3'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                required
              />
            </div>
          </div>

          {/* Pricing Structure */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Pricing Structure</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Pricing Type
                </label>
                <select
                  value={formData.priceStructure.type}
                  onChange={(e) =>
                    handleNestedInputChange("priceStructure", "type", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'>
                  {priceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.priceStructure.type === "hourly" && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Additional Hour Rate (₦)
                  </label>
                  <input
                    type='number'
                    value={formData.priceStructure.additionalHourRate}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "priceStructure",
                        "additionalHourRate",
                        e.target.value
                      )
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                    min='0'
                    step='100'
                  />
                </div>
              )}
            </div>

            {formData.priceStructure.type === "package" && (
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Package Details
                </label>
                <textarea
                  value={formData.priceStructure.packageDetails}
                  onChange={(e) =>
                    handleNestedInputChange("priceStructure", "packageDetails", e.target.value)
                  }
                  rows='2'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                  placeholder="Describe what's included in the package..."
                />
              </div>
            )}
          </div>

          {/* Duration */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Duration</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Minimum Hours
                </label>
                <input
                  type='number'
                  value={formData.duration.min}
                  onChange={(e) =>
                    handleNestedInputChange("duration", "min", parseInt(e.target.value))
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                  min='1'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Maximum Hours
                </label>
                <input
                  type='number'
                  value={formData.duration.max}
                  onChange={(e) =>
                    handleNestedInputChange("duration", "max", parseInt(e.target.value))
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                  min='1'
                  required
                />
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>What's Included</h3>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={includeInput}
                onChange={(e) => setIncludeInput(e.target.value)}
                placeholder="Add what's included..."
                className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
              />
              <button
                type='button'
                onClick={() => addToList("includes", includeInput, setIncludeInput)}
                className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'>
                <Plus className='w-4 h-4' />
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {formData.includes.map((item, index) => (
                <span
                  key={index}
                  className='flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm'>
                  {item}
                  <button
                    type='button'
                    onClick={() => removeFromList("includes", index)}
                    className='ml-2 text-purple-600 hover:text-purple-800'>
                    <X className='w-3 h-3' />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Deliverables</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Digital Photos
                </label>
                <input
                  type='number'
                  value={formData.deliverables.photos.digital}
                  onChange={(e) =>
                    handleDeepNestedInputChange(
                      "deliverables",
                      "photos",
                      "digital",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                  min='0'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Edited Photos
                </label>
                <input
                  type='number'
                  value={formData.deliverables.editedPhotos}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "deliverables",
                      "editedPhotos",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                  min='0'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Delivery Time
                </label>
                <input
                  type='text'
                  value={formData.deliverables.deliveryTime}
                  onChange={(e) =>
                    handleNestedInputChange("deliverables", "deliveryTime", e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white'
                  placeholder='e.g., 7-14 days'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                File Formats
              </label>
              <div className='flex space-x-4'>
                {formatOptions.map((format) => (
                  <label key={format.value} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={formData.deliverables.format.includes(format.value)}
                      onChange={() => handleFormatChange(format.value)}
                      className='w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
                    />
                    <span className='ml-2 text-sm text-gray-700 dark:text-gray-300'>
                      {format.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>Settings</h3>
            <div className='flex items-center'>
              <input
                type='checkbox'
                checked={formData.featured}
                onChange={(e) => handleInputChange("featured", e.target.checked)}
                className='w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
              />
              <label className='ml-2 text-sm text-gray-700 dark:text-gray-300'>
                Featured Service
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700'>
            <button
              type='button'
              onClick={onCancel}
              className='px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'>
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
              {loading && <LoadingSpinner size='sm' className='mr-2' />}
              {service ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
