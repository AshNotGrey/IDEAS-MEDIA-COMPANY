import React from "react";
import { useParams } from "react-router-dom";
import { Star, ShoppingCart, Heart } from "lucide-react";
import formatPrice from "../utils/format";

/**
 * ProductDetails Page
 *
 * Displays detailed information about a specific product.
 * Includes images, description, pricing, and purchase options.
 *
 * @component
 * @returns {JSX.Element}
 */
const ProductDetails = () => {
  const { id } = useParams();

  // Demo product data - in real app, fetch based on id
  const product = {
    id: id,
    title: "Canon EOS R5 Mirrorless Camera",
    description:
      "The Canon EOS R5 is a professional mirrorless camera featuring a 45MP full-frame sensor, 8K video recording, and advanced autofocus system. Perfect for professional photography and videography.",
    images: [
      "/images/idealPhotography-Asset product-placeholder.png",
      "/images/idealPhotography-Asset product-placeholder.png",
      "/images/idealPhotography-Asset product-placeholder.png",
    ],
    price: 3599.99,
    originalPrice: 3899.99,
    discountPercent: 8,
    stock: 5,
    rating: 4.8,
    reviewCount: 127,
    features: [
      "45MP Full-Frame CMOS Sensor",
      "8K RAW Video Recording",
      "Dual Card Slots (CFexpress + SD)",
      "5.76M-Dot EVF",
      "Dual Pixel CMOS AF II",
      "5-Axis IBIS",
    ],
    specifications: {
      Sensor: "45MP Full-Frame CMOS",
      Video: "8K RAW up to 30fps",
      Autofocus: "Dual Pixel CMOS AF II",
      Stabilization: "5-Axis IBIS",
      Connectivity: "Wi-Fi, Bluetooth, USB-C",
    },
  };

  const [selectedImage, setSelectedImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);

  const handleAddToCart = () => {
    console.log("Add to cart:", product.title, "Quantity:", quantity);
    // TODO: Add to cart functionality
  };

  const handleAddToWishlist = () => {
    console.log("Add to wishlist:", product.title);
    // TODO: Add to wishlist functionality
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
    />
  ));

  return (
    <section className='max-w-7xl mx-auto px-4 py-section'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        {/* Product Images */}
        <div className='space-y-4'>
          <div className='aspect-square rounded-lg overflow-hidden'>
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className='w-full h-full object-cover'
            />
          </div>
          <div className='flex gap-2'>
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? "border-ideas-accent" : "border-gray-200"
                }`}>
                <img
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>{product.title}</h1>
            <div className='flex items-center gap-4 mb-4'>
              <div className='flex items-center gap-1'>
                {stars}
                <span className='text-sm text-subtle ml-2'>
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
            <p className='text-subtle leading-relaxed'>{product.description}</p>
          </div>

          {/* Pricing */}
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <span className='text-3xl font-bold'>{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className='text-xl text-subtle line-through'>
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className='bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium'>
                    {product.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            <p className='text-sm text-subtle'>Stock: {product.stock} available</p>
          </div>

          {/* Quantity */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium'>Quantity</label>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className='w-10 h-10 rounded border flex items-center justify-center hover:bg-gray-50'>
                -
              </button>
              <span className='w-16 text-center font-medium'>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className='w-10 h-10 rounded border flex items-center justify-center hover:bg-gray-50'>
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-4'>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className='btn-primary flex-1 flex items-center justify-center gap-2 py-3'>
              <ShoppingCart className='w-5 h-5' />
              Add to Cart
            </button>
            <button onClick={handleAddToWishlist} className='btn-secondary px-4 py-3'>
              <Heart className='w-5 h-5' />
            </button>
          </div>

          {/* Features */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>Key Features</h3>
            <ul className='space-y-2'>
              {product.features.map((feature, index) => (
                <li key={index} className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-ideas-accent rounded-full'></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className='mt-16'>
        <h2 className='text-2xl font-bold mb-6'>Specifications</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {Object.entries(product.specifications).map(([key, value]) => (
            <div key={key} className='flex justify-between py-2 border-b border-gray-200'>
              <span className='font-medium'>{key}</span>
              <span className='text-subtle'>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
