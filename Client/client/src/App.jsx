import React from "react";
import AppRouter from "./router";
import WhatsAppButton from "./components/WhatsAppButton";
import { CartProvider } from "./utils/CartContext.jsx";
import { WishlistProvider } from "./utils/WishlistContext.jsx";
import { NotificationProvider } from "./utils/NotificationContext.jsx";

const App = () => (
  <CartProvider>
    <WishlistProvider>
      <NotificationProvider>
        <AppRouter />
        <WhatsAppButton
          text='Chat with us'
          phoneNumber='+1234567890'
          message="Hi! I'm interested in your photography services."
          position='bottom-right'
          animated={true}
        />
      </NotificationProvider>
    </WishlistProvider>
  </CartProvider>
);

export default App;
