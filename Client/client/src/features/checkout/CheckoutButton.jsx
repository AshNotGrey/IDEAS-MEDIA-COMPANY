import React, { useState } from "react";
import loadPaystackScript from "../../lib/paystack/loadPaystackScript.js";

export default function CheckoutButton({ propId, orderId, token, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      const initRes = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propId, orderId }),
      });
      if (!initRes.ok) throw new Error("Failed to initialize payment");
      const init = await initRes.json();

      await loadPaystackScript();

      const handler = window.PaystackPop.setup({
        key: init.publicKey,
        email: init.email,
        amount: init.amountKobo,
        currency: init.currency,
        ref: init.reference,
        metadata: init.meta,
        onClose: () => {},
        callback: async ({ reference }) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ reference }),
            });
            const json = await verifyRes.json();
            if (verifyRes.ok) onSuccess?.(json);
            else onError?.(json);
          } catch (err) {
            onError?.(err);
          }
        },
      });
      handler.openIframe();
    } catch (err) {
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant='primary' onClick={handlePay} disabled={loading} loading={loading}>
      {loading ? "Processing…" : "Pay with Paystack"}
    </Button>
  );
}
