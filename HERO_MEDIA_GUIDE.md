# 🎬 Hero Banner - GIF or Video Guide

## 📍 **Where to Place Your Files:**

Place your media files here:
```
public/images/hero/
```

---

## **Option 1: GIF File** 🖼️

### **File Name:**
```
bags-hero.gif
```

### **Full Path:**
```
public/images/hero/bags-hero.gif
```

### **Recommended Size:**
- Width: 1920px
- Height: 1080px (or 800-1200px)
- File size: Under 5MB (GIFs can be large!)

### **What's Already Set Up:**
✅ Your hero section now has a `<video>` tag  
✅ It has a **GIF fallback** built in  
✅ If video doesn't load, GIF shows automatically  

---

## **Option 2: Video File (MP4)** 🎥 **Recommended!**

### **File Name:**
```
bags-hero.mp4
```

### **Full Path:**
```
public/images/hero/bags-hero.mp4
```

### **Why Video is Better:**
✅ Much smaller file size (MP4 is 10x smaller than GIF)  
✅ Better quality  
✅ Faster loading  
✅ Auto-plays and loops  
✅ Muted by default (no sound issues)  

### **Recommended Settings:**
- Width: 1920px
- Height: 1080px
- Format: MP4 (H.264 codec)
- Bitrate: 3-5 Mbps
- File size: 1-3MB
- Duration: 5-15 seconds (will loop)

---

## **What Your Code Does Now:**

```html
<video autoplay muted loop playsinline>
    <source src="images/hero/bags-hero.mp4" type="video/mp4">
    <!-- If MP4 fails, shows GIF -->
    <img src="images/hero/bags-hero.gif">
</video>
```

**Attributes Explained:**
- `autoplay` - Starts automatically
- `muted` - No sound (required for autoplay)
- `loop` - Repeats forever
- `playsinline` - Plays on mobile without fullscreen

---

## **Quick Setup Steps:**

### **Using Video (Recommended):**

1. **Convert your GIF to MP4** (if you have a GIF):
   - Use: https://ezgif.com/gif-to-mp4
   - Or: https://cloudconvert.com/gif-to-mp4

2. **Save as:**
   ```
   public/images/hero/bags-hero.mp4
   ```

3. **Done!** ✅ It will auto-play and loop

---

### **Using GIF Only:**

1. **Save your GIF as:**
   ```
   public/images/hero/bags-hero.gif
   ```

2. **Comment out the video** in `public/index.html` (line 84-88):
   ```html
   <!-- <video autoplay muted loop playsinline>
       <source src="images/hero/bags-hero.mp4">
   </video> -->
   
   <img src="images/hero/bags-hero.gif" 
        style="position: absolute; width: 100%; height: 100%; object-fit: cover;">
   ```

3. **Done!** ✅

---

## **File Structure:**

Your folder should look like this:
```
public/
├── images/
│   └── hero/
│       ├── bags-hero.gif     ← Place GIF here
│       └── bags-hero.mp4     ← Or MP4 here (recommended)
```

---

## **Testing:**

1. **Place your file** in `public/images/hero/`

2. **Start server:**
   ```bash
   npm run dev:full
   ```

3. **Visit homepage:**
   ```
   http://localhost:3000
   ```

4. **You should see:**
   - Your video/GIF playing in background
   - Dark overlay on top
   - White text: "Luxury 1:1 Designer Bags"
   - "Shop Collection" button

---

## **Troubleshooting:**

### **Video Not Playing?**
✅ Check file name: must be exactly `bags-hero.mp4`  
✅ Check file location: `public/images/hero/`  
✅ Try refreshing browser (Ctrl + F5)  
✅ Check browser console for errors (F12)  

### **GIF Not Showing?**
✅ Check file name: must be exactly `bags-hero.gif`  
✅ Check file location: `public/images/hero/`  
✅ File size too large? Compress it: https://ezgif.com/optimize  

### **Mobile Not Working?**
✅ Video has `playsinline` attribute (already added)  
✅ Video must be muted (already set)  
✅ Some browsers block autoplay - this is normal

---

## **Convert GIF to MP4 Online:**

If you have a GIF and want to convert it:

1. **EZGIF** (Free):
   - Go to: https://ezgif.com/gif-to-mp4
   - Upload your GIF
   - Click "Convert to MP4"
   - Download and save as `bags-hero.mp4`

2. **CloudConvert** (Free):
   - Go to: https://cloudconvert.com/gif-to-mp4
   - Upload GIF
   - Convert
   - Download MP4

---

## **Current Setup:**

✅ Hero section supports both video and GIF  
✅ Video will try first (better performance)  
✅ GIF is fallback if video fails  
✅ Auto-plays and loops  
✅ Dark overlay for text readability  
✅ Mobile-friendly  

---

## **What You Need to Do:**

### **Quick Option:**
1. Save your media file as:
   - `public/images/hero/bags-hero.mp4` (video)
   - OR `public/images/hero/bags-hero.gif` (gif)

2. Refresh your browser

3. Done! ✅

---

## **File Paths at a Glance:**

```
Place Video Here:
📁 c:\Users\Steve\OneDrive\Desktop\resell-depot.eth\public\images\hero\bags-hero.mp4

Place GIF Here:
📁 c:\Users\Steve\OneDrive\Desktop\resell-depot.eth\public\images\hero\bags-hero.gif
```

---

## 🎯 **Recommendation:**

Use **MP4 video** for best results:
- Smaller file size
- Better quality
- Faster loading
- Professional appearance

Just drop your `bags-hero.mp4` in the folder and you're done! 🚀
