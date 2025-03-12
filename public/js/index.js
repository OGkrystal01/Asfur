// Format price in EUR
function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Create a product card
function createProductCard(product) {
    const card = document.createElement('a');
    card.href = `/pages/product.html?id=${encodeURIComponent(product.id)}`;
    card.className = 'product-card';
    
    const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
    
    card.innerHTML = `
        <div class="product-card__image">
            <img src="${product.image}" alt="${product.title}" loading="lazy">
            ${hasDiscount ? '<span class="sale-badge">Sale</span>' : ''}
        </div>
        <div class="product-card__info">
            <h3 class="product-card__title">${product.title}</h3>
            <div class="product-card__price">
                <span class="price">${formatPrice(product.price)}</span>
                ${hasDiscount ? `<span class="compare-at-price">${formatPrice(product.compareAtPrice)}</span>` : ''}
            </div>
            ${product.options && product.options.length > 0 ? 
                `<div class="product-card__variants">${product.options[0].values.join(' / ')}</div>` 
                : ''}
        </div>
    `;
    
    // Add click event listener
    card.addEventListener('click', (e) => {
        window.location.href = card.href;
    });
    
    return card;
}

// Load featured products
async function loadFeaturedProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        // Get the first 4 products as featured
        const featuredProducts = products.slice(0, 4);
        
        const featuredGrid = document.getElementById('featured-products');
        if (featuredGrid) {
            featuredGrid.innerHTML = '';
            featuredProducts.forEach(product => {
                const card = createProductCard(product);
                featuredGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Handle newsletter form submission
function setupNewsletterForm() {
    const form = document.querySelector('.newsletter__form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            // Here you would typically send this to your backend
            alert('Vielen Dank für Ihre Anmeldung!');
            form.reset();
        });
    }
}

// Checkout button functionality
function setupCheckoutButton() {
    const checkoutButton = document.getElementById('checkout-button');

    if (checkoutButton) {
        checkoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        items: window.cartItems // Assuming you have a global cartItems variable
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to create checkout session');
                }

                const session = await response.json();
                window.location.href = session.checkoutUrl; // Redirect to the Mollie checkout page
            } catch (error) {
                console.error('Error during checkout:', error);
                // Optionally, show an error message to the user
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    setupNewsletterForm();
    setupCheckoutButton();
});
