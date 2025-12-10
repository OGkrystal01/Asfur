# Minimum Amount Error Fixed ✅

## Problem:

After applying discount code, payment methods wouldn't load:
- Error: "Amount below minimum 0.50 cents"
- But actual amount was €2.75 (275 cents) - well above minimum!
- Stripe requires minimum 50 cents

## Root Cause:

**Double discount subtraction!**

### What Was Happening:

1. **Client calculates final total:**
   - Cart subtotal: €55.00
   - Discount (95%): -€52.25
   - Final total: €2.75
   - Sends to server: `finalTotal: 2.75, discountAmount: 52.25`

2. **Server received and processed:**
   ```javascript
   let amount = finalTotal;  // 2.75
   
   // ❌ SUBTRACTING DISCOUNT AGAIN!
   if (discountAmount && discountAmount > 0) {
       amount -= discountAmount;  // 2.75 - 52.25 = -49.50
   }
   
   amount = Math.max(0, amount);  // -49.50 → 0
   const amountInCents = Math.round(amount * 100);  // 0 cents
   ```

3. **Result:**
   - Server tried to create payment intent for **0 cents**
   - Stripe rejected: "Minimum is 50 cents"
   - Payment methods didn't load

### The Bug:

**Client sent `finalTotal` that was ALREADY discounted, but server subtracted discount AGAIN!**

Result: €2.75 - €52.25 = -€49.50 → €0.00 = 0 cents ❌

## Solution:

**Don't subtract discount again if `finalTotal` is already provided (it's already calculated with discount).**

### Fixed Server Code:

**Before:**
```javascript
// Calculate total amount
let amount = finalTotal || cartItems.reduce((sum, item) => {
    const itemTotal = parseFloat(item.price) * (item.quantity || 1);
    return sum + itemTotal;
}, 0);

// ❌ Apply discount if provided (DOUBLE SUBTRACTION!)
if (discountAmount && discountAmount > 0) {
    amount -= discountAmount;  // Subtracting already-subtracted discount!
}

amount = Math.max(0, amount);
const amountInCents = Math.round(amount * 100);
```

**After:**
```javascript
// Calculate total amount
// If finalTotal is provided, it's already calculated with discount applied
let amount;
if (finalTotal !== undefined && finalTotal !== null) {
    amount = finalTotal;  // ✅ Already includes discount!
    console.log('💰 Using provided finalTotal:', amount, 'EUR (already includes discount)');
} else {
    // Calculate from cart items (fallback)
    amount = cartItems.reduce((sum, item) => {
        const itemTotal = parseFloat(item.price) * (item.quantity || 1);
        return sum + itemTotal;
    }, 0);
    
    // Only apply discount if we calculated from cart items
    if (discountAmount && discountAmount > 0) {
        amount -= discountAmount;
    }
}

amount = Math.max(0, amount);
const amountInCents = Math.round(amount * 100);
```

## How It Works Now:

### Scenario: Cart €55, Discount TEST95 (95% off)

#### Client Side:
```javascript
subtotal = 55.00
discountAmount = 55.00 * 0.95 = 52.25
finalTotal = 55.00 - 52.25 = 2.75

// Send to server
fetch('/api/payment-intents', {
    body: JSON.stringify({
        cartItems: [...],
        discountAmount: 52.25,
        finalTotal: 2.75  // ← Already discounted!
    })
})
```

#### Server Side:
```javascript
// Receive from client
finalTotal = 2.75
discountAmount = 52.25

// ✅ Use finalTotal directly (already discounted)
amount = finalTotal;  // 2.75

// ✅ Don't subtract discount again!

amountInCents = Math.round(2.75 * 100);  // 275 cents
```

#### Stripe:
```javascript
stripe.paymentIntents.create({
    amount: 275,  // ✅ 275 cents = €2.75
    currency: 'eur'
})
// ✅ Success! Above 50 cent minimum
```

## Testing:

### Test with TEST95 Discount:

1. Add item for €55 to cart
2. Go to checkout
3. Enter discount: `TEST95`
4. Click "Anwenden"
5. ✅ Visual total: €2.75
6. ✅ Payment methods load successfully
7. ✅ Console shows: "Creating PaymentIntent for: 275 cents (2.75 EUR)"
8. ✅ Can select payment method
9. Complete payment
10. ✅ Stripe charges €2.75 (not €0!)

### Console Logs to Verify:

**Client:**
```
💰 Total amount: 2.75 EUR ( 275 cents)
📡 Creating PaymentIntent...
📦 Request data: {finalTotal: 2.75, discountAmount: 52.25}
```

**Server:**
```
Payment Intent request received: {finalTotal: 2.75, discountAmount: 52.25, ...}
💰 Using provided finalTotal: 2.75 EUR (already includes discount)
💰 Creating PaymentIntent for: 275 cents ( 2.75 EUR)
✅ PaymentIntent created successfully
```

## Edge Cases Handled:

### 1. No Discount:
```javascript
finalTotal = 55.00
discountAmount = 0

// Server uses finalTotal: 55.00
// Amount: 5500 cents ✅
```

### 2. No finalTotal Provided (Fallback):
```javascript
// If old client doesn't send finalTotal
finalTotal = undefined

// Server calculates from cart
amount = cartItems.reduce(...)  // 55.00
amount -= discountAmount  // 55.00 - 52.25 = 2.75
// Amount: 275 cents ✅
```

### 3. 100% Discount:
```javascript
finalTotal = 0
discountAmount = 55.00

// Server uses finalTotal: 0
// Amount: 0 cents
// ❌ Stripe rejects (below 50 cent minimum)
// ✅ Handled by validation
```

## Files Modified:

**server.js:**
- Fixed payment intent creation logic
- Only subtracts discount if `finalTotal` not provided
- Uses `finalTotal` directly when available (already includes discount)
- Added console log for clarity

## Deploy:

```bash
git add .
git commit -m "Fixed: double discount subtraction causing 0 cent payment intent"
git push origin main
```

## Summary:

❌ **Before:** Server subtracted discount twice → 0 cents → Error  
✅ **After:** Server uses pre-calculated finalTotal → Correct amount → Works!

**Problem:** Double subtraction  
**Solution:** Trust the client's finalTotal (already discounted)  
**Result:** €2.75 correctly becomes 275 cents ✅

**Test it - payment methods should load now with TEST95 discount!** 🎉
