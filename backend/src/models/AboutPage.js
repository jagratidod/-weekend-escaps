import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => 'slide_' + Math.random().toString(36).substring(2, 9) },
    image: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const statSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => 'stat_' + Math.random().toString(36).substring(2, 9) },
    value: { type: String, default: '' },
    label: { type: String, default: '' },
  },
  { _id: false }
);

const coreValueSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => 'val_' + Math.random().toString(36).substring(2, 9) },
    icon: { type: String, default: 'ShieldCheck' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const defaultSlides = [
  {
    id: 'slide_bali',
    image: '/newimage/about/bali.png',
    subtitle: 'Tropical Paradise',
    title: 'BALI',
    description: 'Discover pristine beaches, ancient temples, and lush rice terraces in the Island of Gods.',
  },
  {
    id: 'slide_kashmir',
    image: '/newimage/about/kashmir.png',
    subtitle: 'Heaven on Earth',
    title: 'KASHMIR',
    description: 'Float on Dal Lake houseboats, wander through saffron fields, and gaze at snow-capped peaks.',
  },
  {
    id: 'slide_kedarkantha',
    image: '/newimage/about/kedarkantha.png',
    subtitle: 'Summit the Peaks',
    title: 'KEDARKANTHA',
    description: 'Trek through dense pine forests to a pristine summit with 360° Himalayan panoramas.',
  },
  {
    id: 'slide_manali',
    image: '/newimage/about/manali.png',
    subtitle: 'Mountain Magic',
    title: 'MANALI',
    description: 'Rohtang Pass adventures, riverside camping, and old-town charm in the heart of Himachal.',
  },
  {
    id: 'slide_valley',
    image: '/newimage/about/vally.png',
    subtitle: 'Valley of Flowers',
    title: 'VALLEY OF FLOWERS',
    description: 'UNESCO-listed alpine meadows bursting with rare Himalayan wildflowers and butterflies.',
  },
  {
    id: 'slide_weekend',
    image: '/newimage/about/image1.png',
    subtitle: 'Wild Escapes',
    title: 'WEEKEND ESCAPES',
    description: 'Handpicked trails, curated stays, and unforgettable moments — your next adventure starts here.',
  },
];

const defaultStats = [
  { id: 'stat_1', label: 'Happy Explorers', value: '15,000+' },
  { id: 'stat_2', label: 'Expeditions Led', value: '850+' },
  { id: 'stat_3', label: 'Himalayan Summits', value: '24' },
  { id: 'stat_4', label: 'Safety Record', value: '99.9%' },
];

const defaultCoreValues = [
  {
    id: 'val_1',
    icon: 'ShieldCheck',
    title: 'Safety Above All',
    description:
      'Certified leaders with Wilderness First Responder (WFR) credentials, high-altitude oxygen reserves, and state-of-the-art satellite tracking.',
  },
  {
    id: 'val_2',
    icon: 'Heart',
    title: 'Sustainable & Eco-First',
    description:
      'We empower local mountain communities, hire native village homestays, and rigorously collect trail waste on every descent.',
  },
  {
    id: 'val_3',
    icon: 'Flame',
    title: 'Unmatched Value',
    description:
      'Direct ground operations with zero broker markups mean premium quality camps, food, and hospitality at competitive prices.',
  },
];

const aboutPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      default: 'about_main',
      unique: true,
    },
    hero: {
      autoInterval: { type: Number, default: 4500 },
      slides: { type: [slideSchema], default: defaultSlides },
    },
    mission: {
      eyebrow: { type: String, default: 'OUR MISSION & PURPOSE' },
      title: { type: String, default: 'About Weekend Escapes' },
      description: {
        type: String,
        default:
          'We are a team of certified mountaineers, nature lovers, and obsessive explorers dedicated to taking you beyond ordinary tourist traps into wild, authentic experiences.',
      },
    },
    stats: {
      type: [statSchema],
      default: defaultStats,
    },
    story: {
      eyebrow: { type: String, default: 'HOW WE STARTED' },
      title: { type: String, default: 'Born Out of a Passion for High Altitudes' },
      paragraph1: {
        type: String,
        default:
          "Weekend Escapes started with three friends who spent their weekends escaping urban monotony to conquer Uttarakhand's snow passes. What began as weekend hikes soon grew into India’s most trusted adventure travel community.",
      },
      paragraph2: {
        type: String,
        default:
          'Today, we organize certified treks, private honeymoon sanctuaries, thrilling group expeditions, and overseas road adventures—all while adhering to strict Leave No Trace eco-principles.',
      },
      image: { type: String, default: '/images/gallery/gallery-3.webp' },
      imageAlt: { type: String, default: 'Our Story Bonfire' },
    },
    coreValues: {
      type: [coreValueSchema],
      default: defaultCoreValues,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

const AboutPage = mongoose.model('AboutPage', aboutPageSchema);

export default AboutPage;
