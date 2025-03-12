document.addEventListener('DOMContentLoaded', function() {
    const orderItems = document.getElementById('order-items');
    const shippingDetails = document.getElementById('shipping-details');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const orderNumberElement = document.getElementById('order-number');

    // Generate a random order number (in production this should come from your backend)
    const orderNumber = 'RD' + Date.now().toString().slice(-6);
    orderNumberElement.textContent = `Order #${orderNumber}`;

    // Load cart items and customer data from localStorage
    function displayOrderConfirmation() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const customerData = JSON.parse(localStorage.getItem('customerData')) || {};
        let subtotal = 0;

        // Display order items
        orderItems.innerHTML = '';
        cart.forEach(item => {
            const product = window.products.find(p => p.id === item.id);
            if (product) {
                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;

                const itemElement = document.createElement('div');
                itemElement.className = 'order-item';
                itemElement.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="order-item-details">
                        <h3>${product.name}</h3>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    <div class="order-item-price">
                        €${itemTotal.toFixed(2)}
                    </div>
                `;
                orderItems.appendChild(itemElement);
            }
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

        // Clear cart and customer data
        localStorage.removeItem('cart');
        localStorage.removeItem('customerData');
    }

    displayOrderConfirmation();
});
