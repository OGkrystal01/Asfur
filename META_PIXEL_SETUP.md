# Meta (Facebook) Pixel Setup Guide

## 🎯 Complete Integration for Sales Optimization

Your Meta Pixel has been fully integrated to track the complete customer journey and optimize for conversions!

---

## 📋 Step 1: Get Your Meta Pixel ID

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Click **"Connect Data Sources"** → **"Web"** → **"Meta Pixel"**
3. Name your pixel (e.g., "Aurelia-Bags Store")
4. Copy your **Pixel ID** (looks like: `1234567890123456`)

---

## 🔧 Step 2: Configure Your Pixel ID

Open this file: `public/js/meta-pixel.js`

Replace this line:
```javascript
const META_PIXEL_ID = 'YOUR_PIXEL_ID';
```

With your actual Pixel ID:
```javascript
const META_PIXEL_ID = '1234567890123456';
```

**That's it!** The pixel is now active across your entire site.

---

## 📊 Events Being Tracked

Your site now automatically tracks these Meta Pixel events:

### 1. **PageView** 
- Tracked on: Every page
- When: Page loads
- Use: Track site traffic

### 2. **ViewContent**
- Tracked on: Product pages
- When: Customer views a product
- Data sent: Product title, handle, price
- Use: Retarget product viewers

### 3. **AddToCart**
- Tracked on: Product pages
- When: Customer clicks "Add to Cart"
- Data sent: Product info, price, quantity
- Use: Retarget cart abandoners

### 4. **InitiateCheckout**
- Tracked on: Checkout page
- When: Customer lands on checkout
- Data sent: Cart items, total value
- Use: Optimize for checkout starts

### 5. **Purchase** ⭐ (MOST IMPORTANT)
- Tracked on: Order confirmation page
- When: Payment successful
- Data sent: Order value, items, order number
- Use: **Optimize for conversions & track ROAS**

---

## 🎯 Setting Up Ads for Sales Optimization

### Create a Conversion Campaign:

1. **In Facebook Ads Manager:**
   - Campaign objective: **"Sales"**
   - Optimization event: **"Purchase"**
   - Pixel: Select your pixel

2. **Ad Set Level:**
   - Conversion location: **Website**
   - Conversion event: **Purchase**
   - Pixel: Your pixel will auto-populate

3. **Budget & Bidding:**
   - Start with at least €50/day for optimal learning
   - Bid strategy: **"Lowest cost"** (automatic)
   - Let the algorithm learn for 7 days

### Pro Tips:

✅ **Wait for 50+ conversions** before making major changes
✅ **Use Dynamic Ads** to retarget product viewers
✅ **Create Custom Audiences:**
   - Viewed content (last 30 days)
   - Added to cart (last 7 days)
   - Initiated checkout (last 3 days)
   - Purchased (exclude from cold traffic)

---

## 🔍 Verify Pixel is Working

### Method 1: Meta Pixel Helper (Chrome Extension)
1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper)
2. Visit your website
3. Click the extension icon
4. You should see your pixel firing

### Method 2: Events Manager
1. Go to Events Manager
2. Click on your pixel
3. View **"Recent Events"**
4. Test a purchase and verify the event appears

### Method 3: Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. You should see logs like:
   - `✅ Meta Pixel initialized: 1234567890123456`
   - `📊 Meta Pixel: ViewContent tracked`
   - `📊 Meta Pixel: Purchase tracked - €XX.XX`

---

## 📈 Expected Results

After setup, you should see:

**Week 1-2:**
- Pixel collecting data
- Learning phase active
- Higher CPA (Cost Per Acquisition)

**Week 3-4:**
- Algorithm optimized
- Lower CPA
- More consistent conversions

**Week 5+:**
- Stable performance
- Retargeting campaigns effective
- Scale campaigns confidently

---

## 🎨 Advanced: Custom Conversions

In Events Manager, create custom conversions:

1. **High-Value Purchases** (Orders > €100)
2. **First-Time Customers**
3. **Repeat Customers**
4. **Specific Product Categories**

Use these to optimize different campaigns for different goals.

---

## ⚠️ Important Notes

### Privacy & Compliance:
- ✅ Your pixel respects GDPR
- ✅ Consider adding cookie consent banner
- ✅ Update privacy policy to mention Facebook tracking

### Testing:
1. Test a full purchase flow
2. Check Events Manager for the Purchase event
3. Verify order value matches actual price

### Troubleshooting:
- **No events showing?** Check console for errors
- **Wrong values?** Verify product prices in products.js
- **Events not firing?** Clear browser cache and test in incognito

---

## 🚀 Quick Start Checklist

- [ ] Get Pixel ID from Meta Events Manager
- [ ] Update `META_PIXEL_ID` in `/public/js/meta-pixel.js`
- [ ] Install Meta Pixel Helper extension
- [ ] Test purchase flow end-to-end
- [ ] Verify Purchase event in Events Manager
- [ ] Create Facebook Ads campaign with Purchase objective
- [ ] Set budget and launch
- [ ] Monitor for 7 days before optimizing

---

## 📞 Need Help?

Check:
- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Facebook Ads Help Center](https://www.facebook.com/business/help)
- Your browser console for error messages

**Your pixel is ready! Just add your Pixel ID and start tracking conversions! 🎉**
