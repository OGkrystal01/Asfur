// Simple cart functionality
function addToCart() {
    // Save product to localStorage with structure matching server expectations
    const product = {
        handle: 'nevoris-bag',
        title: 'Nevoris Bag - Premium Women\'s Handbag',
        price: 149,
        image: '/images/logo/Logo.png',
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
    
    try {
        console.log('Initializing checkout...');
        console.log('Cart:', cart);
        
        // Get Stripe publishable key
        const configResponse = await fetch('/api/stripe-config');
        if (!configResponse.ok) {
            throw new Error('Failed to get Stripe config');
        }
        const config = await configResponse.json();
        console.log('Stripe config loaded');
        
        // Initialize Stripe
        const stripe = Stripe(config.publishableKey);
        console.log('Stripe initialized');
        
        // Get form data for email
        const emailInput = document.getElementById('email');
        const nameInput = document.getElementById('name');
        
        // Create payment intent immediately to get clientSecret
        console.log('Creating payment intent...');
        const response = await fetch('/api/payment-intents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cartItems: cart,
                customerName: nameInput?.value || 'Customer',
                customerEmail: emailInput?.value || 'customer@example.com'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const data = await response.json();
        console.log('Payment intent created');
        
        if (!data.clientSecret) {
            throw new Error('No client secret received');
        }
        
        // Create and mount payment element immediately
        const elements = stripe.elements({ clientSecret: data.clientSecret });
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        console.log('Payment element mounted');
        
        // Handle form submission
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
                
                // Confirm payment with Stripe
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
    } catch (error) {
        console.error('Checkout initialization error:', error);
        const paymentElement = document.getElementById('payment-element');
        if (paymentElement) {
            paymentElement.innerHTML = `
                <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
                    <strong>Error:</strong> ${error.message}<br>
                    <small>Please check the console for details or contact support.</small>
                </div>
            `;
        }
    }
}
