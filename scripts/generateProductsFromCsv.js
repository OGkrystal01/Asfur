const fs = require('fs');
const path = require('path');

// Simple CSV parser that supports quoted fields with commas
function parseCsv(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1).map(line => {
        const cols = parseCsvLine(line);
        const row = {};
        headers.forEach((h, i) => {
            row[h] = cols[i] !== undefined ? cols[i] : '';
        });
        return row;
    });

    return { headers, rows };
}

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"') {
                if (line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
    }
    result.push(current);
    return result;
}

function jsStringEscape(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r?\n/g, ' ');
}

function buildProductsFromCsv(csvPath) {
    const raw = fs.readFileSync(csvPath, 'utf8');
    const { rows } = parseCsv(raw);

    const byHandle = new Map();

    // Group ALL rows by handle so we keep all variants, regardless of Status
    for (const row of rows) {
        const handle = row['Handle'];
        if (!handle) continue;

        let group = byHandle.get(handle);
        if (!group) {
            group = [];
            byHandle.set(handle, group);
        }
        group.push(row);
    }

    const products = [];

    for (const [handle, group] of byHandle.entries()) {
        // Only keep products where at least one row is active
        const hasActiveRow = group.some(r => (r.Status || '').toLowerCase() === 'active');
        if (!hasActiveRow) continue;

        // Use first row with a title or the first row
        const primary = group.find(r => r['Title']) || group[0];

        const optionsMap = new Map(); // canonical option name -> Set(values)
        const optionNames = ['Option1 Name', 'Option2 Name', 'Option3 Name'];
        const optionValues = ['Option1 Value', 'Option2 Value', 'Option3 Value'];

        // Determine canonical option names for this handle (per index)
        const canonicalNames = optionNames.map((nameKey, idx) => {
            const nameRow = group.find(r => (r[nameKey] || '').trim() !== '');
            if (!nameRow) return null;
            const rawName = (nameRow[nameKey] || '').trim();
            if (!rawName) return null;
            // Ignore Shopify's default Title option (Title / Default Title)
            if (rawName.toLowerCase() === 'title') return null;
            return rawName;
        });

        // Collect option values from all rows using canonical names
        for (const row of group) {
            canonicalNames.forEach((canonicalName, idx) => {
                if (!canonicalName) return; // no real option for this index
                const valueKey = optionValues[idx];
                const value = (row[valueKey] || '').trim();
                if (!value) return;
                if (!optionsMap.has(canonicalName)) optionsMap.set(canonicalName, new Set());
                optionsMap.get(canonicalName).add(value);
            });
        }

        const options = Array.from(optionsMap.entries()).map(([name, set]) => ({
            name,
            values: Array.from(set)
        }));

        const variants = group.map(row => {
            const priceRaw = row['Variant Price'];
            const compareRaw = row['Variant Compare At Price'];
            const qtyRaw = row['Variant Inventory Qty'];

            const variant = {
                option1: canonicalNames[0] ? (row['Option1 Value'] || null) : null,
                option2: canonicalNames[1] ? (row['Option2 Value'] || null) : null,
                option3: canonicalNames[2] ? (row['Option3 Value'] || null) : null,
                price: priceRaw ? parseFloat(priceRaw) : 0,
                compare_at_price: compareRaw ? parseFloat(compareRaw) : null,
                inventory_quantity: qtyRaw ? parseInt(qtyRaw, 10) || 0 : 0,
                requires_shipping: String(row['Variant Requires Shipping'] || '').toLowerCase() === 'true',
                taxable: String(row['Variant Taxable'] || '').toLowerCase() === 'true'
            };

            const variantImage = row['Variant Image'] || row['Image Src'];
            if (variantImage) {
                variant.image = {
                    src: variantImage.trim(),
                    alt: row['Image Alt Text'] || ''
                };
            }

            return variant;
        }).filter(v => v.price && !Number.isNaN(v.price));

        if (variants.length === 0) continue;

        const mainImageSrc = (primary['Image Src'] || primary['Variant Image'] || '').trim();

        const ratingRaw = primary['Anzahl an Produktbewertungen (product.metafields.reviews.rating_count)'];
        const ratingCount = ratingRaw ? parseInt(ratingRaw, 10) || 0 : 0;

        const product = {
            handle,
            title: primary['Title'] || handle,
            body_html: primary['Body (HTML)'] || '<p></p>',
            vendor: primary['Vendor'] || '',
            product_category: primary['Product Category'] || '',
            type: primary['Type'] || '',
            tags: primary['Tags'] || '',
            published: String(primary['Published'] || '').toLowerCase() === 'true',
            options: options.length > 0 ? options : undefined,
            variants,
            image: mainImageSrc
                ? { src: mainImageSrc, alt: primary['Image Alt Text'] || '' }
                : { src: variants[0].image ? variants[0].image.src : '', alt: '' },
            rating_count: ratingCount,
            status: 'active'
        };

        products.push(product);
    }

    return products;
}

function generateProductsJs(products) {
    const lines = [];
    lines.push('// AUTO-GENERATED from products_export_1 (7).csv - do not edit manually');
    lines.push('const products = [');

    products.forEach((p, index) => {
        lines.push('    {');
        lines.push(`        handle: '${jsStringEscape(p.handle)}',`);
        lines.push(`        title: '${jsStringEscape(p.title)}',`);
        lines.push(`        body_html: '${jsStringEscape(p.body_html)}',`);
        lines.push(`        vendor: '${jsStringEscape(p.vendor)}',`);
        lines.push(`        product_category: '${jsStringEscape(p.product_category)}',`);
        lines.push(`        type: '${jsStringEscape(p.type)}',`);
        lines.push(`        tags: '${jsStringEscape(p.tags)}',`);
        lines.push(`        published: ${p.published},`);

        if (p.options && p.options.length > 0) {
            lines.push('        options: [');
            p.options.forEach(opt => {
                const values = opt.values.map(v => `'${jsStringEscape(v)}'`).join(', ');
                lines.push('            {');
                lines.push(`                name: '${jsStringEscape(opt.name)}',`);
                lines.push(`                values: [${values}]`);
                lines.push('            },');
            });
            lines.push('        ],');
        }

        lines.push('        variants: [');
        p.variants.forEach(v => {
            lines.push('            {');
            if (v.option1) lines.push(`                option1: '${jsStringEscape(v.option1)}',`);
            if (v.option2) lines.push(`                option2: '${jsStringEscape(v.option2)}',`);
            if (v.option3) lines.push(`                option3: '${jsStringEscape(v.option3)}',`);
            lines.push(`                price: ${v.price},`);
            lines.push(`                compare_at_price: ${v.compare_at_price != null ? v.compare_at_price : 'null'},`);
            lines.push(`                inventory_quantity: ${v.inventory_quantity},`);
            lines.push(`                requires_shipping: ${v.requires_shipping},`);
            lines.push(`                taxable: ${v.taxable},`);
            if (v.image && v.image.src) {
                lines.push('                image: {');
                lines.push(`                    src: '${jsStringEscape(v.image.src)}',`);
                lines.push(`                    alt: '${jsStringEscape(v.image.alt || '')}'`);
                lines.push('                },');
            }
            lines.push('            },');
        });
        lines.push('        ],');

        lines.push('        image: {');
        lines.push(`            src: '${jsStringEscape(p.image.src || '')}',`);
        lines.push(`            alt: '${jsStringEscape(p.image.alt || '')}'`);
        lines.push('        },');
        lines.push(`        rating_count: ${p.rating_count || 0},`);
        lines.push(`        status: '${jsStringEscape(p.status)}'`);
        lines.push('    },');
    });

    lines.push('];');
    lines.push('');
    lines.push('if (typeof module !== "undefined" && module.exports) {');
    lines.push('    module.exports = { products };');
    lines.push('} else {');
    lines.push('    window.shopifyProducts = products;');
    lines.push('}');
    lines.push('');
    lines.push('function fetchProducts() {');
    lines.push('    return new Promise((resolve) => {');
    lines.push('        setTimeout(() => {');
    lines.push('            resolve(products);');
    lines.push('        }, 0);');
    lines.push('    });');
    lines.push('}');
    lines.push('');
    lines.push('if (typeof window !== "undefined") {');
    lines.push('    window.fetchProducts = fetchProducts;');
    lines.push('}');

    return lines.join('\n');
}

function main() {
    const csvPath = path.join(__dirname, '..', 'products_export_1 (7).csv');
    const outPath = path.join(__dirname, '..', 'public', 'js', 'data', 'products.js');

    console.log('Reading CSV from', csvPath);
    const products = buildProductsFromCsv(csvPath);
    console.log(`Found ${products.length} active products`);

    const js = generateProductsJs(products);
    fs.writeFileSync(outPath, js, 'utf8');
    console.log('Updated products file at', outPath);
}

if (require.main === module) {
    main();
}
