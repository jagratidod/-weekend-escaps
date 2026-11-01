import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Blog from '../models/Blog.js';
import BlogCategory from '../models/BlogCategory.js';
import Setting from '../models/Setting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const CATEGORIES_DATA = [
  { name: 'Trek Guide', slug: 'trek-guide', description: 'Essential guides, trail notes, and gear recommendations for high-altitude Himalayan treks.', order: 1 },
  { name: 'Travel Tips', slug: 'travel-tips', description: 'Packing hacks, seasonal forecasts, altitude sickness prevention, and travel advice.', order: 2 },
  { name: 'Adventure', slug: 'adventure', description: 'Hidden forest trails, white water rafting scrambles, and alpine thrilling expeditions.', order: 3 },
  { name: 'Expedition', slug: 'expedition', description: 'Extreme desert pass crossings, high mountain road trips, and deep valley odysseys.', order: 4 },
  { name: 'International', slug: 'international', description: 'Curated international escapes, island retreats, and cultural explorations across the globe.', order: 5 },
];

const EXISTING_BLOGS = [
  {
    id: "kedarkantha-guide",
    title: "Kedarkantha Trek Guide: Everything You Need to Know for 12,500 ft",
    slug: "kedarkantha-trek-guide",
    category: "Trek Guide",
    date: "Aug 10, 2026",
    readTime: "10 min read",
    author: "Arjun Rawat (Lead Mountaineer)",
    authorRole: "Lead Mountaineer",
    image: "/newimage/exploresection/kedarkantha.png",
    excerpt: "Everything you need to prepare for Uttarakhand's premier winter wonderland trek, from essential gear checklists to summit day pacing.",
    content: `Kedarkantha is without doubt the crown jewel of winter treks in India. Towering at 12,500 feet inside the Govind Wildlife Sanctuary in Uttarakhand, this peak provides an unparalleled 360-degree panorama of thirteen Himalayan peaks including Swargarohini, Black Peak, and Bandarpoonch.

### Best Time to Trek
While the trek can be undertaken between October and April, the golden snow season begins in mid-December and extends until late March.

### Physical Preparation
Even though Kedarkantha is graded as easy-to-moderate, preparing your cardiovascular endurance 3-4 weeks prior with 5km jogs and brisk stair climbs makes your summit day immensely enjoyable.

### Summit Day Strategy
Start early at 3:30 AM from the base camp. Watching the sunrise kiss the snow-dusted Swargarohini massif from the peak's Shiva shrine is an ethereal experience that stays with you forever.`,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: "spiti-valley-expedition",
    title: "Spiti Valley Road Trip: Mastering High-Altitude Desert Passes",
    slug: "spiti-valley-road-trip-guide",
    category: "Expedition",
    date: "Aug 10, 2026",
    readTime: "10 min read",
    author: "Tenzin Norbu (Spiti Marshal)",
    authorRole: "Spiti Route Marshal",
    image: "/newimage/exploresection/vally.png",
    excerpt: "Navigating Kunzum Pass, Chandratal crescent lake camping, and ancient monasteries at 14,000 ft in the middle land.",
    content: `Spiti Valley—the cold desert mountain valley nestled high in the Himalayas—is an otherworldly landscape of stark barren peaks, centuries-old Tibetan gompas, and starlit skies unlike anywhere else on earth.

### Acclimatization is Key
Ascending via the Shimla-Kinnaur route allows gradual acclimatization, avoiding acute mountain sickness before reaching Kaza at 12,500 ft.

### Essential Spiti Checklist
Warm thermal base layers, high-traction boots, portable oxygen canisters, and cash reserves are crucial as network connectivity and ATMs are rare beyond Reckong Peo.

### Sacred Highlights
Visit Key Monastery perched dramatically on a conical hill, send a postcard from Hikkim (world's highest post office), and camp by the turquoise waters of Chandratal Lake.`,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: "best-time-kashmir",
    title: "Seasonal Guide to Kashmir: When to Experience Valley Magic",
    slug: "best-time-to-visit-kashmir",
    category: "Travel Tips",
    date: "Aug 10, 2026",
    readTime: "10 min read",
    author: "Zoya Mir (Destination Specialist)",
    authorRole: "Destination Specialist",
    image: "/newimage/exploresection/kashmir.png",
    excerpt: "Whether you crave snowy slopes of Gulmarg, blooming tulip gardens, or golden autumn chinar leaves, here is your seasonal guide.",
    content: `Kashmir is a destination that reinvents its persona with every season. Deciding when to visit depends entirely on the kind of magic you wish to experience.

### Spring (March to May): The Blooming Season
Witness millions of tulips carpet Srinagar's Asia-largest tulip garden with pleasant temperatures between 15°C and 25°C.

### Summer (June to August): Lush Alpine Escapes
Pahalgam and Sonmarg turn into verdant green valleys with gushing streams and cool mountain breezes.

### Autumn (September to November): The Golden Chinar Glory
Srinagar transforms into a rust-gold paradise with saffron harvesting in full swing.

### Winter (December to February): Winter Wonderland
Gulmarg turns into India's premier ski and snow sports capital with world-class gondola rides.`,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: "manali-secret-trails",
    title: "Exploring Hidden Waterfalls and Forest Trails Around Old Manali",
    slug: "manali-hidden-forest-trails",
    category: "Adventure",
    date: "Aug 10, 2026",
    readTime: "10 min read",
    author: "Vikram Thakur (Trek Leader)",
    authorRole: "Himachal Trek Leader",
    image: "/newimage/exploresection/manali.png",
    excerpt: "Beyond Mall Road: secret cedar forest trails, Jogini waterfall scrambles, and authentic mountain cafes along Beas.",
    content: `Old Manali preserves the rustic, tranquil Himachal charm that captivated early wanderers. Just a short hike beyond the village leads you into ancient deodar forests where time seems to stand still.

### Top Trails to Explore
1. **Jogini Waterfalls**: A serene walk from Vashisht through apple orchards leading to cascading mountain streams.
2. **Lama Dugh Trek**: A ridge walk offering panoramic vistas of the Solang range and Manali town far below.
3. **Manu Temple to Goshal Village**: An easy village walk amidst rustic wooden houses and mountain fields.`,
    isFeatured: false,
    isPublished: true,
  },
  {
    id: "bali-travel-guide",
    title: "Bali Travel Guide: Sacred Water Temples and Island Escapes",
    slug: "bali-travel-guide-top-places",
    category: "International",
    date: "Aug 10, 2026",
    readTime: "10 min read",
    author: "Neha Kapoor (Travel Curator)",
    authorRole: "International Travel Curator",
    image: "/newimage/exploresection/bali.png",
    excerpt: "Discover majestic sea temples, lush Ubud jungle retreats, secret Nusa Penida cliff viewpoints, and tropical cafes.",
    content: `From mythical temples resting upon ocean waves to sacred monkey sanctuaries and sunset cliff bars, Bali offers an electrifying blend of spirituality and tropical leisure.

### Top 4 Unmissable Spots
1. **Ubud Monkey Forest & Rice Terraces**: Immerse yourself in lush greenery, artisan markets, and traditional healing.
2. **Pura Ulun Danu Beratan**: The iconic floating water temple on Lake Beratan.
3. **Nusa Penida Island**: Day speedboat trip to witness the breathtaking Kelingking T-Rex cliff.
4. **Uluwatu Temple & Fire Dance**: Perched 70 meters high over the Indian Ocean waves during sunset.`,
    isFeatured: false,
    isPublished: true,
  },
];

const seedBlogData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected Successfully.');

    // 1. Seed Categories
    console.log('\n--- Seeding Blog Categories ---');
    for (const cat of CATEGORIES_DATA) {
      const existing = await BlogCategory.findOne({
        $or: [{ name: cat.name }, { slug: cat.slug }],
      });

      if (!existing) {
        await BlogCategory.create(cat);
        console.log(`✓ Created Category: ${cat.name}`);
      } else {
        console.log(`• Category exists: ${cat.name}`);
      }
    }

    // 2. Seed Existing Blogs
    console.log('\n--- Seeding Existing Blogs ---');
    for (const b of EXISTING_BLOGS) {
      const existing = await Blog.findOne({
        $or: [{ slug: b.slug }, { id: b.id }],
      });

      const catDoc = await BlogCategory.findOne({ name: b.category });

      if (!existing) {
        await Blog.create({
          ...b,
          categoryId: catDoc ? catDoc._id : null,
        });
        console.log(`✓ Seeded Blog: "${b.title}"`);
      } else {
        console.log(`• Blog exists: "${b.title}"`);
      }
    }

    // 3. Seed / Update Hero Section Settings
    console.log('\n--- Updating Blog Hero Settings in Setting ---');
    let setting = await Setting.findOne({ key: 'site_settings' });
    if (!setting) {
      setting = new Setting({ key: 'site_settings' });
    }

    if (!setting.blogHero || !setting.blogHero.title) {
      setting.blogHero = {
        tagline: 'WEEKEND ESCAPES JOURNAL',
        title: 'Travel Stories & Guides',
        subtitle: 'Inspiring trail notes, high-altitude pass guides, and gear tips',
        featuredImage: '/newimage/exploresection/kedarkantha.png',
        featuredBlogId: 'kedarkantha-guide',
      };
      await setting.save();
      console.log('✓ Seeded Blog Hero Settings');
    } else {
      console.log('• Blog Hero Settings already exist');
    }

    console.log('\nAll blogs and categories seeded successfully into MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedBlogData();
