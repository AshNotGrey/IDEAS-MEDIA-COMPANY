import React from "react";
import { Package, Truck, CreditCard, Eye, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../graphql/hooks/useOrders";
import { useAuth } from "../../contexts/AuthContext";
import formatPrice from "../../utils/format";
import Button from "../Button";

/**
 * RecentOrdersWidget Component
 *
 * Displays the last 5 orders with status and quick actions
 */
const RecentOrdersWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock orders data - replace with actual useOrders hook when available
  const orders = [
    {
      id: "ORD001",
      status: "delivered",
      totalAmount: 45000,
      items: [{ title: "Professional Camera Lens", quantity: 1 }],
      createdAt: "2024-01-15T10:30:00Z",
      balanceAmount: 0,
    },
    {
      id: "ORD002",
      status: "processing",
      totalAmount: 25000,
      items: [{ title: "Studio Lighting Kit", quantity: 2 }],
      createdAt: "2024-01-14T15:20:00Z",
      balanceAmount: 10000,
    },
  ];

  const loading = false;
  const error = null;

  // Sort orders by date and take last 5
  const recentOrders =
    orders?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))?.slice(0, 5) || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
      case "processing":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
      case "shipped":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20";
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "cancelled":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800/50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <Package className='w-3 h-3' />;
      case "shipped":
        return <Truck className='w-3 h-3' />;
      default:
        return <Package className='w-3 h-3' />;
    }
  };

  const handlePayBalance = (order) => {
    // Navigate to payment with order context
    navigate(`/checkout?orderId=${order.id}&type=order`);
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg'>
            <Package className='w-5 h-5 text-ideas-accent' />
          </div>
          <h3 className='text-lg font-semibold'>Recent Orders</h3>
        </div>
        <div className='space-y-3'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-20'></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='card'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg'>
            <Package className='w-5 h-5 text-ideas-accent' />
          </div>
          <h3 className='text-lg font-semibold'>Recent Orders</h3>
        </div>
        <div className='text-center py-4'>
          <p className='text-red-600 dark:text-red-400 text-sm'>Failed to load orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-ideas-accent/10 rounded-lg'>
            <Package className='w-5 h-5 text-ideas-accent' />
          </div>
          <h3 className='text-lg font-semibold'>Recent Orders</h3>
        </div>
        <Button variant='text' size='sm' onClick={() => navigate("/account/orders")}>
          View All
        </Button>
      </div>

      {recentOrders.length === 0 ? (
        <div className='text-center py-8'>
          <Package className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
          <p className='text-subtle mb-4'>No recent orders</p>
          <Button variant='primary' size='sm' onClick={() => navigate("/mini-mart")}>
            Shop Now
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className='p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-ideas-accent/50 transition-colors'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h4 className='font-medium text-gray-900 dark:text-white'>Order #{order.id}</h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-300 truncate'>
                    {order.items?.map((item) => `${item.title} (${item.quantity})`).join(", ")}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                    Ordered on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    {formatPrice(order.totalAmount)}
                  </span>
                  {order.balanceAmount > 0 && (
                    <span className='text-xs text-red-600 dark:text-red-400'>
                      Balance: {formatPrice(order.balanceAmount)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className='flex items-center gap-2'>
                <Button
                  variant='text'
                  size='sm'
                  leftIcon={<Eye className='w-3 h-3' />}
                  onClick={() => navigate(`/orders/${order.id}`)}>
                  View
                </Button>
                {order.status === "processing" && (
                  <Button
                    variant='text'
                    size='sm'
                    leftIcon={<Truck className='w-3 h-3' />}
                    onClick={() => navigate(`/orders/${order.id}/track`)}>
                    Track
                  </Button>
                )}
                {order.balanceAmount > 0 && (
                  <Button
                    variant='primary'
                    size='sm'
                    leftIcon={<CreditCard className='w-3 h-3' />}
                    onClick={() => handlePayBalance(order)}>
                    Pay Balance
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersWidget;
