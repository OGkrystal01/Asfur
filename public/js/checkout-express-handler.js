// Payment Method Branding Handler
// Updates submit button appearance based on selected payment method

function handlePaymentMethodChange(event) {
    console.log('💳 Payment method changed:', event);
    
    const submitBtn = document.getElementById('submit-btn');
    
    // Check payment type
    const paymentType = event.value?.type || event.value?.paymentMethod?.type;
    
    console.log('Payment type selected:', paymentType);
    
    // Track AddPaymentInfo event with Meta Pixel
    if (window.metaPixel && typeof window.metaPixel.trackAddPaymentInfo === 'function') {
        console.log('📊 Tracking AddPaymentInfo event...');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        window.metaPixel.trackAddPaymentInfo(cart);
    }
    
    // Update submit button branding based on payment method
    if (submitBtn) {
        if (paymentType === 'apple_pay') {
            submitBtn.innerHTML = `
                <span style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg width="20" height="24" viewBox="0 0 24 28" fill="white">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span>Pay with Apple Pay</span>
                </span>
            `;
            submitBtn.style.background = '#000';
            submitBtn.style.color = '#fff';
            submitBtn.style.fontSize = '17px';
            submitBtn.style.fontWeight = '500';
        } else if (paymentType === 'google_pay') {
            submitBtn.innerHTML = `
                <svg width="42" height="17" viewBox="0 0 42 17" fill="white" style="margin-right: 8px;">
                    <path d="M19.526 7.727v3.91h-.933V.64h2.463c.604 0 1.122.203 1.558.608.435.404.653.893.653 1.465 0 .572-.218 1.062-.653 1.467-.436.404-.954.607-1.558.607h-1.53zm0-6.154v2.363h1.574c.351 0 .647-.114.886-.341a1.13 1.13 0 00.359-.848c0-.336-.12-.618-.359-.848a1.226 1.226 0 00-.886-.341h-1.574v.015zm6.555 4.068c-.652 0-1.208.217-1.667.653-.459.435-.688.99-.688 1.665s.229 1.23.688 1.665c.459.436 1.015.653 1.667.653.338 0 .66-.073.965-.217.305-.145.545-.337.72-.577l.731.731c-.508.608-1.215.912-2.116.912-.851 0-1.574-.277-2.167-.833-.594-.555-.89-1.26-.89-2.115 0-.855.296-1.56.89-2.115.593-.556 1.316-.833 2.167-.833.901 0 1.608.304 2.116.912l-.731.731c-.175-.24-.415-.432-.72-.577a2.066 2.066 0 00-.965-.217v.001zm5.405-.607c.653 0 1.172.203 1.559.608.386.404.579.965.579 1.682v3.313h-.89V11.51h-.044c-.394.58-1.015.87-1.863.87-.653 0-1.186-.174-1.6-.522-.413-.348-.62-.79-.62-1.325 0-.544.207-.982.62-1.34.414-.357.947-.536 1.6-.536.77 0 1.365.203 1.787.608v-.434c0-.413-.16-.776-.48-1.089a1.653 1.653 0 00-1.163-.467c-.696 0-1.235.304-1.617.913l-.817-.512c.545-.847 1.322-1.27 2.347-1.27h.001zm-1.572 4.43c0 .305.13.557.392.757.261.2.584.3.965.3.522 0 .99-.188 1.399-.565.41-.377.615-.823.615-1.341-.35-.435-.965-.652-1.846-.652-.426 0-.783.109-1.073.326-.29.217-.436.494-.436.826l-.016.35zm5.354-8.46h.89V12h-.89V1.003zm4.917 6.916l2.72-6.35h1.015l-3.694 8.426h-.89l1.365-2.947-2.347-5.48h1.015l1.816 4.351z"/>
                </svg>
                Pay with Google Pay
            `;
            submitBtn.style.background = '#000';
            submitBtn.style.color = '#fff';
            submitBtn.style.fontSize = '17px';
            submitBtn.style.fontWeight = '500';
        } else if (paymentType === 'klarna') {
            submitBtn.textContent = 'Mit Klarna Bezahlen';
            submitBtn.style.background = '#FFB3C7';
            submitBtn.style.color = '#000';
            submitBtn.style.fontSize = '18px';
            submitBtn.style.fontWeight = '700';
        } else if (paymentType === 'paypal') {
            submitBtn.textContent = 'Mit PayPal bezahlen';
            submitBtn.style.background = '#0070BA';
            submitBtn.style.color = '#fff';
            submitBtn.style.fontSize = '16px';
            submitBtn.style.fontWeight = '600';
        } else {
            // Reset to default for card payment
            submitBtn.textContent = 'Bestellung überprüfen';
            submitBtn.style.background = '';
            submitBtn.style.color = '';
            submitBtn.style.fontSize = '';
            submitBtn.style.fontWeight = '';
        }
    }
    
    console.log('✅ Submit button updated for payment type:', paymentType);
}
