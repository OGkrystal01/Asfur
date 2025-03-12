// Reviews data handling
let reviews = [];
let productRatings = {};
const REVIEWS_PER_PAGE = 5;
let currentPage = 1;

// Parse CSV data
async function loadReviews() {
    try {
        const response = await fetch('/api/reviews');
        reviews = await response.json();
        
        // Calculate product ratings
        productRatings = reviews.reduce((acc, review) => {
            const handle = review.product_handle;
            if (!acc[handle]) {
                acc[handle] = {
                    total: 0,
                    count: 0,
                    average: 0,
                    distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
                };
            }
            acc[handle].total += parseInt(review.rating);
            acc[handle].count++;
            acc[handle].distribution[review.rating]++;
            acc[handle].average = (acc[handle].total / acc[handle].count).toFixed(1);
            return acc;
        }, {});

        // Update UI after loading reviews
        updateProductCards();
        updateProductPage();
        addReviewsCarousel();
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Format date to "Month DD, YYYY"
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Generate star rating HTML
function generateStarRating(rating, size = 'regular') {
    const fullStar = '★';
    const emptyStar = '☆';
    const starClass = size === 'large' ? 'star-rating--large' : 'star-rating';
    
    return `<div class="${starClass}" title="${rating} out of 5 stars">
        ${Array(5).fill('').map((_, i) => 
            `<span class="star ${i < rating ? 'filled' : ''}">${i < rating ? fullStar : emptyStar}</span>`
        ).join('')}
    </div>`;
}

// Get reviews for a specific product
function getProductReviews(productHandle) {
    return reviews.filter(review => review.product_handle === productHandle);
}

// Get average rating for a product
function getProductRating(productHandle) {
    return productRatings[productHandle];
}

// Generate pagination HTML
function generatePagination(totalReviews) {
    const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);
    if (totalPages <= 1) return '';

    let paginationHtml = '<div class="reviews-pagination">';
    
    // Previous button
    paginationHtml += `
        <button class="pagination-btn prev ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHtml += `
                <button class="pagination-btn number ${i === currentPage ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHtml += '<span class="pagination-ellipsis">...</span>';
        }
    }

    // Next button
    paginationHtml += `
        <button class="pagination-btn next ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>`;

    paginationHtml += '</div>';
    return paginationHtml;
}

// Change page and update reviews display
function changePage(newPage) {
    const urlParams = new URLSearchParams(window.location.search);
    const productHandle = urlParams.get('handle');
    if (!productHandle) return;

    const productReviews = getProductReviews(productHandle);
    const totalPages = Math.ceil(productReviews.length / REVIEWS_PER_PAGE);
    
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPage = newPage;
    updateReviewsList(productReviews);
    
    // Scroll to top of reviews section smoothly
    document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' });
}

// Update reviews list with pagination
function updateReviewsList(productReviews) {
    const startIdx = (currentPage - 1) * REVIEWS_PER_PAGE;
    const endIdx = startIdx + REVIEWS_PER_PAGE;
    const reviewsToShow = productReviews.slice(startIdx, endIdx);

    const reviewsList = document.querySelector('.reviews-section__list');
    if (!reviewsList) return;

    reviewsList.innerHTML = `
        ${reviewsToShow.map(review => `
            <div class="review-card">
                <div class="review-card__header">
                    ${generateStarRating(parseInt(review.rating))}
                    <span class="review-card__author">${review.reviewer_name}</span>
                    <span class="review-card__date">${formatDate(review.review_date)}</span>
                </div>
                <div class="review-card__body">
                    <p>${review.body}</p>
                </div>
                ${review.picture_urls ? `
                    <div class="review-card__images">
                        ${review.picture_urls.split(',').map(url => `
                            <img src="${url.trim()}" alt="Review image" loading="lazy">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('')}
        ${generatePagination(productReviews.length)}
    `;
}

// Update all product cards with reviews
function updateProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const productLink = card.querySelector('a');
        if (!productLink) return;

        const handle = new URLSearchParams(productLink.href.split('?')[1]).get('handle');
        if (!handle || !productRatings[handle]) return;

        const rating = productRatings[handle];
        if (!rating || rating.count === 0) return;

        const titleEl = card.querySelector('.product-card__title');
        if (!titleEl) return;

        const ratingHtml = `
            <div class="product-card__rating">
                ${generateStarRating(parseFloat(rating.average))}
                <span class="product-card__rating-count">(${rating.count})</span>
            </div>
        `;
        titleEl.insertAdjacentHTML('afterend', ratingHtml);
    });
}

// Update product detail page with reviews
function updateProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productHandle = urlParams.get('handle');
    if (!productHandle) return;

    const rating = getProductRating(productHandle);
    if (!rating || rating.count === 0) return;

    const titleEl = document.querySelector('.product__title');
    if (!titleEl) return;

    // Add rating summary below product title
    const ratingHtml = `
        <div class="product__rating" onclick="document.getElementById('reviews-section').scrollIntoView({behavior: 'smooth'})">
            ${generateStarRating(parseFloat(rating.average))}
            <span class="product__rating-count">Based on ${rating.count} reviews</span>
        </div>
    `;
    titleEl.insertAdjacentHTML('afterend', ratingHtml);

    // Add reviews section after product info
    const productReviews = getProductReviews(productHandle);
    const reviewsSection = document.createElement('section');
    reviewsSection.id = 'reviews-section';
    reviewsSection.className = 'reviews-section';

    reviewsSection.innerHTML = `
        <div class="reviews-section__header">
            <div class="reviews-section__summary">
                <h2>Customer Reviews</h2>
                <div class="reviews-section__average">
                    ${generateStarRating(parseFloat(rating.average), 'large')}
                    <span class="reviews-section__average-text">${rating.average} out of 5</span>
                </div>
                <div class="reviews-section__count">${rating.count} reviews</div>
                <div class="reviews-section__distribution">
                    ${Object.entries(rating.distribution).reverse().map(([stars, count]) => `
                        <div class="rating-bar">
                            <span class="rating-bar__label">${stars} stars</span>
                            <div class="rating-bar__bar">
                                <div class="rating-bar__fill" style="width: ${(count / rating.count * 100)}%"></div>
                            </div>
                            <span class="rating-bar__count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="reviews-section__list">
            ${updateReviewsList(productReviews)}
        </div>
    `;

    const productInfo = document.querySelector('.product__info');
    if (productInfo) {
        productInfo.parentNode.insertBefore(reviewsSection, productInfo.nextSibling);
    }
}

// Add customer reviews carousel to homepage
function addReviewsCarousel() {
    // Only add to homepage
    if (!document.querySelector('.hero')) return;

    // Get top rated reviews
    const topReviews = [...reviews]
        .sort((a, b) => parseInt(b.rating) - parseInt(a.rating))
        .slice(0, 9);

    const section = document.createElement('section');
    section.className = 'customer-reviews';
    section.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">Let our Customers Speak</h2>
            <div class="carousel-controls">
                <button class="carousel-control prev" aria-label="Previous review">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="carousel-control next" aria-label="Next review">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
        <div class="reviews-carousel">
            <div class="carousel-container">
                ${topReviews.map(review => `
                    <div class="review-card">
                        <div class="review-card__header">
                            ${generateStarRating(parseInt(review.rating))}
                            <span class="review-card__author">${review.reviewer_name}</span>
                        </div>
                        <div class="review-card__body">
                            <p>${review.body}</p>
                        </div>
                        <div class="review-card__footer">
                            <span class="review-card__date">${formatDate(review.review_date)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Insert before footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.parentNode.insertBefore(section, footer);
    }

    // Initialize carousel
    const container = section.querySelector('.carousel-container');
    const prevBtn = section.querySelector('.prev');
    const nextBtn = section.querySelector('.next');
    let position = 0;

    function slide(direction) {
        const cards = container.querySelectorAll('.review-card');
        const cardWidth = cards[0].offsetWidth + 24; // Including margin
        const visibleCards = Math.floor(container.offsetWidth / cardWidth);
        const maxPosition = cards.length - visibleCards;

        if (direction === 'next' && position < maxPosition) {
            position++;
        } else if (direction === 'prev' && position > 0) {
            position--;
        }

        container.style.transform = `translateX(-${position * cardWidth}px)`;
    }

    prevBtn.addEventListener('click', () => slide('prev'));
    nextBtn.addEventListener('click', () => slide('next'));
}

// Initialize reviews
document.addEventListener('DOMContentLoaded', loadReviews);
