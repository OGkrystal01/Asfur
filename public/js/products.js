document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

async function loadProducts() {
    try {
        const response = await fetch('/products.csv');
        const text = await response.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const products = [];
        let currentProduct = null;
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            if (row.Handle && row.Title) {
                // This is a new product
                currentProduct = {
                    handle: row.Handle,
                    title: row.Title,
                    body_html: row['Body (HTML)'],
                    vendor: row.Vendor,
                    product_category: row['Product Category'],
                    published: row.Published === 'true',
                    option1_name: row['Option1 Name'] || null,
                    option1_value: row['Option1 Value'] || null,
                    option2_name: row['Option2 Name'] || null,
                    option2_value: row['Option2 Value'] || null,
                    variants: [],
                    image: {
                        src: row['Image Src'] || ''
                    }
                };
                products.push(currentProduct);
            }
            
            // Add variant data
            if (currentProduct) {
                currentProduct.variants.push({
                    option1_name: row['Option1 Name'] || null,
                    option1_value: row['Option1 Value'] || null,
                    option2_name: row['Option2 Name'] || null,
                    option2_value: row['Option2 Value'] || null,
                    price: parseFloat(row['Variant Price']) || 0,
                    compare_at_price: parseFloat(row['Variant Compare At Price']) || 0,
                    inventory_quantity: parseInt(row['Variant Inventory Qty']) || 0,
                    requires_shipping: row['Variant Requires Shipping'] === 'true',
                    taxable: row['Variant Taxable'] === 'true',
                    image: row['Image Src'] || currentProduct.image.src
                });
            }
        }
        
        // Make products available globally
        window.shopifyProducts = products;
        
        // Separate bundles and regular products
        const bundles = products.filter(product => {
            const title = product.title.toLowerCase();
            return (
                title === 'all apple vendors bundle' ||
                title === 'all clothing/accessories bundle' ||
                title === 'all speaker vendor bundle' ||
                title === 'all trending vendors bundle'
            );
        });
        const regularProducts = products.filter(product => {
            const title = product.title.toLowerCase();
            return !(
                title === 'all apple vendors bundle' ||
                title === 'all clothing/accessories bundle' ||
                title === 'all speaker vendor bundle' ||
                title === 'all trending vendors bundle'
            );
        });
        
        // Display regular products first, then bundles
        displayProducts([...regularProducts, ...bundles]);
    } catch (error) {
        console.error('Error loading products:', error);
    }
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
