# 🔍 STRIPE CHECKOUT DEBUG INSTRUCTIONS

## The error appears briefly then disappears - here's how to debug:

### **Step 1: Open Browser Console**
Mobile (use desktop browser in mobile mode):
1. Open Chrome/Safari on desktop
2. Press F12 (Chrome) or Cmd+Opt+I (Safari)
3. Click "Toggle device toolbar" (phone icon)
4. Select iPhone or Android device
5. Go to checkout page

### **Step 2: Watch for these console messages:**

**✅ GOOD messages (should see):**
```
🚀 Checkout page loaded
🛒 Cart items: X
🔑 Initializing Stripe with key: pk_live_...
✅ Stripe initialized
💳 Starting Stripe payment initialization...
📡 Creating PaymentIntent...
📡 Response status: 200
📦 Full response: { clientSecret: "..." }
🔑 ClientSecret received: pi_...
🎨 Creating Stripe Elements with appearance...
✅ Elements instance created
🚀 Creating Express Checkout Element...
✅ Express Checkout Element mounted
🚀 Creating Payment Element...
🔧 Mounting payment element...
✅ Payment Element mounted
✅ Payment Element ready - payment methods loaded
```

**❌ BAD messages (what's failing):**
```
❌ Invalid clientSecret
❌ API Error: ...
❌ Payment Element load error: ...
❌ Error creating Stripe Elements: ...
❌ Payment iframe NOT found!
```

### **Step 3: Check specific errors**

#### **If you see:**
`❌ API Error: 503` or `Payment system not configured`
**Fix:** Server is not running OR Stripe keys missing in .env

#### **If you see:**
`❌ Payment Element load error: { type: "validation_error", ... }`
**Fix:** PaymentIntent amount or currency invalid

#### **If you see:**
`❌ Payment iframe NOT found!`
**Fix:** CSS is hiding the iframe or mount failed

#### **If you see:**
`❌ Invalid clientSecret`
**Fix:** Server returned bad clientSecret format

### **Step 4: Check Network Tab**

1. Go to "Network" tab in console
2. Filter by "payment-intents"
3. Look for POST request to `/api/payment-intents`
4. Check:
   - Status: Should be 200
   - Response: Should have `{ clientSecret: "pi_..." }`

**If Status is 500/503:**
- Server error - check server.js logs
- Stripe API key invalid

**If Response is missing clientSecret:**
- Server not returning correct format
- Check server.js `/api/payment-intents` endpoint

### **Step 5: Check Stripe Dashboard**

1. Go to https://dashboard.stripe.com
2. Click "Payments" → "All Payments"
3. Look for recent incomplete payments

**If payments exist:**
- PaymentIntent IS being created ✅
- Issue is with Elements mounting/loading
- Likely CSS or Stripe.js issue

**If no payments:**
- API call failing
- Check server logs

### **Step 6: Send me this info:**

**Screenshot of Console showing:**
1. All messages from checkout load to error
2. Network tab showing `/api/payment-intents` response
3. Elements tab showing `#payment-element` and `#express-checkout-element` HTML

**Tell me:**
1. What's the LAST ✅ message you see?
2. What's the FIRST ❌ message you see?
3. Does error stay visible or disappear?
4. Do you see any iframes in Elements inspector?

---

## 🔧 QUICK FIXES TO TRY:

### **Fix 1: Clear cache**
```
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### **Fix 2: Check if server is running**
```bash
# In terminal:
node server.js

# Should see:
Server running on port 3000
✅ Stripe configured: Yes
```

### **Fix 3: Verify .env has Stripe keys**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### **Fix 4: Test with Stripe test keys**
Replace in checkout-shopify.js line 2:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51...'; // Use test key
```

Test keys always work - if this loads, issue is with live keys.

---

## 🎯 MOST LIKELY CAUSES (based on your error):

1. **CSS hiding iframe** - I added min-height rules to fix this
2. **Stripe API validation error** - PaymentIntent created but invalid
3. **Network/CORS issue** - Stripe CDN blocked on mobile
4. **Currency/amount issue** - Stripe rejecting the payment amount

**With the new fixes:**
- Error won't auto-hide (stays visible)
- Detailed error shown in console
- Error shown in payment box itself

**Try checkout again and send me screenshot of the error that stays visible!**
