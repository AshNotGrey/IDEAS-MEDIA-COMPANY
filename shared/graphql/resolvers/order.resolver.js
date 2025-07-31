import { models } from '../../mongoDB/index.js';
const { Order, Product, User } = models;
import { utils } from '../../mongoDB/index.js';
const { createAuditLog } = utils;

const orderResolvers = {
    Query: {
        // Customer queries
        myCart: async (_, __, { user, requireAuth }) => {
            requireAuth();
            return await Order.getActiveCart(user._id).populate('items.product customer');
        },

        myOrders: async (_, { page, limit, status }, { user, requireAuth }) => {
            requireAuth();
            const query = { customer: user._id };
            if (status) query.status = status;

            const skip = (page - 1) * limit;
            const [orders, total] = await Promise.all([
                Order.find(query)
                    .populate('items.product customer assignedTo')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Order.countDocuments(query)
            ]);

            return {
                orders,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        },

        myOrder: async (_, { id }, { user, requireAuth }) => {
            requireAuth();
            const order = await Order.findOne({ _id: id, customer: user._id })
                .populate('items.product customer assignedTo');
            if (!order) throw new Error('Order not found');
            return order;
        },

        // Admin queries
        orders: async (_, { filter, page, limit, sortBy, sortOrder }, { requireAdmin }) => {
            requireAdmin();
            const query = {};

            if (filter) {
                if (filter.status) query.status = filter.status;
                if (filter.orderType) query.orderType = filter.orderType;
                if (filter.customer) query.customer = filter.customer;
                if (filter.assignedTo) query.assignedTo = filter.assignedTo;
                if (filter.dateFrom || filter.dateTo) {
                    query.createdAt = {};
                    if (filter.dateFrom) query.createdAt.$gte = new Date(filter.dateFrom);
                    if (filter.dateTo) query.createdAt.$lte = new Date(filter.dateTo);
                }
                if (filter.search) {
                    query.$or = [
                        { orderNumber: { $regex: filter.search, $options: 'i' } },
                        { 'customerInfo.name': { $regex: filter.search, $options: 'i' } },
                        { 'customerInfo.email': { $regex: filter.search, $options: 'i' } }
                    ];
                }
            }

            const skip = (page - 1) * limit;
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const [orders, total] = await Promise.all([
                Order.find(query)
                    .populate('items.product customer assignedTo')
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit),
                Order.countDocuments(query)
            ]);

            return {
                orders,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        },

        order: async (_, { id }, { requireAdmin }) => {
            requireAdmin();
            return await Order.findById(id).populate('items.product customer assignedTo');
        },

        orderByNumber: async (_, { orderNumber }, { requireAdmin }) => {
            requireAdmin();
            return await Order.findOne({ orderNumber }).populate('items.product customer assignedTo');
        },

        orderStats: async (_, __, { requireAdmin }) => {
            requireAdmin();
            const [
                totalOrders,
                activeOrders,
                completedOrders,
                revenueResult,
                statusCounts,
                typeCounts,
                overdueRentals
            ] = await Promise.all([
                Order.countDocuments({ status: { $ne: 'cart' } }),
                Order.countDocuments({ status: { $in: ['processing', 'ready_for_pickup', 'in_progress'] } }),
                Order.countDocuments({ status: 'completed' }),
                Order.aggregate([
                    { $match: { status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$pricing.total' } } }
                ]),
                Order.aggregate([
                    { $match: { status: { $ne: 'cart' } } },
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ]),
                Order.aggregate([
                    { $match: { status: { $ne: 'cart' } } },
                    { $group: { _id: '$orderType', count: { $sum: 1 } } }
                ]),
                Order.getOverdueRentals().countDocuments()
            ]);

            return {
                totalOrders,
                activeOrders,
                completedOrders,
                totalRevenue: revenueResult[0]?.total || 0,
                ordersByStatus: statusCounts.map(s => ({ status: s._id, count: s.count })),
                ordersByType: typeCounts.map(t => ({ type: t._id, count: t.count })),
                overdueRentals
            };
        },

        overdueRentals: async (_, __, { requireAdmin }) => {
            requireAdmin();
            return await Order.getOverdueRentals().populate('items.product customer');
        },

        recentOrders: async (_, { limit }, { requireAdmin }) => {
            requireAdmin();
            return await Order.find({ status: { $ne: 'cart' } })
                .populate('items.product customer')
                .sort({ createdAt: -1 })
                .limit(limit);
        },

        dailyRevenue: async (_, { days }, { requireAdmin }) => {
            requireAdmin();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const result = await Order.aggregate([
                {
                    $match: {
                        status: 'completed',
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        revenue: { $sum: '$pricing.total' },
                        orderCount: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return result.map(r => ({
                date: r._id,
                revenue: r.revenue,
                orderCount: r.orderCount
            }));
        },

        monthlyRevenue: async (_, { months }, { requireAdmin }) => {
            requireAdmin();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const result = await Order.aggregate([
                {
                    $match: {
                        status: 'completed',
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                        revenue: { $sum: '$pricing.total' },
                        orderCount: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return result.map(r => ({
                date: r._id,
                revenue: r.revenue,
                orderCount: r.orderCount
            }));
        }
    },

    Mutation: {
        // Cart management
        addToCart: async (_, { input }, { user, requireAuth, audit }) => {
            requireAuth();

            const product = await Product.findById(input.productId);
            if (!product) throw new Error('Product not found');
            if (!product.isInStock) throw new Error('Product is out of stock');

            let cart = await Order.getActiveCart(user._id);

            if (!cart) {
                cart = new Order({
                    customer: user._id,
                    customerInfo: {
                        name: user.name,
                        email: user.email,
                        phone: user.phone || '',
                        verificationStatus: {
                            nin: user.verification.nin.status,
                            driversLicense: user.verification.driversLicense.status
                        }
                    },
                    orderType: product.type === 'equipment_rental' ? 'rental' : 'purchase',
                    items: []
                });
            }

            await cart.addItem(input.productId, input.quantity, product.finalPrice, {
                rentalPeriod: input.rentalPeriod,
                serviceDetails: input.serviceDetails,
                productInfo: {
                    name: product.name,
                    sku: product.sku,
                    type: product.type,
                    category: product.category,
                    images: { thumbnail: product.images.thumbnail }
                }
            });

            await audit('order.cart.add_item',
                { resourceType: 'order', resourceId: cart._id, resourceName: cart.orderNumber },
                { status: 'success' }
            );

            return {
                order: await cart.populate('items.product customer'),
                message: 'Item added to cart successfully'
            };
        },

        updateCartItem: async (_, { input }, { user, requireAuth, audit }) => {
            requireAuth();

            const cart = await Order.getActiveCart(user._id);
            if (!cart) throw new Error('Cart not found');

            await cart.updateItemQuantity(input.productId, input.quantity);

            await audit('order.cart.update_item',
                { resourceType: 'order', resourceId: cart._id, resourceName: cart.orderNumber },
                { status: 'success' }
            );

            return {
                order: await cart.populate('items.product customer'),
                message: 'Cart item updated successfully'
            };
        },

        removeFromCart: async (_, { productId }, { user, requireAuth, audit }) => {
            requireAuth();

            const cart = await Order.getActiveCart(user._id);
            if (!cart) throw new Error('Cart not found');

            await cart.removeItem(productId);

            await audit('order.cart.remove_item',
                { resourceType: 'order', resourceId: cart._id, resourceName: cart.orderNumber },
                { status: 'success' }
            );

            return {
                order: await cart.populate('items.product customer'),
                message: 'Item removed from cart successfully'
            };
        },

        clearCart: async (_, __, { user, requireAuth, audit }) => {
            requireAuth();

            const cart = await Order.getActiveCart(user._id);
            if (!cart) throw new Error('Cart not found');

            cart.items = [];
            await cart.save();

            await audit('order.cart.clear',
                { resourceType: 'order', resourceId: cart._id, resourceName: cart.orderNumber },
                { status: 'success' }
            );

            return {
                order: await cart.populate('items.product customer'),
                message: 'Cart cleared successfully'
            };
        },

        // Checkout process
        proceedToCheckout: async (_, { input }, { user, requireAuth, audit }) => {
            requireAuth();

            const cart = await Order.getActiveCart(user._id);
            if (!cart) throw new Error('Cart not found');
            if (cart.items.length === 0) throw new Error('Cart is empty');

            // Validate verification for rentals
            if (cart.needsVerification) {
                throw new Error('NIN and Driver\'s License verification required for rentals');
            }

            cart.referrerInfo = input.referrerInfo;
            if (input.fulfillment) {
                cart.fulfillment = { ...cart.fulfillment, ...input.fulfillment };
            }
            if (input.notes) {
                cart.fulfillment.notes = input.notes;
            }

            await cart.proceedToCheckout();

            await audit('order.checkout',
                { resourceType: 'order', resourceId: cart._id, resourceName: cart.orderNumber },
                { status: 'success' }
            );

            return await cart.populate('items.product customer');
        },

        initiatePayment: async (_, { orderId, input }, { user, requireAuth, audit }) => {
            requireAuth();

            const order = await Order.findOne({ _id: orderId, customer: user._id });
            if (!order) throw new Error('Order not found');
            if (order.status !== 'checkout') throw new Error('Order is not ready for payment');

            // TODO: Integrate with Paystack
            const paymentUrl = `https://checkout.paystack.com/...`;
            const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            order.payment.method = input.method;
            order.payment.paystack.reference = reference;
            order.payment.paystack.authorizationUrl = paymentUrl;
            order.status = 'payment_pending';

            await order.save();

            await audit('order.payment.initiate',
                { resourceType: 'order', resourceId: order._id, resourceName: order.orderNumber },
                { status: 'success' }
            );

            return {
                success: true,
                order: await order.populate('items.product customer'),
                paymentUrl,
                reference,
                message: 'Payment initiated successfully'
            };
        },

        confirmPayment: async (_, { orderId, reference }, { user, requireAuth, audit }) => {
            requireAuth();

            const order = await Order.findOne({ _id: orderId, customer: user._id });
            if (!order) throw new Error('Order not found');
            if (order.payment.paystack.reference !== reference) {
                throw new Error('Invalid payment reference');
            }

            // TODO: Verify payment with Paystack
            await order.confirmPayment({
                paystack: {
                    transactionId: 'TXN-' + Date.now(),
                    paidAt: new Date()
                }
            });

            // Reserve equipment if rental
            if (order.orderType === 'rental' || order.orderType === 'mixed') {
                for (const item of order.items) {
                    if (item.productInfo.type === 'equipment_rental') {
                        const product = await Product.findById(item.product);
                        if (product) {
                            await product.reserveEquipment(item.quantity);
                        }
                    }
                }
            }

            await audit('order.payment.confirm',
                { resourceType: 'order', resourceId: order._id, resourceName: order.orderNumber },
                { status: 'success' }
            );

            return await order.populate('items.product customer');
        },

        // Order management (Admin)
        updateOrderStatus: async (_, { id, status }, { requireAdmin, user, audit }) => {
            requireAdmin();

            const order = await Order.findById(id);
            if (!order) throw new Error('Order not found');

            const previousStatus = order.status;
            order.status = status;
            await order.save();

            await audit('order.status.update',
                { resourceType: 'order', resourceId: order._id, resourceName: order.orderNumber },
                { status: 'success' },
                { previousStatus, newStatus: status }
            );

            return await order.populate('items.product customer assignedTo');
        },

        assignOrder: async (_, { id, assigneeId }, { requireAdmin, user, audit }) => {
            requireAdmin();

            const order = await Order.findById(id);
            if (!order) throw new Error('Order not found');

            const assignee = await User.findById(assigneeId);
            if (!assignee) throw new Error('Assignee not found');

            order.assignedTo = assigneeId;
            await order.save();

            await audit('order.assign',
                { resourceType: 'order', resourceId: order._id, resourceName: order.orderNumber },
                { status: 'success' }
            );

            return await order.populate('items.product customer assignedTo');
        },

        addInternalNote: async (_, { input }, { requireAdmin, user, audit }) => {
            requireAdmin();

            const order = await Order.findById(input.orderId);
            if (!order) throw new Error('Order not found');

            order.internalNotes.push({
                note: input.note,
                addedBy: user._id
            });
            await order.save();

            await audit('order.note.add',
                { resourceType: 'order', resourceId: order._id, resourceName: order.orderNumber },
                { status: 'success' }
            );

            return await order.populate('items.product customer assignedTo');
        },

        // Additional mutations would go here...
        // (markOrderReady, markOrderDelivered, cancelOrder, processRefund, etc.)
    }
};

export default orderResolvers; 