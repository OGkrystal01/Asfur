// Make addToCart function globally available
window.addToCart = addToCart;

// Add item to cart
function addToCart(product) {
    if (!product || !product.handle) {
        console.error('Invalid product:', product);
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.handle === product.handle);
    
    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cart.push({
            handle: product.handle,
            title: product.title,
            price: parseFloat(product.price),
            image: product.image,
            quantity: product.quantity || 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    if (!product.skipNotification) {
        showCartNotification(product);
    }
}

// Update cart UI elements
function updateCartUI() {
    updateCartCount();
    updateCartDisplay();
    updateEmptyCartState();
    updateCartTotal();
}

// Update cart count in the UI
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElements.forEach(element => {
        element.textContent = totalItems.toString();
    });
}

// Update empty cart state
function updateEmptyCartState() {
    // Skip this check on checkout page
    if (window.location.pathname.includes('checkout.html')) return;

    const cartContainer = document.querySelector('#cart-container');
    const emptyCart = document.querySelector('#empty-cart');
    if (!cartContainer || !emptyCart) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        cartContainer.style.display = 'none';
        emptyCart.style.display = 'flex';
    } else {
        cartContainer.style.display = 'block';
        emptyCart.style.display = 'none';
    }
}

// Update cart total
function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    
    // Update subtotal
    const subtotalElements = document.querySelectorAll('.cart-subtotal');
    subtotalElements.forEach(element => {
        element.textContent = formatPrice(subtotal);
    });

    // Update total (same as subtotal since shipping is free)
    const totalElements = document.querySelectorAll('.cart-total');
    totalElements.forEach(element => {
        element.textContent = formatPrice(subtotal);
    });
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItems.innerHTML = '';

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item__image">
            <div class="cart-item__info">
                <h3 class="cart-item__title">${item.title}</h3>
                <p class="cart-item__price">${formatPrice(item.price)}</p>
                <div class="cart-item__quantity">
                    <button class="quantity-btn decrease" data-handle="${item.handle}">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="99" data-handle="${item.handle}">
                    <button class="quantity-btn increase" data-handle="${item.handle}">+</button>
                </div>
            </div>
            <button class="cart-item__remove" data-handle="${item.handle}">&times;</button>
        `;
        cartItems.appendChild(cartItem);
    });

    // Add event listeners for quantity controls
    const quantityInputs = cartItems.querySelectorAll('input[type="number"]');
    quantityInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const handle = e.target.dataset.handle;
            const quantity = parseInt(e.target.value) || 1;
            updateQuantity(handle, quantity);
        });
    });

    // Add event listeners for remove buttons
    const removeButtons = cartItems.querySelectorAll('.cart-item__remove');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const handle = e.target.dataset.handle;
            removeFromCart(handle);
        });
    });

    updateCartTotal();
}

// Remove item from cart
function removeFromCart(handle) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.handle !== handle);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Update item quantity
function updateQuantity(handle, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.handle === handle);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(handle);
        } else {
            item.quantity = Math.min(99, Math.max(1, quantity));
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
        }
    }
}

// Show cart notification
function showCartNotification(product) {
    const notification = document.querySelector('.cart-notification');
    if (!notification) return;

    notification.innerHTML = `
        <div class="cart-notification__content">
            <button class="cart-notification__close">&times;</button>
            <div class="cart-notification__header">
                <i class="fas fa-check-circle cart-notification__icon"></i>
                Added to Cart!
            </div>
            <div class="cart-notification__product">
                <img id="cart-notification-image" src="${product.image}" alt="${product.title}">
                <div class="cart-notification__product-info">
                    <h3 id="cart-notification-title" class="cart-notification__product-title">${product.title}</h3>
                    <p id="cart-notification-price" class="cart-notification__product-price">${formatPrice(product.price)}</p>
                </div>
            </div>
            <div class="cart-notification__buttons">
                <a href="/pages/cart.html" class="button button--outline">View Cart</a>
                <a href="/pages/checkout.html" class="button button--primary">Checkout</a>
            </div>
        </div>
    `;

    notification.classList.add('visible');

    // Close notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('visible');
    }, 3000);

    // Close on any close button click
    const closeButtons = notification.querySelectorAll('.cart-notification__close');
    closeButtons.forEach(button => {
        button.onclick = () => notification.classList.remove('visible');
    });
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

// Initialize cart UI on page load
// Reset checkout button state
function resetCheckoutButton(button) {
    button.disabled = false;
    button.textContent = 'Proceed to Checkout';
    button.style.backgroundColor = '#000000';
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    // Initialize checkout button
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        // Reset button state on page load
        resetCheckoutButton(checkoutButton);

        // Handle visibility change to detect when user returns from payment page
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                resetCheckoutButton(checkoutButton);
            }
        });

        checkoutButton.addEventListener('click', async () => {
            try {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                if (cart.length === 0) {
                    alert('Your cart is empty');
                    return;
                }

                // Show loading state
                checkoutButton.disabled = true;
                checkoutButton.textContent = 'Processing...';
                checkoutButton.style.backgroundColor = '#333333';

                // Create Mollie payment
                const response = await fetch('/api/create-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cartItems: cart
                    })
                });

                if (!response.ok) {
                    throw new Error('Payment creation failed');
                }

                const { checkoutUrl } = await response.json();
                
                // Redirect to Mollie checkout
                window.location.href = checkoutUrl;

            } catch (error) {
                console.error('Checkout error:', error);
                
                // Show a more user-friendly error message
                const errorMessage = error.message === 'Payment creation failed' 
                    ? 'Payment processing failed. Please try again or contact support.'
                    : 'Checkout was canceled. You can try again when ready.';
                
                // Create a notification div if it doesn't exist
                let notification = document.querySelector('.checkout-notification');
                if (!notification) {
                    notification = document.createElement('div');
                    notification.className = 'checkout-notification';
                    document.querySelector('.cart-summary').prepend(notification);
                }
                
                // Show the error message
                notification.innerHTML = `
                    <div class="notification-content error">
                        <i class="fas fa-exclamation-circle"></i>
                        ${errorMessage}
                    </div>
                `;
                
                // Remove the notification after 5 seconds
                setTimeout(() => {
                    notification.remove();
                }, 5000);
                
                // Reset button state
                resetCheckoutButton(checkoutButton);
            }
        });

        // Style checkout button
        checkoutButton.style.backgroundColor = '#000000';
        checkoutButton.style.color = '#ffffff';
        checkoutButton.style.border = 'none';
        checkoutButton.style.width = '100%';
        checkoutButton.style.padding = '15px';
        checkoutButton.style.fontSize = '16px';
        checkoutButton.style.fontWeight = 'bold';
        checkoutButton.style.cursor = 'pointer';
        checkoutButton.style.transition = 'all 0.3s ease';
        
        checkoutButton.addEventListener('mouseover', () => {
            checkoutButton.style.backgroundColor = '#333333';
        });
        
        checkoutButton.addEventListener('mouseout', () => {
            checkoutButton.style.backgroundColor = '#000000';
        });
    }
});
