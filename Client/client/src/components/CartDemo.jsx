import { useCart } from "../utils/useCart";
import { populateCartWithDemoData } from "../utils/demoData";
import CartIcon from "./CartIcon";
import CartBadge from "./CartBadge";
import CartSummaryBadge from "./CartSummaryBadge";
import useCartTotals from "../hooks/useCartTotals";

/**
 * CartDemo Component
 *
 * A demonstration component showing different ways to use the cart system.
 * This component showcases CartIcon, CartBadge, CartSummaryBadge, and useCartTotals.
 *
 * @component
 * @returns {JSX.Element}
 */
export default function CartDemo() {
  const { addItem, clearCart } = useCart();
  const {
    itemCount,
    uniqueItemCount,
    subtotal,
    total,
    isEmpty,
    hasItems,
    itemTypes,
    categoryBreakdown,
  } = useCartTotals();

  const handleAddDemoItem = () => {
    addItem({
      id: `demo-${Date.now()}`,
      title: "Demo Product",
      price: 99.99,
      originalPrice: 129.99,
      quantity: 1,
      image: "/images/idealphotography-product-placeholder.png",
      category: "demo",
    });
  };

  const handlePopulateDemoData = () => {
    populateCartWithDemoData(addItem);
  };

  return (
    <div className='p-6 space-y-8 bg-ideas-white dark:bg-ideas-black text-black dark:text-white'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>Cart System Demo</h1>

        {/* Cart Statistics */}
        <div className='card mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Cart Statistics</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-ideas-accent'>{itemCount}</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Total Items</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-ideas-accent'>{uniqueItemCount}</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Unique Items</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-ideas-accent'>${subtotal.toFixed(2)}</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Subtotal</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-ideas-accent'>${total.toFixed(2)}</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>Total</p>
            </div>
          </div>
        </div>

        {/* Cart Icon Examples */}
        <div className='card mb-8'>
          <h2 className='text-xl font-semibold mb-4'>CartIcon Examples</h2>
          <div className='flex flex-wrap gap-4 items-center'>
            <div className='text-center'>
              <p className='text-sm mb-2'>Small</p>
              <CartIcon size='sm' />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Medium</p>
              <CartIcon size='md' />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Large</p>
              <CartIcon size='lg' />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>No Count</p>
              <CartIcon showCount={false} />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Button Style</p>
              <CartIcon variant='button' />
            </div>
          </div>
        </div>

        {/* Cart Badge Examples */}
        <div className='card mb-8'>
          <h2 className='text-xl font-semibold mb-4'>CartBadge Examples</h2>
          <div className='flex flex-wrap gap-4 items-center'>
            <div className='text-center'>
              <p className='text-sm mb-2'>Default</p>
              <CartBadge />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Minimal</p>
              <CartBadge variant='minimal' />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Outline</p>
              <CartBadge variant='outline' />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Show Zero</p>
              <CartBadge showZero={true} />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Large</p>
              <CartBadge size='lg' />
            </div>
          </div>
        </div>

        {/* Cart Summary Badge Examples */}
        <div className='card mb-8'>
          <h2 className='text-xl font-semibold mb-4'>CartSummaryBadge Examples</h2>
          <div className='flex flex-wrap gap-4 items-center'>
            <div className='text-center'>
              <p className='text-sm mb-2'>Compact</p>
              <CartSummaryBadge variant='compact' />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Detailed</p>
              <CartSummaryBadge variant='detailed' />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Minimal</p>
              <CartSummaryBadge variant='minimal' />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>No Price</p>
              <CartSummaryBadge showPrice={false} />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Large</p>
              <CartSummaryBadge size='lg' />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {hasItems && (
          <div className='card mb-8'>
            <h2 className='text-xl font-semibold mb-4'>Category Breakdown</h2>
            <div className='space-y-2'>
              {Object.entries(categoryBreakdown).map(([category, data]) => (
                <div
                  key={category}
                  className='flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded'>
                  <span className='font-medium capitalize'>{category}</span>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                    {data.count} items - ${data.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo Controls */}
        <div className='card'>
          <h2 className='text-xl font-semibold mb-4'>Demo Controls</h2>
          <div className='flex flex-wrap gap-3'>
            <button onClick={handleAddDemoItem} className='btn-primary px-4 py-2 text-sm'>
              Add Demo Item
            </button>
            <button onClick={handlePopulateDemoData} className='btn-secondary px-4 py-2 text-sm'>
              Load Demo Data
            </button>
            <button
              onClick={clearCart}
              className='btn-secondary px-4 py-2 text-sm border-red-200 text-red-600 hover:bg-red-50'>
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
