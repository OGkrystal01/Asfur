# Discount Code Payment Amount Fixed ✅

## Problem:

When applying a discount code:
- ❌ Amount updated visually on checkout page
- ❌ But Stripe tried to charge the ORIGINAL amount (before discount)
- ❌ Payment intent was created only once on page load (before discount applied)

## Root Cause:

Payment intent was created in `initializeStripePayment()` which runs once when page loads. When user applied discount later, the visual totals updated but the payment intent still had the old amount.

## Solution:

**Reinitialize payment intent when discount is applied:**

1. Unmount existing payment element
2. Create new payment intent with discounted amount
3. Mount new payment element with correct amount

### Changes Made:

#### 1. Made `applyDiscount()` Async & Reinitialize Payment

**Before:**
```javascript
function applyDiscount(source) {
    // ... validation ...
    
    if (DISCOUNT_CODES[code]) {
        appliedDiscount = DISCOUNT_CODES[code];
        updateTotals();  // Only visual update
        showMessage(`Rabattcode "${code}" angewendet!`, false);
        input.value = '';
        // ❌ Payment intent still has old amount!
    }
}
```

**After:**
```javascript
async function applyDiscount(source) {
    // ... validation ...
    
    if (DISCOUNT_CODES[code]) {
        appliedDiscount = DISCOUNT_CODES[code];
        updateTotals();  // Visual update
        showMessage(`Rabattcode "${code}" angewendet!`, false);
        input.value = '';
        
        // ✅ Reinitialize payment intent with new amount
        console.log('🔄 Reinitializing payment intent with discount...');
        await initializeStripePayment();
    }
}
```

#### 2. Added Unmount Logic to `initializeStripePayment()`

**Before:**
```javascript
async function initializeStripePayment() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // ❌ Just creates new payment intent without cleaning up old one
    try {
        // ... create payment intent ...
    }
}
```

**After:**
```javascript
async function initializeStripePayment() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // ✅ Unmount existing payment element first
    if (paymentElement) {
        console.log('🔄 Unmounting existing payment element...');
        try {
            paymentElement.unmount();
            paymentElement = null;
        } catch (unmountError) {
            console.warn('⚠️ Error unmounting payment element:', unmountError);
        }
    }
    
    try {
        // Calculate total with discount
        let subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        let discountAmount = 0;
        
        if (appliedDiscount) {
            if (appliedDiscount.type === 'percentage') {
                discountAmount = subtotal * (appliedDiscount.value / 100);
            }
        }
        
        const total = Math.max(0, subtotal - discountAmount);
        
        // ✅ Create new payment intent with correct amount
        const response = await fetch('/api/payment-intents', {
            method: 'POST',
            body: JSON.stringify({
                cartItems: cart,
                discountCode: appliedDiscount ? Object.keys(DISCOUNT_CODES).find(key => DISCOUNT_CODES[key] === appliedDiscount) : null,
                discountAmount: discountAmount,
                finalTotal: total  // ✅ Uses discounted total!
            })
        });
        
        // ... mount new payment element ...
    }
}
```

## How It Works Now:

### User Flow:

1. **Page loads:**
   - Payment intent created with cart total
   - Payment element mounted
   - Amount: €1000 (example)

2. **User enters discount code `TEST95`:**
   - Visual totals update: €1000 → €50
   - `applyDiscount()` called
   - Old payment element unmounted
   - **New payment intent created with €50**
   - New payment element mounted
   - ✅ Stripe now charges €50!

3. **User clicks submit:**
   - ✅ Stripe processes payment for €50
   - ✅ Correct discounted amount charged

### API Request:

**Without Discount:**
```json
{
  "cartItems": [...],
  "discountCode": null,
  "discountAmount": 0,
  "finalTotal": 1000  // Original amount
}
```

**With TEST95 Discount:**
```json
{
  "cartItems": [...],
  "discountCode": "TEST95",
  "discountAmount": 950,
  "finalTotal": 50  // ✅ Discounted amount!
}
```

## Console Logs to Verify:

When applying discount, you'll see:
```
🔄 Reinitializing payment intent with discount...
💳 initializeStripePayment called, cart length: 1
🔄 Unmounting existing payment element...
💰 Total amount: 50 EUR ( 5000 cents)
📡 Creating PaymentIntent...
📦 Request data: {finalTotal: 50, discountAmount: 950}
✅ Payment element reinitialized
```

## Testing:

### Test with TEST95:

1. Add item for €1000 to cart
2. Go to checkout
3. See total: €1000
4. Enter discount code: `TEST95`
5. Click "Anwenden"
6. ✅ Visual total updates: €50
7. ✅ Console shows: "Reinitializing payment intent"
8. ✅ Payment element reloads (brief flash)
9. Fill out form and submit
10. ✅ Stripe charges €50 (not €1000!)

### Verify in Stripe Dashboard:

1. Complete payment with discount
2. Check Stripe dashboard
3. ✅ Payment intent shows €50
4. ✅ Metadata includes discount code "TEST95"
5. ✅ Metadata shows discountAmount: 950

## Files Modified:

**checkout-shopify.js:**
1. Changed `applyDiscount()` to async function
2. Added `await initializeStripePayment()` call after discount applied
3. Added unmount logic at start of `initializeStripePayment()`
4. Discount code fixed: `test95` → `TEST95` (uppercase)

## Fixed Discount Code:

Also fixed the discount code case sensitivity issue:
- Code stored as: `TEST95` (uppercase)
- User can enter: `test95` or `TEST95` (auto-converts to uppercase)
- ✅ Works now!

## Deploy:

```bash
git add .
git commit -m "Fixed: discount code now updates Stripe payment amount, not just visual"
git push origin main
```

## Summary:

✅ **Discount updates visual totals**  
✅ **Discount recreates payment intent with new amount**  
✅ **Stripe charges discounted amount**  
✅ **TEST95 code works (95% off)**  
✅ **No more charging wrong amount!**

**Test it - apply TEST95 and complete payment. Stripe should charge 5% of original price!** 🎉
