import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, Calendar, Clock } from "lucide-react";
import formatPrice from "../utils/format";
import { DUMMY_PRODUCTS } from "../constants";
import { useCart } from "../utils/useCart";
import { useWishlist } from "../utils/useWishlist";
import Button from "../components/Button";
import WishlistButton from "../components/WishlistButton";
import RentalDateTimePicker from "../components/RentalDateTimePicker";
import RefereeForm from "../components/RefereeForm";

/**
 * ProductDetails Page
 *
 * Displays detailed information about a specific product.
 * Handles both equipment rentals and shop purchases with appropriate CTAs.
 *
 * @component
 * @returns {JSX.Element}
 */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items: cartItems, addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // All state hooks must be called before any conditional returns
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [rentalQuantity, setRentalQuantity] = useState(1);

  // Referee state for rental items
  const [referee, setReferee] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Rental date/time state for equipment
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [endDate, setEndDate] = useState(() => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow;
  });
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnTime, setReturnTime] = useState("17:00");

  // Find the product from DUMMY_PRODUCTS
  const product = DUMMY_PRODUCTS.find((p) => p.id.toString() === id);

  // Determine if this is a rental item (equipment categories)
  const rentalCategories = ["cameras", "lenses", "lighting"];
  const isRental = product && rentalCategories.includes(product.category);

  // Check if referee information is complete for rentals
  const isRefereeComplete =
    !isRental || (referee.name.trim() && referee.email.trim() && referee.phone.trim());

  // Check if all required information is complete
  const isFormComplete =
    (!isRental ||
      (startDate &&
        endDate &&
        pickupTime &&
        returnTime &&
        isRefereeComplete &&
        rentalQuantity > 0 &&
        rentalQuantity <= (product?.stock || 0))) &&
    (isRental || quantity > 0);

  // Helper function to check if item is already in cart
  const isItemInCart = () => {
    if (!product || !cartItems) return false;

    if (isRental) {
      // For rental items, check if same product with same dates exists
      const rentalStartDate = startDate?.toISOString().split("T")[0];
      const rentalEndDate = endDate?.toISOString().split("T")[0];

      return cartItems.some(
        (item) =>
          item.type === "rental" &&
          item.productId === product.id &&
          item.rentalDetails?.startDate === rentalStartDate &&
          item.rentalDetails?.endDate === rentalEndDate &&
          item.rentalDetails?.pickupTime === pickupTime &&
          item.rentalDetails?.returnTime === returnTime &&
          item.quantity === rentalQuantity
      );
    } else {
      // For purchase items, check if same product exists
      return cartItems.some((item) => item.type === "purchase" && item.id === product.id);
    }
  };

  // If product not found, show error
  if (!product) {
    return (
      <section className='max-w-7xl mx-auto px-4 py-section'>
        <div className='text-center py-12'>
          <h1 className='text-3xl font-bold mb-4'>Product Not Found</h1>
          <p className='text-black/60 dark:text-white/60 mb-6'>
            The product you're looking for doesn't exist or may have been removed.
          </p>
          <Button variant='primary' onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </section>
    );
  }

  // Prepare product images (fallback to default if not available)
  const productImages = product.image
    ? [product.image, product.hoverImage || product.image, product.image]
    : ["/images/idealPhotography-Asset product-placeholder.png"];

  const handleAddToCart = async () => {
    if (isRental) {
      // Validate rental requirements
      if (!startDate || !endDate || !pickupTime || !returnTime) {
        alert("Please select rental dates and times.");
        return Promise.reject(new Error("Missing rental dates/times"));
      }

      // Validate referee information for rentals
      if (!referee.name.trim() || !referee.email.trim() || !referee.phone.trim()) {
        alert("Please provide complete referee information before proceeding.");
        return Promise.reject(new Error("Incomplete referee information"));
      }

      // Validate rental quantity against stock
      if (rentalQuantity <= 0 || rentalQuantity > (product.stock || 0)) {
        alert(`Please select a valid quantity (1-${product.stock || 0} available).`);
        return Promise.reject(new Error("Invalid rental quantity"));
      }

      // Calculate rental pricing
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const dailyRate = product.price;
      const baseTotal = dailyRate * duration * rentalQuantity;

      // Apply extended period discounts
      let discountPercent = 0;
      if (duration >= 7) {
        discountPercent = 15; // 15% discount for 7+ days
      } else if (duration >= 3) {
        discountPercent = 10; // 10% discount for 3-6 days
      } else if (duration > 1) {
        discountPercent = 5; // 5% discount for 2 days
      }

      const totalPrice = baseTotal * (1 - discountPercent / 100);

      // For rental items, add with rental details including referee
      const rentalItem = {
        id: `rental-${product.id}-${Date.now()}`,
        productId: product.id,
        type: "rental",
        title: product.title,
        description: product.description,
        image: product.image || "/images/idealPhotography-Asset product-placeholder.png",
        price: totalPrice,
        quantity: rentalQuantity,
        rentalDetails: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          pickupTime,
          returnTime,
          duration,
          dailyRate,
          baseTotal,
          discountPercent,
          totalPrice,
          referee: {
            name: referee.name.trim(),
            email: referee.email.trim(),
            phone: referee.phone.trim(),
          },
        },
      };
      addItem(rentalItem);
    } else {
      // For regular items, add with quantity
      if (quantity <= 0) {
        alert("Please select a valid quantity.");
        return Promise.reject(new Error("Invalid quantity"));
      }

      addItem({
        ...product,
        quantity: quantity,
        type: "purchase",
      });
    }

    // Show success feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
    return Promise.resolve();
  };

  const handleRentNow = async () => {
    try {
      // Only add to cart if this exact item isn't already in cart
      if (!isItemInCart()) {
        await handleAddToCart();
      }
      navigate("/cart");
    } catch (error) {
      // Don't navigate if validation fails
      console.error("Rental validation failed:", error.message);
    }
  };

  const handleBuyNow = async () => {
    try {
      // Only add to cart if this exact item isn't already in cart
      if (!isItemInCart()) {
        await handleAddToCart();
      }
      navigate("/cart");
    } catch (error) {
      // Don't navigate if validation fails
      console.error("Purchase validation failed:", error.message);
    }
  };

  const handleToggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
    />
  ));

  return (
    <section className='max-w-7xl mx-auto px-4 py-section'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        {/* Product Images */}
        <div className='space-y-4'>
          <div className='aspect-square rounded-lg overflow-hidden relative'>
            <img
              src={productImages[selectedImage]}
              alt={product.title}
              className='w-full h-full object-cover'
            />
            {/* Wishlist button overlay */}
            <div className='absolute top-4 right-4'>
              <WishlistButton item={product} size='lg' />
            </div>
          </div>
          {productImages.length > 1 && (
            <div className='flex gap-2'>
              {productImages.map((image, index) => (
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
          )}
        </div>

        {/* Product Info */}
        <div className='space-y-6'>
          <div>
            <div className='flex items-start justify-between mb-2'>
              <h1 className='text-3xl font-bold'>{product.title}</h1>
              {/* Category badge */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isRental
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                }`}>
                {isRental ? "For Rent" : "For Sale"}
              </span>
            </div>
            <div className='flex items-center gap-4 mb-4'>
              <div className='flex items-center gap-1'>
                {stars}
                <span className='text-sm text-black/60 dark:text-white/60 ml-2'>
                  {product.rating || 0} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>
            <p className='text-black/60 dark:text-white/60 leading-relaxed'>
              {product.description}
            </p>
          </div>

          {/* Pricing */}
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <span className='text-3xl font-bold'>
                {formatPrice(product.price)}
                {isRental ? "/day" : ""}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className='text-xl text-black/60 dark:text-white/60 line-through'>
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-sm font-medium'>
                    {product.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            <p className='text-sm text-black/60 dark:text-white/60'>
              Stock: {product.stock || 0} available
            </p>
          </div>

          {/* Rental Date/Time Picker or Quantity Selector */}
          {isRental ? (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Rental Details</h3>
                <RentalDateTimePicker
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  pickupTime={pickupTime}
                  setPickupTime={setPickupTime}
                  returnTime={returnTime}
                  setReturnTime={setReturnTime}
                />
              </div>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Quantity</h3>
                <div className='space-y-2'>
                  <label className='block text-sm font-medium'>
                    Number of units (Max: {product.stock || 0} available)
                  </label>
                  <div className='flex items-center gap-3'>
                    <button
                      type='button'
                      onClick={() => setRentalQuantity(Math.max(1, rentalQuantity - 1))}
                      className='w-10 h-10 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
                      -
                    </button>
                    <span className='w-16 text-center font-medium'>{rentalQuantity}</span>
                    <button
                      type='button'
                      onClick={() =>
                        setRentalQuantity(Math.min(product.stock || 0, rentalQuantity + 1))
                      }
                      className='w-10 h-10 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
                      +
                    </button>
                  </div>
                  {rentalQuantity > (product.stock || 0) && (
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      Only {product.stock || 0} units available
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Referee Information</h3>
                <RefereeForm referee={referee} setReferee={setReferee} required={true} />
              </div>
            </div>
          ) : (
            <div className='space-y-2'>
              <label className='block text-sm font-medium'>Quantity</label>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className='w-10 h-10 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
                  -
                </button>
                <span className='w-16 text-center font-medium'>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className='w-10 h-10 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='space-y-4'>
            {/* Primary Actions */}
            <div className='flex gap-4'>
              <Button
                variant='secondary'
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdded || !isFormComplete || isItemInCart()}
                className='flex-1'
                leftIcon={
                  isRental ? <Calendar className='w-5 h-5' /> : <ShoppingCart className='w-5 h-5' />
                }
                loading={isAdded}>
                {isItemInCart()
                  ? "In Cart"
                  : isAdded
                    ? "Added!"
                    : isRental
                      ? "Add to Cart"
                      : "Add to Cart"}
              </Button>
              <Button
                variant='secondary'
                onClick={handleToggleWishlist}
                className='px-4'
                leftIcon={
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? "fill-current text-red-500" : ""
                    }`}
                  />
                }
              />
            </div>

            {/* Secondary Action */}
            <Button
              variant='primary'
              onClick={isRental ? handleRentNow : handleBuyNow}
              disabled={product.stock === 0 || !isFormComplete}
              className='w-full'
              animated
              leftIcon={<Clock className='w-5 h-5' />}>
              {isItemInCart() ? "Go to Cart" : isRental ? "Rent Now" : "Buy Now"}
            </Button>
          </div>

          {/* Features/Tags */}
          {(product.features || product.tags) && (
            <div>
              <h3 className='text-lg font-semibold mb-3'>
                {product.features ? "Key Features" : "Tags"}
              </h3>
              {product.features ? (
                <ul className='space-y-2'>
                  {product.features.map((feature, index) => (
                    <li key={index} className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-ideas-accent rounded-full'></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {product.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded-full'>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      {product.specifications && (
        <div className='mt-16'>
          <h2 className='text-2xl font-bold mb-6'>Specifications</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {Object.entries(product.specifications).map(([key, value]) => (
              <div
                key={key}
                className='flex justify-between py-2 border-b border-gray-200 dark:border-gray-700'>
                <span className='font-medium'>{key}</span>
                <span className='text-black/60 dark:text-white/60'>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Product Info */}
      <div className='mt-16 grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='card'>
          <h3 className='text-lg font-semibold mb-4'>
            {isRental ? "Rental Information" : "Product Information"}
          </h3>
          <div className='space-y-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-black/60 dark:text-white/60'>Category:</span>
              <span className='font-medium capitalize'>{product.category}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-black/60 dark:text-white/60'>Stock:</span>
              <span
                className={`font-medium ${
                  product.stock > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </span>
            </div>
            {product.discountValidUntil && (
              <div className='flex justify-between'>
                <span className='text-black/60 dark:text-white/60'>Discount valid until:</span>
                <span className='font-medium text-ideas-accent'>{product.discountValidUntil}</span>
              </div>
            )}
          </div>
        </div>

        <div className='card'>
          <h3 className='text-lg font-semibold mb-4'>
            {isRental ? "Rental Terms" : "Purchase Terms"}
          </h3>
          <div className='space-y-3 text-sm text-black/60 dark:text-white/60'>
            {isRental ? (
              <>
                <p>• Minimum rental period: 1 day</p>
                <p>• Extended rentals get discounts</p>
                <p>• Equipment is insured during rental</p>
                <p>• Professional maintenance guarantee</p>
              </>
            ) : (
              <>
                <p>• 30-day return policy</p>
                <p>• Manufacturer warranty included</p>
                <p>• Free shipping on orders over ₦50,000</p>
                <p>• Secure payment processing</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
