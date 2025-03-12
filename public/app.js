// Initialize store state
let products = [];
let cart = [];

// Load products from CSV
async function loadProducts() {
    const response = await fetch('/api/products');
    products = await response.json();
    renderProducts();
}

// Render products with Shopify-like styling
function renderProducts() {
    const productsGrid = document.getElementById('products');
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.handle}">
            <div class="product-card__image-container">
                <img src="${product.image}" alt="${product.title}" class="product-image">
                ${product.compareAtPrice ? `
                    <span class="product-card__badge">
                        Sale
                    </span>
                ` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price${product.compareAtPrice ? ' product-price--on-sale' : ''}">
                    <span class="price-item price-item--regular">
                        €${product.price.toFixed(2)}
                    </span>
                    ${product.compareAtPrice ? `
                        <span class="price-item price-item--compare">
                            €${product.compareAtPrice.toFixed(2)}
                        </span>
                    ` : ''}
                </div>
                ${product.options && product.options[0] ? 
                    renderProductOptions(product) :
                    `<button class="button" onclick="addToCart('${product.handle}')">
                        Add to Cart
                    </button>`
                }
            </div>
        </div>
    `).join('');
}

// Render product options (size, color, etc.)
function renderProductOptions(product) {
    const option = product.options[0];
    return `
        <div class="product-options">
            <label class="option-label">${option.name}:</label>
            <div class="option-buttons">
                ${option.values.map(value => `
                    <button class="option-button" 
                            onclick="selectOption('${product.handle}', '${value}')"
                            data-value="${value}">
                        ${value}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Handle option selection
function selectOption(productHandle, value) {
    const product = products.find(p => p.handle === productHandle);
    const variant = product.variants.find(v => v.option1 === value);
    if (variant && variant.available) {
        addToCart(productHandle, variant);
    }
}

// Cart functions
function addToCart(productHandle, variant = null) {
    const product = products.find(p => p.handle === productHandle);
    if (!product) return;

    const cartItem = {
        handle: product.handle,
        title: product.title,
        price: variant ? variant.price : product.price,
        image: product.image,
        quantity: 1,
        variant: variant
    };

    cart.push(cartItem);
    updateCart();
    showCartNotification();
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    cartCount.textContent = cart.length;
    
    if (cartItems) {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item__image">
                <div class="cart-item__details">
                    <h4>${item.title}</h4>
                    ${item.variant ? `<p class="cart-item__variant">${item.variant.option1}</p>` : ''}
                    <p class="cart-item__price">€${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item__quantity">
                    <button onclick="updateItemQuantity('${item.handle}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateItemQuantity('${item.handle}', ${item.quantity + 1})">+</button>
                </div>
                <button class="cart-item__remove" onclick="removeFromCart('${item.handle}')">×</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `€${total.toFixed(2)}`;
    }
}

// Payment processing with Mollie
async function processPayment() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: total,
                currency: 'EUR',
                description: 'Order from Resell Depot',
                items: cart.map(item => ({
                    handle: item.handle,
                    quantity: item.quantity,
                    variant: item.variant ? item.variant.option1 : null
                })),
                redirectUrl: `${window.location.origin}/payment-complete`,
                webhookUrl: `${window.location.origin}/api/webhooks/mollie`
            }),
        });

        const { paymentUrl } = await response.json();
        window.location.href = paymentUrl;
    } catch (error) {
        console.error('Payment failed:', error);
        showError('Payment processing failed. Please try again.');
    }
}

// Show cart notification
function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="cart-notification__content">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <p>Item added to cart</p>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// DOM Elements
const productsGrid = document.getElementById('products');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');

// Event listeners
function setupEventListeners() {
    // Cart toggle
    document.querySelector('.cart-icon').addEventListener('click', () => {
        cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Checkout button click event
    checkoutButton.addEventListener('click', () => {
        console.log('Checkout button clicked'); // Log button click
        if (cart.length > 0) {
            console.log('Cart contents:', cart); // Log cart contents
            processPayment();
        } else {
            showError('Your cart is empty.');
        }
    });
}

// Initialize Mollie
const mollie = Mollie(process.env.MOLLIE_API_KEY);
