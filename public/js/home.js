document.addEventListener('DOMContentLoaded', async () => {
    // Load featured products
    const response = await fetch('/api/products');
    const products = await response.json();
    
    // Display only the first 4 products as featured
    const featuredProducts = products.slice(0, 4);
    displayFeaturedProducts(featuredProducts);

    // Initialize hero slider
    initHeroSlider();

    // Initialize newsletter form
    initNewsletterForm();
});

function displayFeaturedProducts(products) {
    const productsGrid = document.getElementById('featured-products');
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('a');
    card.className = 'product-card';
    card.href = `/pages/product.html?handle=${product.handle}`;

    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

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
            ${product.options.length > 0 ? `<div class="product-card__variants">${product.options[0].values.join(', ')}</div>` : ''}
        </div>
    `;

    return card;
}

function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Change slide every 5 seconds
    if (slides.length > 1) {
        setInterval(nextSlide, 5000);
    }
}

function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            
            // Here you would typically send this to your backend
            // For now, just show a success message
            alert('Thanks for subscribing! You will receive our newsletter soon.');
            form.reset();
        });
    }
}
