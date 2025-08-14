export default function loadPaystackScript() {
    return new Promise((resolve, reject) => {
        if (window.PaystackPop) return resolve(window.PaystackPop);
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => resolve(window.PaystackPop);
        script.onerror = reject;
        document.body.appendChild(script);
    });
}


