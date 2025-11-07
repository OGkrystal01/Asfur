// Simple cart functionality
function addToCart() {
    // Save product to localStorage
    const product = {
        id: 'ebook-cheap-products',
        title: 'Digital E-Book: How to Find Products Cheap',
        price: 20,
        quantity: 1
    };
    
    localStorage.setItem('cart', JSON.stringify([product]));
    localStorage.setItem('customerData', JSON.stringify({}));
    
    // Redirect to checkout
    window.location.href = '/pages/checkout.html';
}

// Initialize Stripe on checkout page
if (document.getElementById('payment-element')) {
    initCheckout();
}

async function initCheckout() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        window.location.href = '/';
        return;
    }
    
    // Display order summary
    const orderSummary = document.getElementById('order-summary');
    if (orderSummary) {
        const product = cart[0];
        orderSummary.innerHTML = `
            <div class="order-item">
                <span>${product.title}</span>
                <span>$${product.price.toFixed(2)}</span>
            </div>
            <div class="order-total">
                <span>Total:</span>
                <span>$${product.price.toFixed(2)}</span>
            </div>
        `;
    }
    
    // Get Stripe publishable key
    const configResponse = await fetch('/api/stripe-config');
    const config = await configResponse.json();
    
    // Initialize Stripe
    const stripe = Stripe(config.publishableKey);
    
    // Get customer info from form
    const form = document.getElementById('checkout-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const button = document.getElementById('complete-payment');
        button.disabled = true;
        button.textContent = 'Processing...';
        
        try {
            // Get form data
            const formData = new FormData(form);
            const customerData = {
                email: formData.get('email'),
                name: formData.get('name')
            };
            
            // Save customer data
            localStorage.setItem('customerData', JSON.stringify(customerData));
            
            // Create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems: cart,
                    customerEmail: customerData.email
                })
            });
            
            const { clientSecret } = await response.json();
            
            // Mount payment element
            const elements = stripe.elements({ clientSecret });
            const paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');
            
            // Handle form submission
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/pages/confirmation.html`,
                    receipt_email: customerData.email
                }
            });
            
            if (error) {
                alert(error.message);
                button.disabled = false;
                button.textContent = 'Complete Payment';
            }
        } catch (err) {
            console.error('Payment error:', err);
            alert('Payment failed. Please try again.');
            button.disabled = false;
            button.textContent = 'Complete Payment';
        }
    });
}
