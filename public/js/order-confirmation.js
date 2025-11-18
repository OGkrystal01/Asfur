document.addEventListener('DOMContentLoaded', async function() {
    const orderItems = document.getElementById('order-items');
    const shippingDetails = document.getElementById('shipping-details');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const orderNumberElement = document.getElementById('order-number');

    // Check if this is a valid order confirmation from Stripe redirect
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentParam = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
    const redirectStatus = urlParams.get('redirect_status');
    
    console.log('Order confirmation loaded');
    console.log('Redirect status:', redirectStatus);
    console.log('Payment intent:', paymentIntentParam);
    
    // Check if we have a successful payment from Stripe redirect
    if (redirectStatus === 'succeeded' || paymentIntentParam) {
        console.log('✅ Payment successful, displaying order confirmation');
        displayOrderConfirmation();
    } else {
        // Check if we have cart data (direct access without payment)
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length > 0) {
            // Has cart, might be testing or direct access
            console.log('⚠️ Displaying order confirmation from cart data');
            displayOrderConfirmation();
        } else {
            // No payment and no cart, redirect to shop
            console.log('❌ No order data found, redirecting to products');
            window.location.href = '/pages/products.html';
            return;
        }
    }

    function displayOrderConfirmation() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const customerData = JSON.parse(localStorage.getItem('customerData')) || {};
        let subtotal = 0;

        // Generate order number
        const orderNumber = 'RD' + Date.now().toString().slice(-6);
        orderNumberElement.textContent = `Order #${orderNumber}`;

        // Display order items
        orderItems.innerHTML = '';
        cart.forEach(item => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            subtotal += itemTotal;

            // Display variant information if available
            let variantDisplay = '';
            if (item.variant && item.variant !== 'Default') {
                variantDisplay = `<p class="order-item-variant">${item.variant}</p>`;
            }

            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="order-item-details">
                    <h3>${item.title}</h3>
                    ${variantDisplay}
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="order-item-price">
                    €${itemTotal.toFixed(2)}
                </div>
            `;
            orderItems.appendChild(itemElement);
        });

        // Display shipping details
        if (customerData) {
            shippingDetails.innerHTML = `
                <p><strong>${customerData.firstName} ${customerData.lastName}</strong></p>
                <p>${customerData.address}</p>
                ${customerData.apartment ? `<p>${customerData.apartment}</p>` : ''}
                <p>${customerData.city}, ${customerData.postalCode}</p>
                <p>${customerData.country}</p>
                <p>Email: ${customerData.email}</p>
                <p>Phone: ${customerData.phone}</p>
            `;
        }

        // Update totals
        subtotalElement.textContent = `€${subtotal.toFixed(2)}`;
        totalElement.textContent = `€${subtotal.toFixed(2)}`;

        // Add styles for variant display
        const style = document.createElement('style');
        style.textContent = `
            .order-item-variant {
                font-size: 14px;
                color: #666;
                margin: 4px 0;
            }
        `;
        document.head.appendChild(style);

        // Track successful purchase with Meta Pixel
        // Wait a moment to ensure pixel is fully loaded
        setTimeout(() => {
            console.log('🔍 Checking Meta Pixel...');
            console.log('Meta Pixel available?', !!window.metaPixel);
            console.log('trackPurchase function available?', typeof window.metaPixel?.trackPurchase);
            console.log('fbq available?', typeof fbq);
            
            if (window.metaPixel && typeof window.metaPixel.trackPurchase === 'function') {
                console.log('🎯 Tracking Purchase event with Meta Pixel...');
                window.metaPixel.trackPurchase({
                    items: cart,
                    total: subtotal,
                    orderNumber: orderNumber
                });
                console.log('✅ Purchase tracking call completed');
            } else {
                console.warn('⚠️ Meta Pixel not available - Purchase event not tracked');
                console.warn('window.metaPixel:', window.metaPixel);
                
                // Retry after another delay
                setTimeout(() => {
                    console.log('🔄 Retrying Purchase tracking...');
                    if (window.metaPixel && typeof window.metaPixel.trackPurchase === 'function') {
                        window.metaPixel.trackPurchase({
                            items: cart,
                            total: subtotal,
                            orderNumber: orderNumber
                        });
                        console.log('✅ Purchase tracked on retry');
                    } else {
                        console.error('❌ Purchase tracking failed - Pixel not loaded');
                    }
                }, 1000);
            }
        }, 500);
        
        // Clear cart and customer data after successful order display
        localStorage.removeItem('cart');
        localStorage.removeItem('customerData');
        
        console.log('✅ Order confirmation displayed successfully');
        console.log('📦 Cart and customer data cleared');
    }
});
