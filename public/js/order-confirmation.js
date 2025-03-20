document.addEventListener('DOMContentLoaded', async function() {
    const orderItems = document.getElementById('order-items');
    const shippingDetails = document.getElementById('shipping-details');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const orderNumberElement = document.getElementById('order-number');
    const confirmationContent = document.querySelector('.confirmation-content');
    const errorMessage = document.querySelector('.error-message');

    // Check if this is a valid order confirmation
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = localStorage.getItem('currentPaymentId');
    
    if (!paymentId) {
        // No payment ID found, redirect to cart
        window.location.href = '/pages/cart.html';
        return;
    }

    try {
        // Verify payment status with server
        const response = await fetch(`/api/verify-payment/${paymentId}`);
        const paymentStatus = await response.json();

        if (!paymentStatus.isPaid) {
            // Payment not successful, redirect to cart
            localStorage.removeItem('currentPaymentId');
            window.location.href = '/pages/cart.html';
            return;
        }

        // If we get here, payment was successful
        displayOrderConfirmation();
        
        // Clear payment ID after successful display
        localStorage.removeItem('currentPaymentId');
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        window.location.href = '/pages/cart.html';
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

        // Clear cart and customer data
        localStorage.removeItem('cart');
        localStorage.removeItem('customerData');
    }
});
