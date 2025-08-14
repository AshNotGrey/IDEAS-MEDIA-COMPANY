import React from "react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_USER_ORDERS } from "../../graphql/queries/orders";
import { useAuth } from "../../contexts/AuthContext";
import formatPrice from "../../utils/format";
import Button from "../Button";

/**
 * RecentOrdersWidget Component
 *
 * Displays the last 3 product orders with status - no actions
 */
const RecentOrdersWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user orders using GraphQL
  const {
    data: ordersData,
    loading,
    error,
  } = useQuery(GET_USER_ORDERS, {
    variables: {
      userId: user?.id,
      filters: { limit: 5 },
    },
    skip: !user?.id,
    fetchPolicy: "cache-and-network",
  });

  // Extract orders from the response and filter for completed/purchased orders only
  const allOrders = ordersData?.userOrders?.orders || [];
  const productOrders = allOrders.filter(
    (order) => order.orderType === "purchase" || order.orderType === "mini_mart_sale"
  );

  // Sort orders by date and take last 3
  const recentOrders = productOrders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

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
      case "completed":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
      case "processing":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
      case "ready_for_pickup":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20";
      case "payment_pending":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "cancelled":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800/50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <Package className='w-3 h-3' />;
      case "ready_for_pickup":
        return <Package className='w-3 h-3' />;
      default:
        return <Package className='w-3 h-3' />;
    }
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
              className='animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-16'></div>
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
        <Button variant='text' size='sm' onClick={() => navigate("/mini-mart")}>
          Shop More
        </Button>
      </div>

      {recentOrders.length === 0 ? (
        <div className='text-center py-6'>
          <Package className='w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2' />
          <p className='text-subtle text-sm'>No recent orders</p>
          <p className='text-xs text-gray-500 dark:text-gray-400 mb-3'>
            {productOrders.length === 0
              ? "Start shopping to see your orders here"
              : "No product orders found"}
          </p>
          <Button variant='text' size='sm' onClick={() => navigate("/mini-mart")}>
            Browse products
          </Button>
        </div>
      ) : (
        <div className='space-y-2'>
          {recentOrders.map((order) => (
            <div
              key={order._id}
              className='p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-ideas-accent/30 transition-colors'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h4 className='font-medium text-gray-900 dark:text-white text-sm'>
                      Order #{order.orderNumber}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className='text-xs text-gray-600 dark:text-gray-300 truncate'>
                    {order.items
                      ?.map((item) => `${item.productInfo?.name || "Product"} (${item.quantity})`)
                      .join(", ")}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className='text-right'>
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    {formatPrice(order.pricing?.total || 0)}
                  </span>
                  {order.pricing?.currency && order.pricing.currency !== "NGN" && (
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {order.pricing.currency}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersWidget;
