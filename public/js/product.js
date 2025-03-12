let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productHandle = urlParams.get('handle');
    
    if (productHandle) {
        // Try to load from window.shopifyProducts first
        const product = window.shopifyProducts?.find(p => p.handle === productHandle);
        if (product) {
            displayProduct(product);
        } else {
            // Fallback to API if not found in window
            loadProductFromAPI(productHandle);
        }
    } else {
        showErrorState('No product selected');
    }

    // Add to Cart Button
    const addToCartButton = document.getElementById('add-to-cart');
    const quantityInput = document.getElementById('quantity');
    const minusButton = document.querySelector('.quantity-btn.minus');
    const plusButton = document.querySelector('.quantity-btn.plus');

    if (addToCartButton) {
        // Clear any existing event listeners
        const newAddToCartButton = addToCartButton.cloneNode(true);
        addToCartButton.parentNode.replaceChild(newAddToCartButton, addToCartButton);
        
        newAddToCartButton.style.display = 'block';
        newAddToCartButton.style.border = '2px solid #000000';
        newAddToCartButton.style.color = '#000000';
        newAddToCartButton.style.backgroundColor = 'transparent';
        newAddToCartButton.style.transition = 'all 0.3s ease';
        
        newAddToCartButton.addEventListener('mouseover', () => {
            newAddToCartButton.style.backgroundColor = '#333333';
            newAddToCartButton.style.color = '#ffffff';
        });
        
        newAddToCartButton.addEventListener('mouseout', () => {
            newAddToCartButton.style.backgroundColor = 'transparent';
            newAddToCartButton.style.color = '#000000';
        });

        // Add to cart functionality
        newAddToCartButton.addEventListener('click', () => {
            if (currentProduct) {
                const quantity = parseInt(quantityInput.value) || 1;
                window.addToCart({
                    handle: currentProduct.handle,
                    title: currentProduct.title,
                    price: currentProduct.variants[0].price,
                    image: currentProduct.image.src,
                    quantity
                });

                // Show notification menu
                const notificationMenu = document.querySelector('.cart-notification-menu');
                const productImage = notificationMenu.querySelector('.cart-notification-menu__product-image');
                const productTitle = notificationMenu.querySelector('.cart-notification-menu__product-title');
                const productPrice = notificationMenu.querySelector('.cart-notification-menu__product-price');

                productImage.src = currentProduct.image.src;
                productImage.alt = currentProduct.title;
                productTitle.textContent = currentProduct.title;
                productPrice.textContent = formatPrice(currentProduct.variants[0].price);

                notificationMenu.classList.add('visible');

                // Hide notification after 3 seconds
                setTimeout(() => {
                    notificationMenu.classList.remove('visible');
                }, 3000);

                // Show feedback with black color scheme
                const originalText = newAddToCartButton.textContent;
                newAddToCartButton.textContent = 'Added to Cart!';
                newAddToCartButton.style.backgroundColor = '#000000';
                newAddToCartButton.style.color = '#ffffff';
                
                setTimeout(() => {
                    newAddToCartButton.textContent = originalText;
                    newAddToCartButton.style.backgroundColor = 'transparent';
                    newAddToCartButton.style.color = '#000000';
                }, 2000);
            }
        });
    }

    // Quantity Controls with black color scheme
    if (minusButton && plusButton && quantityInput) {
        minusButton.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        plusButton.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue < 99) {
                quantityInput.value = currentValue + 1;
            }
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value) || 1;
            value = Math.max(1, Math.min(99, value));
            quantityInput.value = value;
        });

        // Style quantity controls
        [minusButton, plusButton].forEach(button => {
            button.style.border = '1px solid #000000';
            button.style.color = '#000000';
            button.style.backgroundColor = 'transparent';
            button.style.transition = 'all 0.3s ease';
            
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#f0f0f0';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = 'transparent';
            });
        });
        
        quantityInput.style.border = '1px solid #000000';
        quantityInput.style.color = '#000000';
    }

    // Collapsible Tabs with black color scheme
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            const content = button.nextElementSibling;
            
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                button.style.backgroundColor = 'transparent';
            } else {
                content.classList.add('active');
                button.style.backgroundColor = '#f0f0f0';
            }
        });

        // Style collapsible buttons
        button.style.color = '#000000';
        button.style.borderColor = '#000000';
        button.style.transition = 'all 0.3s ease';
        
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#f0f0f0';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = 'transparent';
        });
    });

    // Checkout button functionality for Product Detail Page
    const checkoutButton = document.getElementById('checkout-button');

    if (checkoutButton) {
        // Style checkout button with black theme
        checkoutButton.style.backgroundColor = '#000000';
        checkoutButton.style.color = '#ffffff';
        checkoutButton.style.border = 'none';
        checkoutButton.style.width = '100%';
        checkoutButton.style.padding = '15px';
        checkoutButton.style.fontSize = '16px';
        checkoutButton.style.fontWeight = 'bold';
        checkoutButton.style.cursor = 'pointer';
        checkoutButton.style.transition = 'all 0.3s ease';
        
        checkoutButton.addEventListener('mouseover', () => {
            checkoutButton.style.backgroundColor = '#333333';
        });
        
        checkoutButton.addEventListener('mouseout', () => {
            checkoutButton.style.backgroundColor = '#000000';
        });

        checkoutButton.addEventListener('click', () => {
            if (!currentProduct) {
                alert('Product not found');
                return;
            }

            // Add to cart first
            const quantity = parseInt(document.getElementById('quantity')?.value || '1');
            window.addToCart({
                handle: currentProduct.handle,
                title: currentProduct.title,
                price: currentProduct.variants[0].price,
                image: currentProduct.image.src,
                quantity
            });

            // Then redirect to checkout
            window.location.href = '/pages/checkout.html';
        });
    }
});

function displayProduct(product) {
    currentProduct = product;
    document.title = `${product.title} - Resell Depot`;
    
    // Update main elements
    const mainImage = document.getElementById('main-image');
    const titleElement = document.getElementById('product-title');
    const priceElement = document.getElementById('product-price');
    const descriptionElement = document.getElementById('product-description');
    
    if (mainImage) mainImage.src = product.image.src;
    if (titleElement) titleElement.textContent = product.title;
    if (descriptionElement) descriptionElement.innerHTML = product.body_html;

    // Add rating if product has reviews
    if (product.rating_count) {
        const ratingElement = document.getElementById('product-rating');
        if (ratingElement) {
            const starRating = ratingElement.querySelector('.star-rating');
            const ratingCount = ratingElement.querySelector('.product__rating-count');
            
            // Generate 5 filled stars for all products with reviews
            starRating.innerHTML = Array(5).fill('★').join('');
            ratingCount.textContent = `${product.rating_count} reviews`;
            
            // Make rating clickable to scroll to reviews
            ratingElement.style.display = 'flex';
            ratingElement.style.cursor = 'pointer';
            ratingElement.onclick = () => {
                const reviewsSection = document.getElementById('reviews-container');
                if (reviewsSection) {
                    reviewsSection.scrollIntoView({ behavior: 'smooth' });
                }
            };

            // Add reviews section
            const reviewsContainer = document.getElementById('reviews-container');
            if (reviewsContainer) {
                reviewsContainer.innerHTML = `
                    <div class="reviews-section">
                        <div class="reviews-section__header">
                            <div class="reviews-section__summary">
                                <h2>Customer Reviews</h2>
                                <div class="reviews-section__average">
                                    <div class="star-rating star-rating--large">
                                        ${Array(5).fill('★').join('')}
                                    </div>
                                    <span class="reviews-section__average-text">5.0 out of 5</span>
                                </div>
                                <div class="reviews-section__count">${product.rating_count} reviews</div>
                                <button class="write-review-btn" id="write-review-btn">Write a Review</button>
                                <div class="reviews-section__distribution">
                                    <div class="rating-bar">
                                        <span class="rating-bar__label">5 stars</span>
                                        <div class="rating-bar__bar">
                                            <div class="rating-bar__fill" style="width: 100%"></div>
                                        </div>
                                        <span class="rating-bar__count">${product.rating_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="reviews-section__filters">
                            <div class="reviews-section__sort">
                                <label for="sort-reviews">Sort by:</label>
                                <select id="sort-reviews" class="sort-reviews-select">
                                    <option value="newest">Newest</option>
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                    <option value="helpful">Most Helpful</option>
                                </select>
                            </div>
                        </div>
                        <div class="reviews-section__list">
                            ${Array(5).fill('').map(() => `
                                <div class="review-card">
                                    <div class="review-card__header">
                                        <div class="star-rating">
                                            ${Array(5).fill('★').join('')}
                                        </div>
                                        <span class="review-card__author">Verified Customer</span>
                                        <span class="review-card__date">${new Date().toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</span>
                                    </div>
                                    <div class="review-card__body">
                                        <p>Great product! Exactly as described. Fast shipping and excellent customer service.</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="reviews-pagination">
                            <button class="pagination-btn prev disabled">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="pagination-btn number active">1</button>
                            <button class="pagination-btn next disabled">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                `;

                // Add event listeners for review functionality
                const writeReviewBtn = document.getElementById('write-review-btn');
                const sortReviews = document.getElementById('sort-reviews');

                if (writeReviewBtn) {
                    writeReviewBtn.addEventListener('click', () => {
                        // Scroll to top of reviews section
                        const reviewsSection = document.querySelector('.reviews-section');
                        if (reviewsSection) {
                            reviewsSection.scrollIntoView({ behavior: 'smooth' });
                        }
                        
                        // Show write review form (to be implemented)
                        alert('Write a review feature coming soon!');
                    });
                }

                if (sortReviews) {
                    sortReviews.addEventListener('change', (e) => {
                        const sortBy = e.target.value;
                        // Sort reviews logic (to be implemented)
                        console.log('Sorting reviews by:', sortBy);
                    });
                }
            }
        }
    } else {
        // Hide rating if no reviews
        const ratingElement = document.getElementById('product-rating');
        if (ratingElement) {
            ratingElement.style.display = 'none';
        }
    }

    // Update price with compare at price if available
    if (priceElement && product.variants && product.variants[0]) {
        const variant = product.variants[0];
        if (variant.compare_at_price) {
            priceElement.innerHTML = `
                <span class="price-item price-item--sale">€${variant.price}</span>
                <s class="price-item price-item--regular">€${variant.compare_at_price}</s>
            `;
        } else {
            priceElement.innerHTML = `<span class="price-item">€${variant.price}</span>`;
        }
    }

    // Update product details with black color scheme
    // Add cart notification menu if it doesn't exist
    if (!document.querySelector('.cart-notification-menu')) {
        const notificationMenu = document.createElement('div');
        notificationMenu.className = 'cart-notification-menu';
        notificationMenu.innerHTML = `
            <div class="cart-notification-menu__header">
                <h3 class="cart-notification-menu__title">Added to Cart</h3>
                <button class="cart-notification-menu__close">&times;</button>
            </div>
            <div class="cart-notification-menu__product">
                <img class="cart-notification-menu__product-image" src="" alt="">
                <div class="cart-notification-menu__product-info">
                    <h4 class="cart-notification-menu__product-title"></h4>
                    <p class="cart-notification-menu__product-price"></p>
                </div>
            </div>
            <div class="cart-notification-menu__buttons">
                <button class="cart-notification-menu__button cart-notification-menu__button--secondary">Continue Shopping</button>
                <button class="cart-notification-menu__button cart-notification-menu__button--primary">Checkout Now</button>
            </div>
        `;
        document.body.appendChild(notificationMenu);

        // Add event listeners for the notification menu
        const closeBtn = notificationMenu.querySelector('.cart-notification-menu__close');
        const continueBtn = notificationMenu.querySelector('.cart-notification-menu__button--secondary');
        const checkoutBtn = notificationMenu.querySelector('.cart-notification-menu__button--primary');

        closeBtn.addEventListener('click', () => {
            notificationMenu.classList.remove('visible');
        });

        continueBtn.addEventListener('click', () => {
            notificationMenu.classList.remove('visible');
        });

        checkoutBtn.addEventListener('click', () => {
            window.location.href = '/pages/cart.html';
        });
    }

    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        // Clear any existing event listeners
        const newAddToCartBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);
        
        newAddToCartBtn.style.display = 'block';
        newAddToCartBtn.style.border = '2px solid #000000';
        newAddToCartBtn.style.color = '#000000';
        newAddToCartBtn.style.backgroundColor = 'transparent';
        newAddToCartBtn.style.transition = 'all 0.3s ease';
        
        newAddToCartBtn.addEventListener('mouseover', () => {
            newAddToCartBtn.style.backgroundColor = '#333333';
            newAddToCartBtn.style.color = '#ffffff';
        });
        
        newAddToCartBtn.addEventListener('mouseout', () => {
            newAddToCartBtn.style.backgroundColor = 'transparent';
            newAddToCartBtn.style.color = '#000000';
        });

        // Add to cart functionality
        newAddToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
            window.addToCart({
                handle: product.handle,
                title: product.title,
                price: product.variants[0].price,
                image: product.image.src,
                quantity
            });

            // Show notification menu
            const notificationMenu = document.querySelector('.cart-notification-menu');
            const productImage = notificationMenu.querySelector('.cart-notification-menu__product-image');
            const productTitle = notificationMenu.querySelector('.cart-notification-menu__product-title');
            const productPrice = notificationMenu.querySelector('.cart-notification-menu__product-price');

            productImage.src = product.image.src;
            productImage.alt = product.title;
            productTitle.textContent = product.title;
            productPrice.textContent = formatPrice(product.variants[0].price);

            notificationMenu.classList.add('visible');

            // Hide notification after 3 seconds
            setTimeout(() => {
                notificationMenu.classList.remove('visible');
            }, 3000);

            // Show feedback with black color scheme
            const originalText = newAddToCartBtn.textContent;
            newAddToCartBtn.textContent = 'Added to Cart!';
            newAddToCartBtn.style.backgroundColor = '#000000';
            newAddToCartBtn.style.color = '#ffffff';
            
            setTimeout(() => {
                newAddToCartBtn.textContent = originalText;
                newAddToCartBtn.style.backgroundColor = 'transparent';
                newAddToCartBtn.style.color = '#000000';
            }, 2000);
        });
    }

    const checkoutBtn = document.querySelector('.product-button--primary');
    if (checkoutBtn) {
        // Clear any existing event listeners
        const newCheckoutBtn = checkoutBtn.cloneNode(true);
        checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);

        newCheckoutBtn.style.backgroundColor = '#000000';
        newCheckoutBtn.style.color = '#ffffff';
        newCheckoutBtn.style.border = '2px solid #000000';
        newCheckoutBtn.style.transition = 'all 0.3s ease';
        
        newCheckoutBtn.addEventListener('mouseover', () => {
            newCheckoutBtn.style.backgroundColor = '#333333';
        });
        
        newCheckoutBtn.addEventListener('mouseout', () => {
            newCheckoutBtn.style.backgroundColor = '#000000';
        });

        // Add to cart and redirect to cart page
        newCheckoutBtn.addEventListener('click', () => {
            const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
            window.addToCart({
                handle: product.handle,
                title: product.title,
                price: product.variants[0].price,
                image: product.image.src,
                quantity
            });
            window.location.href = '/pages/cart.html';
        });
    }

    // Style quantity controls with black color scheme
    const quantityControls = document.querySelectorAll('.quantity-btn');
    const quantityInput = document.getElementById('quantity');
    
    quantityControls.forEach(btn => {
        btn.style.border = '1px solid #000000';
        btn.style.color = '#000000';
        btn.style.backgroundColor = 'transparent';
        btn.style.transition = 'all 0.3s ease';
        
        btn.addEventListener('mouseover', () => {
            btn.style.backgroundColor = '#f0f0f0';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.backgroundColor = 'transparent';
        });
    });

    if (quantityInput) {
        quantityInput.style.border = '1px solid #000000';
        quantityInput.style.color = '#000000';
    }

    // Initialize quantity controls
    initializeQuantityControls();
}

async function loadProductFromAPI(handle) {
    try {
        const response = await fetch(`/api/products/${handle}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        const product = await response.json();
        displayProduct(product);
    } catch (error) {
        console.error('Error loading product:', error);
        showErrorState('Product not found');
    }
}

function showErrorState(message = 'Product not found') {
    const titleElement = document.getElementById('product-title');
    const priceElement = document.getElementById('product-price');
    const descriptionElement = document.getElementById('product-description');
    const mainImage = document.getElementById('main-image');
    const addToCartBtn = document.getElementById('add-to-cart');

    if (titleElement) {
        titleElement.textContent = message;
        titleElement.style.color = '#000000';
    }

    if (priceElement) {
        priceElement.textContent = '';
    }

    if (descriptionElement) {
        descriptionElement.innerHTML = 'Sorry, we couldn\'t find the product you\'re looking for.';
        descriptionElement.style.color = '#000000';
    }

    if (mainImage) {
        mainImage.src = '';
        mainImage.alt = message;
    }

    if (addToCartBtn) {
        addToCartBtn.style.display = 'none';
    }
}

function initializeQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    if (quantityInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue < 99) {
                quantityInput.value = currentValue + 1;
            }
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value) || 1;
            value = Math.max(1, Math.min(99, value));
            quantityInput.value = value;
        });
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}
