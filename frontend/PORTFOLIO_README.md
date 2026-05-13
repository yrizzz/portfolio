# Portfolio dengan 3D Interactive UI

Portfolio modern dengan animasi 3D menggunakan **Framer Motion** dan **shadcn/ui**.

## ✨ Fitur Utama

- 🎨 **Jakarta Sans Font** - Font modern dan clean
- 🎭 **3D Animations** - Interactive 3D effects dengan Framer Motion
- 🖼️ **Parallax Effects** - Smooth parallax scrolling
- 🌓 **Dark/Light Mode** - Theme switching dengan animasi
- 📱 **Fully Responsive** - Mobile-first design
- ⚡ **Performance Optimized** - Fast loading dan smooth animations
- 🎯 **Smooth Scroll** - Navigation dengan smooth scrolling

## 🚀 Cara Menjalankan

```bash
# Install dependencies
cd apps/frontend
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📸 Cara Menambahkan Foto Anda

### Opsi 1: Menggunakan File Lokal

1. Simpan foto Anda di folder `apps/frontend/public/` dengan nama `profile.jpg` atau `profile.png`

2. Edit file `apps/frontend/src/components/hero-section.tsx` pada bagian foto:

```tsx
{/* Ganti bagian ini */}
<div className="absolute inset-0 flex items-center justify-center">
  <div className="text-center space-y-4">
    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold">
      YR
    </div>
    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
      Replace with your photo
    </p>
  </div>
</div>

{/* Dengan kode ini */}
<Image
  src="/profile.jpg"
  alt="Your Name"
  fill
  className="object-cover"
  priority
/>
```

3. Import Image component di bagian atas file:
```tsx
import Image from "next/image";
```

### Opsi 2: Menggunakan URL External

```tsx
<Image
  src="https://your-image-url.com/photo.jpg"
  alt="Your Name"
  fill
  className="object-cover"
  priority
/>
```

## 🎨 Customization

### Mengubah Warna Tema

Edit file `apps/frontend/src/app/globals.css`:

```css
:root {
  --primary: oklch(0.205 0 0); /* Ubah warna primary */
  --secondary: oklch(0.97 0 0); /* Ubah warna secondary */
  /* ... */
}
```

### Mengubah Konten

1. **Hero Section** - Edit `apps/frontend/src/components/hero-section.tsx`
2. **Projects** - Edit array `mockProjects` di `apps/frontend/src/components/projects-section.tsx`
3. **Skills** - Edit array `skills` di `apps/frontend/src/components/about-section.tsx`
4. **Experience** - Edit array `experiences` di `apps/frontend/src/components/experience-section.tsx`
5. **Contact Info** - Edit array `contactInfo` di `apps/frontend/src/components/contact-section.tsx`

### Mengubah Animasi

Framer Motion properties yang bisa diubah:
- `initial` - State awal
- `animate` - State akhir
- `whileHover` - Saat hover
- `whileTap` - Saat click
- `transition` - Durasi dan easing

Contoh:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  whileHover={{ scale: 1.05 }}
>
  Content
</motion.div>
```

## 🎯 Komponen Utama

- **HeroSection** - Hero dengan foto dan parallax effect
- **ProjectsSection** - Showcase projects dengan filter tabs
- **AboutSection** - Skills dan expertise dengan 3D cards
- **ExperienceSection** - Timeline experience dan education
- **ContactSection** - Contact form dengan validation
- **Navigation** - Sticky navigation dengan smooth scroll

## 📦 Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Framer Motion** - 3D animations
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **Jakarta Sans** - Typography
- **Sonner** - Toast notifications

## 🎨 Animasi yang Tersedia

1. **Parallax Scrolling** - Hero section dengan parallax effect
2. **3D Card Hover** - Cards dengan rotasi 3D saat hover
3. **Stagger Animation** - Sequential animation untuk list items
4. **Floating Elements** - Elemen yang melayang dengan animasi
5. **Gradient Animation** - Background gradient yang bergerak
6. **Scale & Rotate** - Interactive hover effects
7. **Smooth Transitions** - Transisi halus antar sections

## 📝 Tips

- Gunakan foto dengan resolusi tinggi (minimal 800x800px)
- Format foto yang disarankan: JPG atau PNG
- Untuk performa terbaik, compress foto sebelum upload
- Gunakan aspect ratio 1:1 (square) untuk hasil terbaik

## 🔧 Troubleshooting

### Animasi tidak smooth
- Pastikan tidak ada blocking operations di main thread
- Reduce complexity animasi jika perlu
- Check browser performance

### Foto tidak muncul
- Pastikan path foto benar
- Check console untuk error
- Verify file exists di public folder

### Build error
```bash
# Clear cache dan rebuild
rm -rf .next
npm run build
```

## 📄 License

MIT License - Feel free to use for your portfolio!
