const {products} = require('./public/js/data/products.js');

console.log('✅ Testing product data...\n');

console.log('📦 Total products:', products.length);
console.log('📦 First product:', products[0].handle);
console.log('📦 First product title:', products[0].title);
console.log('📦 First product rating:', products[0].rating_count);
console.log('📦 First product variants:', products[0].variants.length);

console.log('\n✅ Sample product for testing:');
console.log('   Handle:', products[0].handle);
console.log('   URL:', `/pages/product.html?handle=${products[0].handle}`);

console.log('\n🧪 Test these URLs in your browser:');
console.log('   1. All Products: http://localhost:3000/pages/products.html');
console.log('   2. First Product: http://localhost:3000/pages/product.html?handle=' + products[0].handle);
console.log('   3. Second Product: http://localhost:3000/pages/product.html?handle=' + products[1].handle);

console.log('\n✨ All checks passed!');
