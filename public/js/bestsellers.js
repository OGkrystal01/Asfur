// Load bestsellers
window.addEventListener('DOMContentLoaded', () => {
    const products = window.shopifyProducts || [];
    const bestsellers = products
        .filter(product => !product.title.toLowerCase().includes('bundle'))
        .sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0))
        .slice(0, 12);
    displayBestsellers(bestsellers);
});

function displayBestsellers(products) {
    const container = document.getElementById('bestsellers-container');
    if (!container) return;

    container.innerHTML = products.map(product => {
        return `
            <div class="bestseller-card">
                <a href="/pages/product.html?handle=${product.handle}" class="bestseller-card__link">
                    <div class="bestseller-card__image">
                        <img src="${product.image.src}" alt="${product.title}">
                    </div>
                    <div class="bestseller-card__content">
                        <h3 class="bestseller-card__title">${product.title}</h3>
                        <p class="bestseller-card__price">€${formatPrice(product.variants[0].price)}</p>
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
            card.classList.add('tapped');
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        });
    });

    // Setup carousel controls
    const prevButton = container.closest('.bestsellers').querySelector('.carousel-control.prev');
    const nextButton = container.closest('.bestsellers').querySelector('.carousel-control.next');

    prevButton?.addEventListener('click', () => {
        container.scrollBy({ left: -300, behavior: 'smooth' });
    });

    nextButton?.addEventListener('click', () => {
        container.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

// Format price to currency
function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(price).replace('€', '') + '€';
}
