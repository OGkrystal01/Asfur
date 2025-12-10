// Script to update compare_at_price to rounded values with ~20% markup
const fs = require('fs');

// Read the products file
const productsFile = './public/js/data/products.js';
let content = fs.readFileSync(productsFile, 'utf8');

// Price mappings: price -> compare_at_price (20% markup, rounded to x9.99)
const priceUpdates = {
    '49.99': '59.99',  // 20%
    '59.99': '71.99',  // 20%
    '39.99': '47.99',  // 20%
    '45.99': '55.99',  // 21.76%
    '45.95': '55.99',  // 21.85%
    '67.99': '81.99',  // 20.61%
    '34.99': '41.99',  // 20%
    '54.99': '65.99',  // 20%
    '44.95': '53.99',  // 20%
};

// Update all compare_at_price values
Object.keys(priceUpdates).forEach(price => {
    const comparePrice = priceUpdates[price];
    // Find all instances where this price appears and update the compare_at_price
    const priceRegex = new RegExp(`"price":\\s*${price},\\s*"compare_at_price":\\s*[0-9.]+`, 'g');
    content = content.replace(priceRegex, `"price": ${price},\n                "compare_at_price": ${comparePrice}`);
});

// Write back the updated content
fs.writeFileSync(productsFile, content, 'utf8');

console.log('✅ Compare prices updated successfully!');
console.log('Price updates applied:');
Object.keys(priceUpdates).forEach(price => {
    const comparePrice = priceUpdates[price];
    const discount = Math.round(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100);
    console.log(`  €${price} -> €${comparePrice} (${discount}% discount)`);
});
