# Weekend Escapes – Premium Travel Website

A modern, high-performance, responsive travel website for **Weekend Escapes**, built with React, Vite, Tailwind CSS v4, GSAP, Framer Motion, and Swiper.js, following the reference UI design and adventure branding.

![Weekend Escapes UI Preview](/public/images/hero/hero-mountain.webp)

---

## 🎨 Design Theme & Branding

- **Primary Orange:** `#FF6B16`
- **Dark Black:** `#111111`
- **Pure White:** `#FFFFFF`
- **Light Background:** `#F7F7F5`
- **Secondary Grey:** `#777777`

### Key Aesthetics:
- **Cinematic Adventure Hero:** Mountain sunrise with glowing sun disk, lone summit trekker, and social proof counter.
- **Floating Interactive Search Panel:** Overlapping hero bottom with destination, travel type, date picker, and travelers count controls.
- **Section Transitions:** Rugged brush-stroke SVG dividers and torn-paper masked borders between light and dark sections.
- **Editorial Typography:** Bold headings using *Plus Jakarta Sans* and adventure scripts with *Caveat*.
- **Touch-Friendly & Responsive:** Mobile drawer navigation, responsive grids, and touch-enabled Swiper carousels.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + Vite 6
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Animations:** Framer Motion + GSAP ScrollTrigger
- **Carousel / Sliders:** Swiper.js
- **Image Pipeline:** Sharp & high-resolution vector WebP

---

## 📁 Project Structure

```text
weekend-escapes/
├── public/
│   ├── logo/
│   │   ├── weekend-escapes-logo.png
│   │   └── weekend-escapes-logo.svg
│   └── images/
│       ├── hero/
│       │   ├── hero-mountain.webp
│       │   └── hero-trekker.webp
│       ├── destinations/
│       │   ├── kedarkantha.webp
│       │   ├── kashmir.webp
│       │   ├── manali.webp
│       │   ├── spiti.webp
│       │   └── bali.webp
│       ├── packages/
│       │   ├── kedarkantha-trek.webp
│       │   ├── kashmir-getaway.webp
│       │   ├── manali-adventure.webp
│       │   └── bali-escape.webp
│       ├── experiences/
│       ├── why-us/
│       ├── process/
│       ├── testimonials/
│       ├── gallery/
│       ├── blogs/
│       ├── cta/
│       └── decorations/
│           ├── brush-stroke-top.svg
│           ├── brush-stroke-bottom.svg
│           └── torn-paper.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── SectionHeading.jsx
│   │   │   ├── Container.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── ImageCard.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MobileMenu.jsx
│   │   └── home/
│   │       ├── Hero.jsx
│   │       ├── TravelSearch.jsx
│   │       ├── Destinations.jsx
│   │       ├── DestinationCard.jsx
│   │       ├── Experiences.jsx
│   │       ├── Packages.jsx
│   │       ├── PackageCard.jsx
│   │       ├── WhyChooseUs.jsx
│   │       ├── BookingProcess.jsx
│   │       ├── Testimonials.jsx
│   │       ├── Gallery.jsx
│   │       ├── TravelBlogs.jsx
│   │       └── FinalCTA.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── DestinationsPage.jsx
│   │   ├── PackagesPage.jsx
│   │   ├── PackageDetails.jsx
│   │   ├── ExperiencesPage.jsx
│   │   ├── BlogsPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ContactPage.jsx
│   │   └── PlanTripPage.jsx
│   ├── data/
│   │   ├── destinations.js
│   │   ├── packages.js
│   │   ├── experiences.js
│   │   ├── testimonials.js
│   │   ├── blogs.js
│   │   └── gallery.js
│   ├── hooks/
│   │   ├── useScrollAnimation.js
│   │   └── useWindowSize.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── styles/
│   │   ├── index.css
│   │   └── animations.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The application will be accessible at:
```
http://localhost:5173
```

### 3. Build for Production
```bash
npm run build
```
Preview production build:
```bash
npm run preview
```

---

## ✨ Features Implemented

1. **Cinematic Hero**: Lone summit trekker, glowing sun disk, tagline, floating social proof badge (15k+ Happy Travelers, 4.9/5 stars), and scroll indicator.
2. **Interactive Search Bar**: Overlapping panel with destination dropdown, travel category filter, date picker, travelers increment/decrement selector, and query redirection to packages.
3. **5 Top Destinations**: Kedarkantha, Kashmir, Manali, Spiti Valley, Bali with image zoom and category tags.
4. **Dark Brush-Stroke Experiences**: Trekking, Adventure, Honeymoon, Family Trips, Group Tours, International with orange badge highlights.
5. **Trending Tour Packages**: Duration tags, price per person, rating badges, and direct navigation to detailed itinerary page.
6. **"More Than Just A Trip"**: 4 benefit cards and torn-paper adventure traveler visual with brush slogan.
7. **Booking Process Timeline**: 4-step interactive timeline with illustrated dotted path and orange camper van.
8. **Swiper Testimonials**: Responsive touch slider featuring verified traveler reviews and ratings.
9. **Interactive Travel Gallery**: 6-photo masonry with click-to-open full-screen lightbox modal.
10. **Travel Guides & Blogs**: Reading time, authors, dates, and full article view.
11. **Final CTA & Footer**: Mountain sunset panorama with "Plan My Trip" & direct WhatsApp links, newsletter email validator, quick links, and social channels.
12. **Custom Trip Builder**: Complete multi-step frontend planner at `/plan-trip`.
