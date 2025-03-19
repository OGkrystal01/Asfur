document.addEventListener('DOMContentLoaded', () => {
    loadBestsellers();
});

async function loadBestsellers() {
    try {
        const products = window.shopifyProducts || [];
        const bestsellers = products
            .filter(product => !product.title.toLowerCase().includes('bundle'))
            .sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0))
            .slice(0, 12);
        displayBestsellers(bestsellers);
    } catch (error) {
        console.error('Error loading bestsellers:', error);
    }
}

function displayBestsellers(products) {
    const container = document.getElementById('bestsellers-container');
    if (!container) return;

    container.innerHTML = products.map(product => {
        const variant = product.variants[0];
        const price = formatPrice(variant.price);
        const compareAtPrice = variant.compare_at_price ? formatPrice(variant.compare_at_price) : null;
        const hasDiscount = variant.compare_at_price && variant.compare_at_price > variant.price;
        const rating = product.rating_count ? product.rating_count : 0;
        const ratingStars = Math.round(rating / 5 * 5);
        
        return `
            <div class="bestseller-card">
                <div class="bestseller-card__content">
                    <a href="/pages/product.html?handle=${encodeURIComponent(product.handle)}" class="bestseller-card__link">
                        <div class="bestseller-card__image">
                            ${hasDiscount ? '<span class="sale-badge">Sale</span>' : ''}
                            <img src="${product.image.src}" alt="${product.title}" loading="lazy">
                        </div>
                        <div class="bestseller-card__info">
                            <h3 class="bestseller-card__title">${product.title}</h3>
                            <div class="bestseller-card__rating">
                                <div class="star-rating">
                                    ${Array(5).fill().map((_, i) => `<span class="star ${i < ratingStars ? 'filled' : ''}">${i < ratingStars ? '★' : '☆'}</span>`).join('')}
                                </div>
                                <span class="bestseller-card__rating-count">(${rating})</span>
                            </div>
                            <div class="bestseller-card__price">
                                ${compareAtPrice ? `<span class="compare-at-price">${compareAtPrice}</span>` : ''}
                                <span class="price">${price}</span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }).join('');

    // Handle card clicks with animation
    const cards = container.getElementsByClassName('bestseller-card');
    Array.from(cards).forEach(card => {
        const link = card.querySelector('.bestseller-card__link');
        if (!link) return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.href;
            
            // Add tapped class for animation
            card.classList.add('tapped');
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        });
    });

    // Handle desktop arrow navigation
    const section = document.querySelector('.bestsellers');
    const prevButton = section.querySelector('.carousel-control.prev');
    const nextButton = section.querySelector('.carousel-control.next');
    const carouselContainer = container;

    if (prevButton && nextButton && carouselContainer) {
        const scrollAmount = 300;

        prevButton.onclick = () => {
            carouselContainer.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        };

        nextButton.onclick = () => {
            carouselContainer.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        };
    }
}

// Format price to currency
function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(price).replace('€', '') + '€';
}
