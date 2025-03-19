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
        return `
            <div class="bestseller-card">
                <a href="/pages/product.html?handle=${product.handle}" class="bestseller-card__link">
                    <div class="bestseller-card__image">
                        <img src="${product.image}" alt="${product.title}" loading="lazy">
                    </div>
                    <div class="bestseller-card__content">
                        <h3 class="bestseller-card__title">${product.title}</h3>
                        <div class="bestseller-card__price">
                            <span class="price">€${product.price}</span>
                            ${product.compareAtPrice ? `<span class="compare-price">€${product.compareAtPrice}</span>` : ''}
                        </div>
                    </div>
                </a>
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
    const prevButton = document.querySelector('.bestsellers .carousel-control.prev');
    const nextButton = document.querySelector('.bestsellers .carousel-control.next');

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        });

        nextButton.addEventListener('click', () => {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        });
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
