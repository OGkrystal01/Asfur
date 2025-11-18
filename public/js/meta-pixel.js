// Meta (Facebook) Pixel Integration
// Meta Pixel ID configured for Dupelify

const META_PIXEL_ID = '3013171445524064';

// Initialize Meta Pixel
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

// Initialize pixel with your ID
if (META_PIXEL_ID && META_PIXEL_ID !== 'YOUR_PIXEL_ID') {
    fbq('init', META_PIXEL_ID);
    console.log('✅ Meta Pixel initialized:', META_PIXEL_ID);
} else {
    console.warn('⚠️ Meta Pixel ID not configured. Please update META_PIXEL_ID in meta-pixel.js');
}

// Track page view on all pages
fbq('track', 'PageView');

// Helper function to track view content (product pages)
function trackViewContent(productData) {
    if (typeof fbq === 'undefined') return;
    
    fbq('track', 'ViewContent', {
        content_name: productData.title,
        content_ids: [productData.handle || productData.id],
        content_type: 'product',
        value: parseFloat(productData.price) || 0,
        currency: 'EUR'
    });
    console.log('📊 Meta Pixel: ViewContent tracked', productData.title);
}

// Helper function to track add to cart
function trackAddToCart(item) {
    if (typeof fbq === 'undefined') return;
    
    fbq('track', 'AddToCart', {
        content_name: item.title,
        content_ids: [item.handle || item.id],
        content_type: 'product',
        value: parseFloat(item.price) * (item.quantity || 1),
        currency: 'EUR'
    });
    console.log('📊 Meta Pixel: AddToCart tracked', item.title);
}

// Helper function to track initiate checkout
function trackInitiateCheckout(cart) {
    if (typeof fbq === 'undefined') return;
    
    const value = cart.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    const content_ids = cart.map(item => item.handle || item.id);
    
    fbq('track', 'InitiateCheckout', {
        content_ids: content_ids,
        content_type: 'product',
        value: value,
        currency: 'EUR',
        num_items: cart.length
    });
    console.log('📊 Meta Pixel: InitiateCheckout tracked', value);
}

// Helper function to track purchase (order confirmation page)
function trackPurchase(orderData) {
    if (typeof fbq === 'undefined') return;
    
    const content_ids = orderData.items.map(item => item.handle || item.id || item.title);
    
    fbq('track', 'Purchase', {
        content_ids: content_ids,
        content_type: 'product',
        value: orderData.total,
        currency: 'EUR',
        num_items: orderData.items.length
    });
    console.log('📊 Meta Pixel: Purchase tracked - €' + orderData.total);
}

// Make functions globally available
window.metaPixel = {
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase
};
