const fs = require('fs');

// Read CSV file
const csv = fs.readFileSync('taschennnnn.csv', 'utf8');
const lines = csv.split('\n').slice(1); // Skip header

const products = {};

lines.forEach(line => {
    if (!line.trim() || line.includes('draft')) return;
    
    // Split but handle quoted commas
    const cols = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            cols.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    cols.push(current);
    
    const handle = cols[0]?.trim();
    if (!handle || handle === 'Handle') return;
    
    const title = cols[1]?.trim();
    const vendor = cols[3]?.trim() || 'Aurelia-Bags';
    const category = cols[4]?.trim() || '';
    const publishedStr = cols[7]?.trim();
    const published = publishedStr === 'true' || publishedStr === '';
    const colorName = cols[9]?.trim();
    const price = parseFloat(cols[23]) || 0;
    const comparePrice = parseFloat(cols[24]) || null;
    const qty = parseInt(cols[20]) || 0;
    const imgSrc = cols[28]?.trim();
    const status = cols[39]?.trim() || 'active';
    
    // Skip if not active
    if (status !== 'active') return;
    
    // Initialize product if not exists
    if (!products[handle]) {
        products[handle] = {
            handle,
            title: title || handle,
            body_html: '<p>Premium 1:1 designer bag with original packaging, dust bag, and authentication materials. Indistinguishable from the authentic version.</p>',
            vendor,
            product_category: category,
            type: '',
            tags: '',
            published,
            variants: [],
            image: {
                src: imgSrc || '',
                alt: title || ''
            },
            rating_count: Math.floor(Math.random() * 50) + 50, // Random rating between 50-100
            status
        };
    }
    
    // Add variant (always add for color variants)
    if (colorName && colorName !== 'Default Title' && colorName !== 'Title') {
        products[handle].variants.push({
            option1: colorName,
            price,
            compare_at_price: comparePrice,
            inventory_quantity: qty,
            requires_shipping: true,
            taxable: true,
            image: {
                src: imgSrc || '',
                alt: colorName
            }
        });
    } else if (products[handle].variants.length === 0) {
        // Add default variant if no color variants
        products[handle].variants.push({
            price,
            compare_at_price: comparePrice,
            inventory_quantity: qty,
            requires_shipping: true,
            taxable: true,
            image: {
                src: imgSrc || '',
                alt: ''
            }
        });
    }
    
    // Set main product image if not set
    if (!products[handle].image.src && imgSrc) {
        products[handle].image.src = imgSrc;
    }
});

// Convert to array and filter out non-bags
const productsArray = Object.values(products).filter(p => {
    // Remove watch and any non-bag items
    const title = p.title.toLowerCase();
    return !title.includes('uhr') && !title.includes('watch') && !title.includes('unbenannt');
});

// Generate JavaScript file
const output = `// AUTO-GENERATED from taschennnnn.csv - Luxury Designer Bags
const products = ${JSON.stringify(productsArray, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { products };
}
`;

fs.writeFileSync('public/js/data/products.js', output);

console.log('✅ Successfully converted ' + productsArray.length + ' luxury bag products!');
console.log('📦 Products imported:');
productsArray.forEach(p => {
    console.log('   - ' + p.title + ' (' + p.variants.length + ' variant' + (p.variants.length !== 1 ? 's' : '') + ')');
});
