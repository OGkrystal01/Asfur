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

    // Add touch event listeners for mobile scrolling
    let startX;
    let startScrollLeft;
    let isDragging = false;
    let startTime;
    let startY;
    let isScrolling;

    function handleTouchStart(e) {
        isDragging = true;
        isScrolling = undefined;
        startX = e.touches[0].pageX;
        startY = e.touches[0].pageY;
        startScrollLeft = container.scrollLeft;
        startTime = Date.now();

        // Prevent any default touch behaviors
        const cards = container.querySelectorAll('.bestseller-card__link');
        cards.forEach(card => card.style.pointerEvents = 'none');
    }

    function handleTouchMove(e) {
        if (!isDragging) return;

        const x = e.touches[0].pageX;
        const y = e.touches[0].pageY;
        const deltaX = startX - x;
        const deltaY = startY - y;

        // Determine if scrolling horizontally or vertically
        if (isScrolling === undefined) {
            isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
        }

        // If scrolling horizontally, prevent default behavior
        if (!isScrolling) {
            e.preventDefault();
            container.scrollLeft = startScrollLeft + deltaX;
        }
    }

    function handleTouchEnd(e) {
        isDragging = false;
        const cards = container.querySelectorAll('.bestseller-card__link');

        // If this was a quick tap without much movement, treat it as a click
        const endTime = Date.now();
        const timeDiff = endTime - startTime;
        const endX = e.changedTouches[0].pageX;
        const moveDistance = Math.abs(endX - startX);

        if (timeDiff < 300 && moveDistance < 10) {
            // Find the clicked product card
            let target = e.target;
            while (target && !target.classList.contains('bestseller-card')) {
                target = target.parentElement;
            }
            
            if (target) {
                const link = target.querySelector('.bestseller-card__link');
                if (link) {
                    window.location.href = link.href;
                }
            }
        }

        // Re-enable pointer events after a small delay
        setTimeout(() => {
            cards.forEach(card => card.style.pointerEvents = 'auto');
        }, 100);
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Update mobile state on resize
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 1024;
    });

    // Handle desktop arrow navigation
    const section = container.closest('.bestsellers');
    const prevButton = section.querySelector('.carousel-control.prev');
    const nextButton = section.querySelector('.carousel-control.next');
    
    if (prevButton && nextButton) {
        const scrollAmount = 300;

        prevButton.addEventListener('click', () => {
            const targetScroll = container.scrollLeft - scrollAmount;
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        });

        nextButton.addEventListener('click', () => {
            const targetScroll = container.scrollLeft + scrollAmount;
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        });

        // Show/hide arrows based on screen size
        const updateArrowVisibility = () => {
            const isMobile = window.innerWidth <= 768;
            prevButton.style.display = isMobile ? 'none' : 'flex';
            nextButton.style.display = isMobile ? 'none' : 'flex';
        };

        // Update on load and resize
        updateArrowVisibility();
        window.addEventListener('resize', updateArrowVisibility);
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
