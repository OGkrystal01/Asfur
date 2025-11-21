// Make addToCart function globally available
window.addToCart = addToCart;

// Add item to cart
function addToCart(product) {
    if (!product || !product.handle) {
        console.error('Invalid product:', product);
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Create a unique identifier for the product variant
    const variantIdentifier = product.selectedVariant ? 
        `${product.handle}_${JSON.stringify(product.selectedVariant.options)}` : 
        product.handle;
    
    // Check if this exact variant is already in the cart
    const existingItem = cart.find(item => {
        if (item.selectedVariant && product.selectedVariant) {
            return item.handle === product.handle && 
                   JSON.stringify(item.selectedVariant.options) === JSON.stringify(product.selectedVariant.options);
        }
        return item.handle === product.handle;
    });
    
    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cart.push({
            handle: product.handle,
            title: product.title,
            price: parseFloat(product.price),
            image: product.image,
            quantity: product.quantity || 1,
            variant: product.variant || 'Default',
            selectedVariant: product.selectedVariant || null
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
    // Skip this check on checkout page and product page
    if (window.location.pathname.includes('checkout.html') || window.location.pathname.includes('product.html')) return;

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
        
        // Display variant information if available
        let variantDisplay = '';
        if (item.variant && item.variant !== 'Default') {
            variantDisplay = `<p class="cart-item__variant">${item.variant}</p>`;
        }
        
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item__image">
            <div class="cart-item__info">
                <h3 class="cart-item__title">${item.title}</h3>
                ${variantDisplay}
                <p class="cart-item__price">${formatPrice(item.price)}</p>
                <div class="cart-item__quantity">
                    <button class="quantity-btn decrease" data-handle="${item.handle}" ${item.selectedVariant ? `data-variant='${JSON.stringify(item.selectedVariant.options)}'` : ''}>-</button>
                    <input type="number" value="${item.quantity}" min="1" max="99" data-handle="${item.handle}" ${item.selectedVariant ? `data-variant='${JSON.stringify(item.selectedVariant.options)}'` : ''}>
                    <button class="quantity-btn increase" data-handle="${item.handle}" ${item.selectedVariant ? `data-variant='${JSON.stringify(item.selectedVariant.options)}'` : ''}>+</button>
                </div>
            </div>
            <button class="cart-item__remove" data-handle="${item.handle}" ${item.selectedVariant ? `data-variant='${JSON.stringify(item.selectedVariant.options)}'` : ''}>&times;</button>
        `;
        cartItems.appendChild(cartItem);
    });

    // Add event listeners for quantity controls
    const quantityInputs = cartItems.querySelectorAll('input[type="number"]');
    quantityInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const handle = e.target.dataset.handle;
            const variantData = e.target.dataset.variant;
            const quantity = parseInt(e.target.value) || 1;
            updateQuantity(handle, quantity, variantData ? JSON.parse(variantData) : null);
        });
    });

    // Add event listeners for decrease buttons
    const decreaseButtons = cartItems.querySelectorAll('.quantity-btn.decrease');
    decreaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const handle = e.target.dataset.handle;
            const variantData = e.target.dataset.variant;
            const input = e.target.parentNode.querySelector('input[type="number"]');
            const currentValue = parseInt(input.value) || 1;
            if (currentValue > 1) {
                input.value = currentValue - 1;
                updateQuantity(handle, currentValue - 1, variantData ? JSON.parse(variantData) : null);
            }
        });
    });

    // Add event listeners for increase buttons
    const increaseButtons = cartItems.querySelectorAll('.quantity-btn.increase');
    increaseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const handle = e.target.dataset.handle;
            const variantData = e.target.dataset.variant;
            const input = e.target.parentNode.querySelector('input[type="number"]');
            const currentValue = parseInt(input.value) || 1;
            if (currentValue < 99) {
                input.value = currentValue + 1;
                updateQuantity(handle, currentValue + 1, variantData ? JSON.parse(variantData) : null);
            }
        });
    });

    // Add event listeners for remove buttons
    const removeButtons = cartItems.querySelectorAll('.cart-item__remove');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const handle = e.target.dataset.handle;
            const variantData = e.target.dataset.variant;
            removeFromCart(handle, variantData ? JSON.parse(variantData) : null);
        });
    });

    updateCartTotal();
}

// Remove item from cart
function removeFromCart(handle, variantOptions = null) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (variantOptions) {
        // Remove specific variant
        cart = cart.filter(item => {
            if (item.selectedVariant && item.handle === handle) {
                return JSON.stringify(item.selectedVariant.options) !== JSON.stringify(variantOptions);
            }
            return item.handle !== handle;
        });
    } else {
        // Remove all variants of this product
        cart = cart.filter(item => item.handle !== handle);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Update item quantity
function updateQuantity(handle, quantity, variantOptions = null) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const item = cart.find(item => {
        if (variantOptions && item.selectedVariant) {
            return item.handle === handle && 
                   JSON.stringify(item.selectedVariant.options) === JSON.stringify(variantOptions);
        }
        return item.handle === handle;
    });
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(handle, variantOptions);
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

    // Display variant information if available
    let variantDisplay = '';
    if (product.variant && product.variant !== 'Default') {
        variantDisplay = `<p class="cart-notification__variant">${product.variant}</p>`;
    }

    notification.innerHTML = `
        <div class="cart-notification__content">
            <button class="cart-notification__close">&times;</button>
            <div class="cart-notification__header">
                <i class="fas fa-check-circle cart-notification__icon"></i>
                Zum Warenkorb hinzugefügt!
            </div>
            <div class="cart-notification__product">
                <img id="cart-notification-image" src="${product.image}" alt="${product.title}">
                <div class="cart-notification__product-info">
                    <h3 id="cart-notification-title" class="cart-notification__product-title">${product.title}</h3>
                    ${variantDisplay}
                    <p id="cart-notification-price" class="cart-notification__product-price">${formatPrice(product.price)}</p>
                </div>
            </div>
            <div class="cart-notification__buttons">
                <button class="button button--outline cart-continue-btn">Weiter einkaufen</button>
                <button class="button button--primary cart-checkout-btn">Zur Kasse</button>
            </div>
        </div>
    `;

    // Show notification
    notification.classList.add('visible');
    
    // Add event listeners immediately after DOM update
    requestAnimationFrame(() => {
        const continueBtn = notification.querySelector('.cart-continue-btn');
        const checkoutBtn = notification.querySelector('.cart-checkout-btn');
        const closeBtn = notification.querySelector('.cart-notification__close');
        
        if (continueBtn) {
            continueBtn.style.pointerEvents = 'auto';
            continueBtn.style.cursor = 'pointer';
            continueBtn.style.touchAction = 'manipulation';
            
            // Add both click and touchend for mobile
            const goToProducts = (e) => {
                e.preventDefault();
                e.stopPropagation();
                notification.classList.remove('visible');
                setTimeout(() => {
                    window.location.href = '/pages/products.html';
                }, 100);
            };
            
            continueBtn.addEventListener('click', goToProducts);
            continueBtn.addEventListener('touchend', goToProducts);
        }
        
        if (checkoutBtn) {
            checkoutBtn.style.pointerEvents = 'auto';
            checkoutBtn.style.cursor = 'pointer';
            checkoutBtn.style.touchAction = 'manipulation';
            
            // Add both click and touchend for mobile
            const goToCheckout = (e) => {
                e.preventDefault();
                e.stopPropagation();
                notification.classList.remove('visible');
                setTimeout(() => {
                    window.location.href = '/pages/checkout.html';
                }, 100);
            };
            
            checkoutBtn.addEventListener('click', goToCheckout);
            checkoutBtn.addEventListener('touchend', goToCheckout);
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                notification.classList.remove('visible');
            });
        }
    });

    // Close notification after 8 seconds
    setTimeout(() => {
        notification.classList.remove('visible');
    }, 8000);
}

// Format price
function formatPrice(price) {
    return `€${parseFloat(price).toFixed(2)}`;
}

// Reset checkout button state
function resetCheckoutButton(button) {
    if (button) {
        button.disabled = false;
        button.textContent = 'Proceed to Checkout';
        button.style.backgroundColor = '#000000';
    }
}

// Initialize cart UI on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    // Initialize checkout button (cart and other pages only, not product page)
    const checkoutButton = document.getElementById('checkout-button');
    const isProductPage = window.location.pathname.includes('product.html');
    if (checkoutButton && !isProductPage) {
        checkoutButton.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];

            if (cart.length === 0) {
                alert('Your cart is empty. Please add items to your cart before checkout.');
                return;
            }

            // Show loading state
            checkoutButton.disabled = true;
            checkoutButton.textContent = 'Processing...';
            checkoutButton.style.backgroundColor = '#333333';

            // Redirect to checkout page
            window.location.href = '/pages/checkout.html';
        });
    }

    // Initialize cart notification
    if (!document.querySelector('.cart-notification')) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        document.body.appendChild(notification);
    }

    // Initialize empty cart message
    const emptyCartElement = document.getElementById('empty-cart');
    if (emptyCartElement) {
        const continueShoppingButton = emptyCartElement.querySelector('.continue-shopping');
        if (continueShoppingButton) {
            continueShoppingButton.addEventListener('click', () => {
                window.location.href = '/index.html';
            });
        }
    }

    // Style cart buttons with black theme
    const cartButtons = document.querySelectorAll('.cart-button');
    cartButtons.forEach(button => {
        button.style.backgroundColor = '#000000';
        button.style.color = '#ffffff';
        button.style.border = 'none';
        button.style.padding = '10px 20px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.3s ease';
        
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#333333';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#000000';
        });
    });
});
