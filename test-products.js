const {products} = require('./public/js/data/products.js');

console.log('✅ Products loaded:', products.length);
console.log('✅ Total variants:', products.reduce((sum, p) => sum + p.variants.length, 0));
console.log('\n📦 First 5 products:');
products.slice(0, 5).forEach(p => {
    console.log(`   - ${p.title} (${p.variants.length} variant${p.variants.length !== 1 ? 's' : ''})`);
});
console.log('\n🎉 All products loaded successfully!');
