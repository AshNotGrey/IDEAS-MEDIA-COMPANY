// Demo data for testing cart functionality
export const demoCartItems = [
    {
        id: "1",
        title: "Canon EOS R5 Mirrorless",
        image: "/images/idealPhotography-Asset product-placeholder.png",
        price: 3599.99,
        originalPrice: 3899.99,
        quantity: 1,
    },
    {
        id: "2",
        title: "Makeover + Headshot Package",
        image: "/images/idealPhotography-Asset product-placeholder.png",
        price: 249.99,
        originalPrice: 299.99,
        quantity: 2,
    },
];

// Demo data for testing wishlist functionality
export const demoWishlistItems = [
    {
        id: "3",
        title: "Sony A7 IV Mirrorless Camera",
        image: "/images/idealPhotography-Asset product-placeholder.png",
        price: 2499.99,
        originalPrice: 2699.99,
    },
    {
        id: "4",
        title: "Professional Lighting Kit",
        image: "/images/idealPhotography-Asset product-placeholder.png",
        price: 899.99,
        originalPrice: 999.99,
    },
    {
        id: "5",
        title: "Event Photography Package",
        image: "/images/idealPhotography-Asset product-placeholder.png",
        price: 599.99,
        originalPrice: 699.99,
    },
];

// Function to populate cart with demo data
export const populateCartWithDemoData = (addItem) => {
    demoCartItems.forEach(item => {
        addItem(item);
    });
};

// Function to populate wishlist with demo data
export const populateWishlistWithDemoData = (addToWishlist) => {
    demoWishlistItems.forEach(item => {
        addToWishlist(item);
    });
}; 