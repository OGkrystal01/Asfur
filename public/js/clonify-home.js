// Clonify-style homepage functionality
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts();
    updateCartCount();
    // Initialize carousels after products are loaded
    setTimeout(() => {
        initBestsellersCarousel();
        initCategoryCarousel();
    }, 100);
    // Initialize collapsible FAQ sections
    initCollapsibles();
});

// Initialize collapsible sections - Exact copy from product.js
function initCollapsibles() {
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            const content = button.nextElementSibling;
            
            if (content && content.classList.contains('content')) {
                if (content.classList.contains('active')) {
                    content.classList.remove('active');
                } else {
                    content.classList.add('active');
                }
            }
        });
    });
}

// Load featured products into horizontal scroll
function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    const allProducts = (typeof window !== 'undefined' && window.shopifyProducts) ? window.shopifyProducts : (typeof products !== 'undefined' ? products : []);

    // Bestseller selection prioritizing designer bags
    const priorityGroups = [
        // 1) LV Nano Speedy - BESTSELLER
        p => p.handle === 'louis-vuitton-nano-speedy',
        // 2) Hermès bags (Birkin, Kelly)
        p => titleIncludesHome(p, ['hermès', 'hermes', 'birkin', 'kelly']),
        // 3) Other Louis Vuitton bags
        p => titleIncludesHome(p, ['louis vuitton', 'lv', 'neverfull']) && p.handle !== 'louis-vuitton-nano-speedy',
        // 4) Chanel bags
        p => titleIncludesHome(p, ['chanel', 'classic flap', '2.55']),
        // 5) Gucci bags
        p => titleIncludesHome(p, ['gucci', 'marmont', 'dionysus']),
        // 6) Dior bags
        p => titleIncludesHome(p, ['dior', 'lady dior', 'saddle']),
        // 7) All other bags
        p => titleIncludesHome(p, ['bag', 'handbag', 'purse', 'tote', 'shoulder bag', 'crossbody'])
    ];

    const usedHandles = new Set();
    const ordered = [];

    for (const matches of priorityGroups) {
        allProducts.forEach(product => {
            if (usedHandles.has(product.handle)) return;
            if (matches(product)) {
                ordered.push(product);
                usedHandles.add(product.handle);
            }
        });
    }

    const featuredProducts = ordered.slice(0, 12);

    featuredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

function titleIncludesHome(product, keywords) {
    const title = (product.title || '').toLowerCase();
    const handle = (product.handle || '').toLowerCase();
    return keywords.some(keyword => {
        const k = keyword.toLowerCase();
        return title.includes(k) || handle.includes(k);
    });
}

// Create product card for grid layout
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card-scroll';

    // Get product image
    const imageUrl = product.image && product.image.src 
        ? product.image.src 
        : '/images/logo/Logo.png';

    // Get price (use first variant price)
    const price = product.variants && product.variants.length > 0 
        ? product.variants[0].price 
        : 0;

    const comparePrice = product.variants && product.variants.length > 0 
        ? product.variants[0].compare_at_price 
        : null;

    // Get rating
    const rating = product.rating_count || 0;
    const ratingStars = Math.min(5, Math.round(rating / 20));

    card.innerHTML = `
        <a href="/pages/product.html?handle=${product.handle}" style="text-decoration: none; color: inherit;">
            <img src="${imageUrl}" alt="${product.title}" loading="lazy">
            <div class="product-card-scroll__content">
                <h3 class="product-card-scroll__title">${product.title}</h3>
                <div class="product-card-scroll__rating">
                    <div class="star-rating">
                        ${Array(5).fill().map((_, i) => `<span class="star ${i < ratingStars ? 'filled' : ''}">★</span>`).join('')}
                    </div>
                    <span class="rating-count">(${rating})</span>
                </div>
                <div class="product-card-scroll__price">
                    ${comparePrice ? `<span class="compare-at-price">€${comparePrice.toFixed(2)}</span>` : ''}
                    <span>€${price.toFixed(2)}</span>
                </div>
            </div>
        </a>
    `;

    return card;
}

// Initialize Bestsellers scroll controls
function initBestsellersCarousel() {
    const container = document.getElementById('featured-products');
    const prevBtn = document.getElementById('bestsellers-prev');
    const nextBtn = document.getElementById('bestsellers-next');
    const counter = document.getElementById('bestsellers-counter');
    if (!container || !prevBtn || !nextBtn || !counter) return;

    function scrollByStep(direction) {
        const step = container.clientWidth * 0.7; // show ~1.5 cards
        const maxScroll = container.scrollWidth - container.clientWidth;
        const current = container.scrollLeft;
        let target = direction === 'next' ? current + step : current - step;
        if (target < 0) target = 0;
        if (target > maxScroll) target = maxScroll;
        container.scrollTo({ left: target, behavior: 'smooth' });
    }

    function updateCounter() {
        const cards = container.querySelectorAll('.product-card-scroll');
        const totalProducts = cards.length;
        
        if (totalProducts === 0) {
            counter.textContent = '0/0';
            return;
        }
        
        // Find which product is most visible in the viewport
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        
        let closestCard = 1;
        let closestDistance = Infinity;
        
        cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(cardCenter - containerCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestCard = index + 1;
            }
        });
        
        counter.textContent = `${closestCard}/${totalProducts}`;
    }

    function updateButtons() {
        const maxScroll = container.scrollWidth - container.clientWidth - 1; // small tolerance
        const atStart = container.scrollLeft <= 0;
        const atEnd = container.scrollLeft >= maxScroll;

        prevBtn.classList.toggle('disabled', atStart);
        nextBtn.classList.toggle('disabled', atEnd);
        
        updateCounter();
    }

    prevBtn.addEventListener('click', () => {
        scrollByStep('prev');
    });
    nextBtn.addEventListener('click', () => {
        scrollByStep('next');
    });

    container.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);

    // Initial state
    updateButtons();
}

// Initialize category cards scroll controls
function initCategoryCarousel() {
    const container = document.getElementById('category-cards-track');
    const prevBtn = document.getElementById('category-prev');
    const nextBtn = document.getElementById('category-next');
    if (!container || !prevBtn || !nextBtn) return;

    function scrollByStep(direction) {
        const step = container.clientWidth * 0.7; // ~1.5 cards
        const maxScroll = container.scrollWidth - container.clientWidth;
        const current = container.scrollLeft;
        let target = direction === 'next' ? current + step : current - step;
        if (target < 0) target = 0;
        if (target > maxScroll) target = maxScroll;
        container.scrollTo({ left: target, behavior: 'smooth' });
    }

    function updateButtons() {
        const maxScroll = container.scrollWidth - container.clientWidth - 1;
        const atStart = container.scrollLeft <= 0;
        const atEnd = container.scrollLeft >= maxScroll;

        prevBtn.classList.toggle('disabled', atStart);
        nextBtn.classList.toggle('disabled', atEnd);
    }

    prevBtn.addEventListener('click', () => {
        scrollByStep('prev');
    });
    nextBtn.addEventListener('click', () => {
        scrollByStep('next');
    });

    container.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);

    updateButtons();
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count, #mobile-cart-count');
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
        }
    });
}

// Update cart count when cart changes
window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
        updateCartCount();
    }
});
