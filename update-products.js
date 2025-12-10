// Script to add options array and comparison prices to all products
const fs = require('fs');
const path = require('path');

// Read the current products file
const productsPath = path.join(__dirname, 'public', 'js', 'data', 'products.js');
let productsContent = fs.readFileSync(productsPath, 'utf8');

// Extract the products array
const productsMatch = productsContent.match(/const products = (\[[\s\S]*?\]);/);
if (!productsMatch) {
    console.error('Could not find products array');
    process.exit(1);
}

const products = JSON.parse(productsMatch[1]);

// Process each product
products.forEach(product => {
    // Add options array if product has variants with option1
    if (product.variants && product.variants.length > 0) {
        const hasOption1 = product.variants.some(v => v.option1);
        
        if (hasOption1 && !product.options) {
            // Extract unique option values
            const optionValues = [...new Set(product.variants.map(v => v.option1).filter(Boolean))];
            
            product.options = [{
                name: 'Farbe',
                values: optionValues
            }];
        }
        
        // Add compare_at_price (20% discount shown, so compare price is 25% higher than current)
        product.variants.forEach(variant => {
            if (!variant.compare_at_price || variant.compare_at_price === null) {
                variant.compare_at_price = Math.round(variant.price * 1.25 * 100) / 100;
            }
        });
    }
});

// Write back to file
const newContent = `// AUTO-GENERATED from taschennnnn.csv - Luxury Designer Bags
const products = ${JSON.stringify(products, null, 4)};

// Make products available globally for browser
if (typeof window !== 'undefined') {
    window.shopifyProducts = products;
}

// For Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}
`;

fs.writeFileSync(productsPath, newContent, 'utf8');
console.log('✅ Products updated successfully!');
console.log(`- Added options array to products with variants`);
console.log(`- Set comparison prices (20% discount) for all variants`);
