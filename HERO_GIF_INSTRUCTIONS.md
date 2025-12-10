# Hero Banner GIF/Video Upload Instructions

## 📍 Where to Upload Your Bags GIF

Upload your animated GIF or video file to:
```
c:\Users\Steve\OneDrive\Desktop\resell-depot.eth\public\images\hero\bags-hero.gif
```

## 📐 Recommended Specifications

### For GIF:
- **Dimensions**: 1920x1080px (Full HD) or 1600x900px minimum
- **File Size**: Keep under 5MB for fast loading
- **Frame Rate**: 15-30 FPS
- **Loop**: Set to infinite loop
- **Optimization**: Use tools like Giphy, ezgif.com, or Photoshop to optimize

### For Video (Alternative):
If you want to use MP4 instead of GIF for better quality:
1. Upload to: `public/images/hero/bags-hero.mp4`
2. Update `index.html` line 82 from:
   ```html
   background: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('images/hero/bags-hero.gif');
   ```
   To use video background, you'll need to add a `<video>` element instead.

## 🎨 Content Suggestions

Your GIF should showcase:
- ✨ Luxury designer bags in elegant lighting
- 🔄 Smooth rotation or showcase of different bags
- 💼 Close-up details of craftsmanship
- 📦 Premium packaging (optional)
- 🏷️ Mix of popular brands (Hermès, LV, Chanel, Gucci, Dior)

## 🚀 Quick Setup

1. **Prepare your GIF** (resize, optimize, add overlay if needed)
2. **Name it**: `bags-hero.gif`
3. **Upload to**: `public/images/hero/` folder
4. **Test**: Refresh homepage to see it in action

## 💡 Tips

- **Dark overlay**: The CSS already adds a 65% dark overlay, so ensure your gif is bright enough
- **Text readability**: Text on hero is white, ensure GIF doesn't have too much white/bright areas in center
- **Mobile**: GIF will be cropped on mobile, keep important content centered
- **Loading**: Consider having a static fallback image for slower connections

## 🔧 Current Hero Text

The hero currently displays:
```
Luxury 1:1 Designer Bags
Premium Quality, Authentic Packaging, Indistinguishable Craftsmanship
[Shop Collection Button]
```

If you want to change this text, edit `public/index.html` lines 84-86.

## ✅ Checklist

- [ ] GIF created/obtained
- [ ] Optimized to under 5MB
- [ ] Uploaded to correct folder
- [ ] Named correctly: `bags-hero.gif`
- [ ] Tested on homepage
- [ ] Checked mobile view
- [ ] Verified text is readable over GIF

---

**Need help optimizing your GIF?**
- Use: https://ezgif.com/optimize
- Or: https://www.adobe.com/express/feature/image/gif-compressor
