// Product data from your successful Shopify store - maintaining exact functionality
const products = [
    {
        handle: 'monc-maya-jacket',
        title: 'Moncler Maya Jacket Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        published: true,
        option1_name: 'Size',
        variants: [
            {
                option1_name: 'Size',
                option1_value: 'XS',
                price: 24.95,
                compare_at_price: 54.99,
                inventory_quantity: -1,
                requires_shipping: false,
                taxable: false
            },
            {
                option1_name: 'Size',
                option1_value: 'S',
                price: 24.95,
                compare_at_price: 54.99,
                inventory_quantity: -7,
                requires_shipping: false,
                taxable: false
            },
            {
                option1_name: 'Size',
                option1_value: 'M',
                price: 24.95,
                compare_at_price: 54.99,
                inventory_quantity: -22,
                requires_shipping: false,
                taxable: false
            },
            {
                option1_name: 'Size',
                option1_value: 'XL',
                price: 24.95,
                compare_at_price: 54.99,
                inventory_quantity: -16,
                requires_shipping: false,
                taxable: false
            }
        ],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/07e84d_6d869f53bc43432a820d01b544d5a46b_mv2.webp?v=1729621576'
        },
        rating_count: 81,
        status: 'active'
    },
    {
        handle: 'all-🍎-vendors-bundle',
        title: 'All Apple Vendors Bundle',
        body_html: '<p>All 🍎 Vendors from our Site for a Big Discount</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        published: true,
        variants: [{
            price: 49.95,
            compare_at_price: 109.95,
            inventory_quantity: -1,
            requires_shipping: false,
            taxable: false
        }],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Applevendors.jpg?v=1729621551'
        },
        status: 'active'
    },
    {
        handle: 'charge-5-vendor',
        title: 'JBL charge 5 Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        published: true,
        option1_name: 'Color',
        variants: [
            {
                option1_name: 'Color',
                option1_value: 'Black',
                price: 14.95,
                compare_at_price: 29.95,
                inventory_quantity: -6,
                requires_shipping: false,
                taxable: false,
                image: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/JBL_CHARGE5_HERO_BLACK_0046_x1_55e1907d-f60e-4c12-8585-cded54424f28.webp?v=1729621597'
            },
            {
                option1_name: 'Color',
                option1_value: 'Red',
                price: 14.95,
                compare_at_price: 29.95,
                inventory_quantity: 0,
                requires_shipping: false,
                taxable: false,
                image: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/JBL_CHARGE5_HERO_RED_0029_x2_057649e2-efa2-4a23-8d41-a37a4683266f.webp?v=1729621597'
            }
        ],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/JBL_CHARGE5_HERO_BLACK_0046_x1_55e1907d-f60e-4c12-8585-cded54424f28.webp?v=1729621597'
        },
        status: 'active'
    },
    {
        handle: 'phone-15-vendor',
        title: 'Iphone 15 Vendor',
        body_html: '<p><span><strong>Every Purchase Includes:</strong></span> Free PDF with a Step for Step<span> </span><strong>Tutorial</strong><span> </span>on how to sell these. This tutorial is very valuable and will<span> </span><strong>definitely</strong><span> </span><strong>generate profit</strong><span> </span>if followed</p>',
        vendor: 'Resell-Depot',
        product_category: 'Uncategorized',
        published: true,
        option1_name: 'Color',
        option2_name: 'Storage',
        variants: [
            {
                option1_name: 'Color',
                option1_value: 'Black',
                option2_name: 'Storage',
                option2_value: '128GB',
                price: 79.99,
                compare_at_price: 99.99,
                inventory_quantity: -2,
                requires_shipping: false,
                taxable: false,
                image: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Final_iPhone-14-Pro-Split-Full-Wrap-Vinyl-Skin-Design-Mockup-Front-Back-Angled-View_7c8b1dba-0ddc-4f69-b26e-160550b46b97.webp?v=1729621558'
            },
            {
                option1_name: 'Color',
                option1_value: 'Black',
                option2_name: 'Storage',
                option2_value: '256GB',
                price: 84.99,
                compare_at_price: 99.99,
                inventory_quantity: -1,
                requires_shipping: false,
                taxable: false,
                image: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/65038654434d0-iPhone15ProNaturaltitaniumpng.png?v=1729621558'
            }
        ],
        image: {
            src: 'https://cdn.shopify.com/s/files/1/0855/1576/4040/files/Final_iPhone-14-Pro-Split-Full-Wrap-Vinyl-Skin-Design-Mockup-Front-Back-Angled-View_7c8b1dba-0ddc-4f69-b26e-160550b46b97.webp?v=1729621558'
        },
        rating_count: 87,
        status: 'active'
    }
];

// Make products available in both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
} else {
    window.shopifyProducts = products;
}

// Function to fetch products - maintaining exact Shopify functionality
async function fetchProducts() {
    return products;
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = products.map(product => {
        const variant = product.variants[0];
        const price = formatPrice(variant.price);
        const compareAtPrice = variant.compare_at_price ? formatPrice(variant.compare_at_price) : null;
        const isOnSale = compareAtPrice && variant.compare_at_price > variant.price;

        return `
            <div class="product-card" style="width: 280px; background: white; margin: 10px; transition: transform 0.2s, box-shadow 0.2s;">
                <a href="/pages/product.html?handle=${encodeURIComponent(product.handle)}" style="text-decoration: none; color: inherit; display: block;">
                    <div class="product-image-container" style="position: relative; padding: 20px;">
                        <img src="${product.image.src}" alt="${product.title}" loading="lazy" style="width: 100%; height: auto; display: block;">
                        ${isOnSale ? '<span class="sale-badge" style="position: absolute; top: 10px; right: 10px; background: #ff0000; color: white; padding: 5px 10px; border-radius: 3px;">Sale</span>' : ''}
                    </div>
                    <div class="product-info" style="padding: 15px;">
                        <h3 style="margin: 0 0 10px; font-size: 1rem; color: #333;">${product.title}</h3>
                        <div class="price-container" style="display: flex; align-items: center; gap: 10px;">
                            <span class="current-price" style="font-weight: bold; color: ${isOnSale ? '#ff0000' : '#333'};">${price}</span>
                            ${compareAtPrice ? `<span class="compare-price" style="text-decoration: line-through; color: #999;">${compareAtPrice}</span>` : ''}
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');

    // Add hover effect
    const cards = container.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });
}

function formatPrice(price) {
    return '€' + parseFloat(price).toFixed(2);
}

document.addEventListener('DOMContentLoaded', async () => {
    const products = await fetchProducts();
    displayProducts(products);
});
