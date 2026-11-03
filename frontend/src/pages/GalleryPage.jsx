import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  X,
  Maximize2,
  Users,
  Maximize,
  Bed,
  Mountain,
  MapPin,
  Compass,
  ArrowRight,
  Flame,
  Utensils,
  Camera,
  Coffee,
  CheckCircle2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import Container from '../components/common/Container';
import { getImageUrl } from '../utils/imageHelper';

// Official Weekend Escapes Cloudinary & Project Images
const SITE_MEDIA = {
  heroLandscape: getImageUrl('/newimage/herosecction/heroimage.png'),
  kedarkantha: getImageUrl('/newimage/exploresection/kedarkantha.png'),
  kashmir: getImageUrl('/newimage/exploresection/kashmir.png'),
  manali: getImageUrl('/newimage/exploresection/manali.png'),
  spiti: getImageUrl('/newimage/exploresection/vally.png'),
  bali: getImageUrl('/newimage/exploresection/bali.png'),
  aboutKedarkantha: getImageUrl('/newimage/about/kedarkantha.png'),
  aboutKashmir: getImageUrl('/newimage/about/kashmir.png'),
  aboutManali: getImageUrl('/newimage/about/manali.png'),
  aboutSpiti: getImageUrl('/newimage/about/vally.png'),
  aboutBali: getImageUrl('/newimage/about/bali.png'),
  photosExpedition: getImageUrl('/newimage/photos/image1.png'),
  bannerValley: getImageUrl('/newimage/other sections image/banner1.png'),
  footerMountain: getImageUrl('/newimage/other sections image/footerbanner2.png'),
};

// Curated authentic mountain, retreat & expedition imagery
const ADVENTURE_MEDIA = {
  hottub: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=85&w=1200&auto=format&fit=crop', // Outdoor mountain hot tub in snow
  gondola: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=85&w=1200&auto=format&fit=crop', // Gulmarg gondola ascending peak
  snowSki: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=85&w=1200&auto=format&fit=crop', // Skiing in Solang snow
  wineSunset: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?q=85&w=1200&auto=format&fit=crop', // Illuminated alpine tent under Milky Way galaxy and campfire
  campBreakfast: 'https://images.unsplash.com/photo-1471400974796-1c823d00a96f?q=85&w=1200&auto=format&fit=crop', // Adventure begins enamel mug overlooking alpine lake & pine forest
  picnicHamper: 'https://images.unsplash.com/photo-1574390696797-d1c894b7ec79?q=85&w=1200&auto=format&fit=crop', // Authentic woven wicker expedition hamper basket with leather straps & plates
  chaletBath: 'https://images.unsplash.com/photo-1667837526762-0e4dcb3d0def?q=85&w=800&auto=format&fit=crop', // Luxury stone bathroom with illuminated circular mirror & wood vanity
  chaletBed: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=85&w=1400&auto=format&fit=crop', // Natural mountain rock cliff headboard wall, panoramic glass & platform bed
  domeBath: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=85&w=800&auto=format&fit=crop',
  houseboatInterior: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=85&w=800&auto=format&fit=crop',
  spitiInterior: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=85&w=800&auto=format&fit=crop',
  bonfireNight: 'https://images.unsplash.com/photo-1659187313578-66ec5323bc2f?q=85&w=1200&auto=format&fit=crop', // Authentic crackling wood bonfire with glowing embers & sparks in night woods
  wazwanDinner: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=85&w=1200&auto=format&fit=crop',
};

// Section 2: Split Filmstrip Panels for Weekend Escapes
const EXPEDITION_PANELS = [
  {
    id: 'kedarkantha-sunrise',
    category: 'HIMALAYAN TREKS',
    title: 'JUDA KA TALAB ALPINE SUNRISE',
    subtitle: 'Steaming ginger chai, snow gaiters & morning sunrise reflection over the frozen lake',
    image: SITE_MEDIA.kedarkantha,
    tag: 'Kedarkantha • 9,100 ft',
  },
  {
    id: 'kashmir-shikara',
    category: 'SCENIC & LAKES',
    title: 'DAL LAKE SUNSET SHIKARA',
    subtitle: 'Golden waters, floating lotus gardens, and traditional Kashmiri saffron Kahwa',
    image: SITE_MEDIA.kashmir,
    tag: 'Srinagar • Kashmir',
  },
  {
    id: 'trail-hampers',
    category: 'CAMPS & BONFIRE',
    title: 'EXPEDITION TRAIL HAMPERS',
    subtitle: 'Artisan trail sandwiches, energy bars, dry fruits, and hot thermos soup on high passes',
    image: ADVENTURE_MEDIA.picnicHamper,
    tag: 'Trail Food & Dining',
    isCenter: true,
  },
  {
    id: 'manali-bonfire',
    category: 'ROAD EXPEDITIONS',
    title: 'OLD MANALI ACOUSTIC BONFIRE',
    subtitle: 'Fireside acoustic jams, mountain stories, and stargazing by the Beas riverbanks',
    image: ADVENTURE_MEDIA.bonfireNight,
    tag: 'Evening Community',
  },
];

// Section 3: Featured Stays & Basecamps from Weekend Escapes Packages
const EXPEDITION_ACCOMMODATIONS = [
  {
    id: '01',
    number: '01. KEDARKANTHA RIDGE DOME',
    tripName: 'Kedarkantha Trek (6D/5N)',
    title: 'INSULATED ALPINE DOME BASECAMP',
    location: 'Sankri / Juda Ka Talab, Uttarakhand',
    desc: 'Insulated 4-season geodesic dome camp equipped with heavy-duty down sleeping bags, fleece liners, hot water bottles, and 360-degree snow peak vistas.',
    bathroomImg: ADVENTURE_MEDIA.domeBath,
    mainImg: SITE_MEDIA.kedarkantha,
    details: [
      { icon: Users, label: '2 - 3 Trekkers per Dome' },
      { icon: Maximize, label: 'Insulated Dual-layer Fabric' },
      { icon: Bed, label: 'Sub-zero Thermal Bedding' },
      { icon: Mountain, label: 'Views of Swargarohini Peaks' },
    ],
  },
  {
    id: '02',
    number: '02. DAL LAKE HERITAGE HOUSEBOAT',
    tripName: 'Kashmir Getaway (7D/6N)',
    title: 'ROYAL DEODAR CEDAR HOUSEBOAT',
    location: 'Nigeen Lake / Dal Lake, Srinagar',
    desc: 'Century-old carved deodar cedar wood luxury houseboat with antique walnut furnishings, private lakeside front deck, and complimentary morning Shikara ride.',
    bathroomImg: ADVENTURE_MEDIA.houseboatInterior,
    mainImg: SITE_MEDIA.kashmir,
    details: [
      { icon: Users, label: '2 - 4 Guests (Private Suite)' },
      { icon: Maximize, label: '55 sqm | Historic Heritage' },
      { icon: Bed, label: '2 King Luxury Bedrooms' },
      { icon: Mountain, label: 'Private Dal Lake Front Balcony' },
    ],
  },
  {
    id: '03',
    number: '03. SUMMIT CHALET & LOFT',
    tripName: 'Manali Adventure (5D/4N)',
    title: 'SOLANG VALLEY ALPINE LOFT & CHALET',
    location: 'Solang Valley / Old Manali, Himachal',
    desc: 'Features an open-plan living area, panoramic floor-to-ceiling glass walls, and a spa-inspired bathroom with a cedar soaking tub facing the snowy valley.',
    bathroomImg: ADVENTURE_MEDIA.chaletBath, // reference circular backlit mirror
    mainImg: ADVENTURE_MEDIA.chaletBed, // reference luxury rock headboard bed
    details: [
      { icon: Users, label: '2 - 4 Travelers' },
      { icon: Maximize, label: '45 sqm | 485 sq ft' },
      { icon: Bed, label: '1 King-size Luxury Bed' },
      { icon: Mountain, label: 'Private Balcony with Peak Views' },
    ],
  },
  {
    id: '04',
    number: '04. SPITI STONE RETREAT',
    tripName: 'Spiti Valley Expedition (8D/7N)',
    title: 'KIBBER HERITAGE HOMESTAY',
    location: 'Kibber Village (14,200 ft), Spiti',
    desc: 'Traditional Tibetan mud-stone architecture offering geothermal natural warmth, authentic wood Bukhari stove, organic Spiti meals, and rooftop Milky Way views.',
    bathroomImg: ADVENTURE_MEDIA.spitiInterior,
    mainImg: SITE_MEDIA.spiti,
    details: [
      { icon: Users, label: '2 - 3 Explorers' },
      { icon: Maximize, label: 'Handcrafted Stone Living' },
      { icon: Bed, label: 'Authentic Tibetan Wool Mattresses' },
      { icon: Mountain, label: 'Views of Key Monastery' },
    ],
  },
];

// All-Trip Real Photo Archive for Masonry Grid
const CURATED_GALLERY = [
  {
    id: 'p1',
    trip: 'Kedarkantha Trek',
    category: 'Himalayan Treks',
    title: 'Summit Push at 12,500 ft (Snow Trail)',
    location: 'Sankri, Uttarakhand',
    image: SITE_MEDIA.kedarkantha,
    span: 'col-span-1 md:col-span-2 row-span-2',
  },
  {
    id: 'p2',
    trip: 'Kashmir Getaway',
    category: 'Scenic Views',
    title: 'Sunset Shikara Cruise on Dal Lake',
    location: 'Srinagar, Kashmir',
    image: SITE_MEDIA.kashmir,
    span: 'col-span-1 row-span-1',
  },
  {
    id: 'p3',
    trip: 'Manali Adventure',
    category: 'Adventure',
    title: 'Solang Valley Paragliding & Ski Slopes',
    location: 'Manali, Himachal Pradesh',
    image: SITE_MEDIA.manali,
    span: 'col-span-1 row-span-1',
  },
  {
    id: 'p4',
    trip: 'Spiti Valley',
    category: 'Scenic Views',
    title: 'Chandratal Crescent Moon Lake Camp',
    location: 'Spiti Valley, Himachal Pradesh',
    image: SITE_MEDIA.spiti,
    span: 'col-span-1 row-span-2',
  },
  {
    id: 'p5',
    trip: 'Bali Escape',
    category: 'International',
    title: 'Kelingking T-Rex Beach & Coastal Cliffs',
    location: 'Nusa Penida, Bali',
    image: SITE_MEDIA.bali,
    span: 'col-span-1 md:col-span-2 row-span-1',
  },
  {
    id: 'p6',
    trip: 'Kedarkantha Trek',
    category: 'Camps & Stays',
    title: 'Juda Ka Talab Frozen Alpine Campsite',
    location: 'Govind Pashu Vihar, Uttarakhand',
    image: SITE_MEDIA.aboutKedarkantha,
    span: 'col-span-1 row-span-1',
  },
  {
    id: 'p7',
    trip: 'Kashmir Getaway',
    category: 'Adventure',
    title: 'Gulmarg Gondola to Apharwat Snow Peak',
    location: 'Gulmarg, Kashmir',
    image: ADVENTURE_MEDIA.gondola,
    span: 'col-span-1 md:col-span-2 row-span-1',
  },
  {
    id: 'p8',
    trip: 'Manali Adventure',
    category: 'Camps & Stays',
    title: 'Old Manali Riverside Chalet Evenings',
    location: 'Beas River Valley, Manali',
    image: SITE_MEDIA.aboutManali,
    span: 'col-span-1 row-span-1',
  },
];

export default function GalleryPage() {
  const [activeSplitTab, setActiveSplitTab] = useState('CAMPS & BONFIRE');
  const [activeShowcaseId, setActiveShowcaseId] = useState('03');
  const [gridFilter, setGridFilter] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);

  const [filterTrip, setFilterTrip] = useState('All Trips');
  const [filterType, setFilterType] = useState('All Types');
  const [filterSeason, setFilterSeason] = useState('All Seasons');

  const activeShowcase =
    EXPEDITION_ACCOMMODATIONS.find((item) => item.id === activeShowcaseId) ||
    EXPEDITION_ACCOMMODATIONS[2];

  const filteredGrid =
    gridFilter === 'All'
      ? CURATED_GALLERY
      : CURATED_GALLERY.filter(
          (item) => item.category === gridFilter || item.trip === gridFilter
        );

  return (
    <div className="bg-[#F7F7F5] text-[#111111] font-sans selection:bg-[#FF6B16] selection:text-white overflow-x-hidden pt-20 md:pt-24">
      {/* ============================================================== */}
      {/* ── SECTION 1: CINEMATIC LIGHT HERO (Reference 3 Aesthetic) ── */}
      {/* ============================================================== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-24 bg-gradient-to-b from-white via-[#F7F7F5] to-[#F7F7F5]">
        {/* Subtle Himalayan Landscape Backdrop */}
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
          <img
            src={SITE_MEDIA.heroLandscape}
            alt="Himalayan Mountain Range"
            className="w-full h-full object-cover filter blur-[1px]"
          />
        </div>

        {/* Center Typography matching Reference 3 */}
        <Container className="relative z-10 text-center flex flex-col items-center select-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-sm mb-4"
          >
            <Camera className="w-3.5 h-3.5 text-[#FF6B16]" />
            <span className="text-[11px] font-black tracking-[0.25em] uppercase text-neutral-600">
              WEEKEND ESCAPES • OFFICIAL PHOTO ARCHIVE
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-xs sm:text-sm font-bold tracking-[0.35em] uppercase text-neutral-500 mb-2 sm:mb-3"
          >
            GET AN
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.96, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif italic text-[#111111] tracking-tight leading-none drop-shadow-sm"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Experience
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-xs sm:text-sm md:text-base text-neutral-600 max-w-xl mt-6 font-medium leading-relaxed"
          >
            Unfiltered captures from our real expedition departures — from snowy Kedarkantha ridge summits and Dal Lake wooden houseboats to Solang slopes and high-altitude Spiti desert homestays.
          </motion.p>

          {/* Quick Metrics Bar in White Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-6 shadow-sm max-w-2xl w-full"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#FF6B16]">12,500 ft</p>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                Kedarkantha Summit
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#111111]">100%</p>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                Batch Tour Captures
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#FF6B16]">5 Core Hubs</p>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                Himalayas to Bali
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#111111]">Certified</p>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                Wilderness Leaders
              </p>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* ── SECTION 2: "MORE THAN A TOUR" & FILTER BAR (Reference 2) ── */}
      {/* ============================================================== */}
      <section className="py-20 bg-white border-t border-neutral-200/80">
        <Container>
          {/* Asymmetrical Layout matching Reference 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
            {/* Left Photo with hotspot circle */}
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-4 relative group cursor-pointer"
              onClick={() =>
                setLightboxImage({
                  url: ADVENTURE_MEDIA.hottub,
                  title: 'Thermal Hot Tub Soak after Snowy Trek Day',
                  trip: 'Manali Adventure • Solang Valley',
                })
              }
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] border border-neutral-200 shadow-md group-hover:shadow-xl transition-all duration-300">
                <img
                  src={ADVENTURE_MEDIA.hottub}
                  alt="Outdoor Hot Tub Soak"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />

                {/* Hotspot Ring from reference screenshot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-[#FF6B16]/80 backdrop-blur-sm group-hover:scale-110 transition-transform shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Center Typography */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-5 text-center lg:text-left px-2"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FF6B16] block mb-2">
                WEEKEND ESCAPES PHILOSOPHY
              </span>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#111111] tracking-tight leading-[1.1]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                More than a trip — <span className="italic text-neutral-500">an experience.</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-4 leading-relaxed font-normal">
                Every tour with Weekend Escapes is engineered for authenticity: certified mountaineering trek marshals, cozy basecamp stays, hot regional meals, and friendships that last long after the journey ends.
              </p>
            </motion.div>

            {/* Right Photo: Gondola climbing snowy peaks */}
            <motion.div
              initial={{ opacity: 0, x: 35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-3 relative group cursor-pointer"
              onClick={() =>
                setLightboxImage({
                  url: ADVENTURE_MEDIA.gondola,
                  title: 'Gulmarg Gondola Ascent to Apharwat Phase 2',
                  trip: 'Kashmir Getaway • 13,780 ft',
                })
              }
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] border border-neutral-200 shadow-md group-hover:shadow-xl transition-all duration-300">
                <img
                  src={ADVENTURE_MEDIA.gondola}
                  alt="Gulmarg Gondola"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                <span className="absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#111111] px-2.5 py-1 rounded-lg shadow-sm border border-neutral-200">
                  Gulmarg Peak 13,780 ft
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── Interactive Filter & Booking Bar (White Theme) ── */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-md mb-16"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              {/* Filter 1: Trip / Expedition */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  OUR EXPEDITIONS
                </label>
                <select
                  value={filterTrip}
                  onChange={(e) => setFilterTrip(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111111] outline-none cursor-pointer hover:border-[#FF6B16] transition-colors"
                >
                  <option value="All Trips">All Trips & Treks</option>
                  <option value="Kedarkantha Trek">Kedarkantha Trek (Uttarakhand)</option>
                  <option value="Kashmir Valley">Kashmir Getaway (Dal Lake & Gulmarg)</option>
                  <option value="Manali Adventure">Manali Adventure (Solang & Atal Tunnel)</option>
                  <option value="Spiti Valley">Spiti Valley Expedition (Chandratal)</option>
                  <option value="Bali Escape">Bali Escape (Nusa Penida & Ubud)</option>
                </select>
              </div>

              {/* Filter 2: Type */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  TRAVEL TYPE
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111111] outline-none cursor-pointer hover:border-[#FF6B16] transition-colors"
                >
                  <option value="All Types">All Types</option>
                  <option value="Summit Treks">High Altitude Snow Treks</option>
                  <option value="Luxury Camps">Boutique Stays & Camps</option>
                  <option value="Scenic Drives">Panoramic Himalayan Drives</option>
                  <option value="Fireside">Dining & Campfires</option>
                </select>
              </div>

              {/* Filter 3: Season */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5">
                  SEASON / MONTHS
                </label>
                <select
                  value={filterSeason}
                  onChange={(e) => setFilterSeason(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111111] outline-none cursor-pointer hover:border-[#FF6B16] transition-colors"
                >
                  <option value="All Seasons">All Seasons</option>
                  <option value="Winter Snow">Winter Snow (Dec - Mar)</option>
                  <option value="Spring Blooms">Spring Blooms (Apr - Jun)</option>
                  <option value="Autumn Golden">Autumn Golden (Sep - Nov)</option>
                </select>
              </div>

              {/* Filter Action Button */}
              <div className="sm:pt-5">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('masonry-gallery')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#FF6B16] hover:bg-[#ff5500] text-white py-2.5 px-5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#FF6B16]/25 cursor-pointer"
                >
                  <span>FILTER ARCHIVE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── 3-Column Staggered Grid matching Reference 2 bottom ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Col 1: Skiing / Adventure */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="relative group rounded-3xl overflow-hidden aspect-[3/4] border border-neutral-200 shadow-md hover:shadow-xl transition-all cursor-pointer bg-neutral-100"
              onClick={() =>
                setLightboxImage({
                  url: ADVENTURE_MEDIA.snowSki,
                  title: 'Skiing & Snow Sliding in Solang Slopes',
                  trip: 'Manali Adventure • Solang Valley',
                })
              }
            >
              <img
                src={ADVENTURE_MEDIA.snowSki}
                alt="Snow Skiing"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[10px] font-bold text-[#FF6B16] tracking-widest uppercase">
                  MANALI ADVENTURE
                </span>
                <h4 className="text-base font-bold mt-0.5">Solang Snow Slopes & Sports</h4>
              </div>
            </motion.div>

            {/* Col 2: Alpine Campfire in Mountains */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative group rounded-3xl overflow-hidden aspect-square border border-neutral-200 shadow-md hover:shadow-xl transition-all cursor-pointer bg-neutral-100"
              onClick={() =>
                setLightboxImage({
                  url: ADVENTURE_MEDIA.wineSunset,
                  title: 'Campfire Gathering under Himalayan Starry Sky',
                  trip: 'Weekend Escapes Evenings',
                })
              }
            >
              <img
                src={ADVENTURE_MEDIA.wineSunset}
                alt="Campfire in Himalayas"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[10px] font-bold text-[#FF6B16] tracking-widest uppercase">
                  STARGAZING & BONFIRES
                </span>
                <h4 className="text-base font-bold mt-0.5">Campfire Nights under Snow Peaks</h4>
              </div>
            </motion.div>

            {/* Col 3: Mountain Chai & Sunrise */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative group rounded-3xl overflow-hidden aspect-[4/3] border border-neutral-200 shadow-md hover:shadow-xl transition-all cursor-pointer bg-neutral-100"
              onClick={() =>
                setLightboxImage({
                  url: ADVENTURE_MEDIA.campBreakfast,
                  title: 'Morning Hot Mountain Beverage Overlooking Snow Peaks',
                  trip: 'Himalayan Trek Mornings',
                })
              }
            >
              <img
                src={ADVENTURE_MEDIA.campBreakfast}
                alt="Mountain Morning Tea"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[10px] font-bold text-[#FF6B16] tracking-widest uppercase">
                  EXPEDITION MORNINGS
                </span>
                <h4 className="text-base font-bold mt-0.5">Steaming Hot Chai & Sunrise Vistas</h4>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* ── SECTION 3: PANORAMIC ACCORDION & DINING (Reference 1) ── */}
      {/* ============================================================== */}
      <section className="py-20 bg-[#F2F2EF] border-t border-neutral-300/70">
        {/* Category Navigation Bar matching Reference 1 top */}
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-12 border-b border-neutral-300 pb-4">
            {['HIMALAYAN TREKS', 'SCENIC & LAKES', 'CAMPS & BONFIRE', 'ROAD EXPEDITIONS'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveSplitTab(cat)}
                  className={`text-xs sm:text-sm tracking-widest uppercase font-black transition-all cursor-pointer pb-1 relative ${
                    activeSplitTab === cat
                      ? 'text-[#111111]'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>{cat}</span>
                  {activeSplitTab === cat && (
                    <motion.div
                      layoutId="activeCategoryUnderlineLight"
                      className="absolute -bottom-4 left-0 right-0 h-1 bg-[#FF6B16] rounded-full"
                    />
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {/* Full-width Panoramic Split Panels matching Reference 1 */}
        <div className="w-full overflow-x-auto pb-4 scrollbar-none px-2 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-[1000px] lg:min-w-full h-[400px] sm:h-[480px] gap-3">
            {EXPEDITION_PANELS.map((panel, idx) => (
              <motion.div
                key={panel.id}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative group overflow-hidden cursor-pointer h-full rounded-3xl border border-neutral-300/80 shadow-md hover:shadow-2xl transition-all"
                onClick={() =>
                  setLightboxImage({
                    url: panel.image,
                    title: panel.title,
                    trip: panel.subtitle,
                  })
                }
              >
                <img
                  src={panel.image}
                  alt={panel.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent group-hover:from-black/85 transition-colors" />

                {/* Hotspot Ring on Centerpiece (matches Reference 1) */}
                {panel.isCenter && (
                  <div className="absolute top-[36%] right-[22%]">
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-[#FF6B16]/80 backdrop-blur-sm animate-pulse shadow-lg">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                  </div>
                )}

                {/* Panel Footer */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#FF6B16]">
                        {panel.tag}
                      </span>
                      <h3
                        className="text-lg sm:text-xl font-serif tracking-wide mt-0.5 uppercase"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {panel.title}
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 line-clamp-1">
                        {panel.subtitle}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#FF6B16] transition-colors shrink-0 pl-3">
                      <span>VIEW</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* ── SECTION 4: LUXURY SUMMIT CHALET & STAYS (Reference 4) ── */}
      {/* ============================================================== */}
      <section className="py-24 bg-white border-t border-neutral-200 relative">
        <Container>
          {/* Section Sub-Navigation Tabs (01, 02, 03, 04) in Light Theme */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 border-b border-neutral-200">
            {EXPEDITION_ACCOMMODATIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveShowcaseId(item.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeShowcaseId === item.id
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'text-neutral-600 hover:text-[#111111] bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200'
                }`}
              >
                <span>{item.number}</span>
              </button>
            ))}
          </div>

          {/* Active Stay Split Grid (Matches Reference 4 layout exactly with Light theme) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column: Details & Floating Bathroom Inset */}
            <motion.div
              key={`left-${activeShowcase.id}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 flex flex-col justify-between py-2"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF6B16]">
                  {activeShowcase.tripName} • {activeShowcase.location}
                </span>
                <h3
                  className="text-3xl sm:text-4xl font-serif text-[#111111] tracking-tight mt-1.5 mb-4"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {activeShowcase.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed mb-6">
                  {activeShowcase.desc}
                </p>

                {/* Floating Inset Bathroom Photo with Backlit Mirror (From Reference 4) */}
                <div
                  className="relative rounded-2xl overflow-hidden aspect-[16/10] max-w-sm border border-neutral-300 shadow-md group cursor-pointer mb-8"
                  onClick={() =>
                    setLightboxImage({
                      url: activeShowcase.bathroomImg,
                      title: 'Spa En-Suite Bath with Soaking Tub',
                      trip: activeShowcase.number,
                    })
                  }
                >
                  <img
                    src={activeShowcase.bathroomImg}
                    alt="Spa Bathroom"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#111111] px-2.5 py-1 rounded-md shadow-sm">
                    En-Suite Bath
                  </span>
                </div>
              </div>

              {/* DETAILS List matching Reference 4 bottom left */}
              <div className="pt-6 border-t border-neutral-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-3">
                  EXPEDITION AMENITIES & SPECS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeShowcase.details.map((detail, dIdx) => {
                    const IconComp = detail.icon;
                    return (
                      <div key={dIdx} className="flex items-center gap-2.5 text-xs text-neutral-700 font-semibold">
                        <div className="w-7 h-7 rounded-lg bg-[#FF6B16]/10 flex items-center justify-center text-[#FF6B16] shrink-0">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span>{detail.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right Column: Giant Full-Height Photo (Matches Reference 4 right bed/rock wall) */}
            <motion.div
              key={`right-${activeShowcase.id}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 relative group cursor-pointer"
              onClick={() =>
                setLightboxImage({
                  url: activeShowcase.mainImg,
                  title: activeShowcase.title,
                  trip: `${activeShowcase.tripName} • ${activeShowcase.location}`,
                })
              }
            >
              <div className="relative rounded-3xl overflow-hidden h-[450px] sm:h-[580px] border border-neutral-200 shadow-xl">
                <img
                  src={activeShowcase.mainImg}
                  alt={activeShowcase.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Hotspot circle on ceiling wood/rock (matches Reference 4) */}
                <div className="absolute top-[28%] right-[32%]">
                  <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-[#FF6B16]/80 backdrop-blur-sm animate-pulse shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <span className="text-xs font-bold text-[#FF6B16] tracking-widest uppercase">
                      HIMALAYAN LIVING & CAMPS
                    </span>
                    <h4 className="text-xl font-serif mt-1">
                      {activeShowcase.tripName}
                    </h4>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-white text-[#111111] text-xs font-bold shadow-md">
                    Click to Zoom
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* ── SECTION 5: ALL-TRIP CURATED MASONRY GRID (White Theme) ── */}
      {/* ============================================================== */}
      <section id="masonry-gallery" className="py-24 bg-[#F7F7F5] border-t border-neutral-200/90">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold text-[#FF6B16] tracking-widest uppercase">
                WEEKEND ESCAPES GALLERY
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#111111] tracking-tight mt-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Captures from Our Expeditions
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-lg">
                Raw, authentic photos taken during actual batch tours across Kedarkantha, Kashmir, Manali, Spiti, and Bali.
              </p>
            </div>

            {/* Filter Pills in White Theme */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['All', 'Kedarkantha Trek', 'Kashmir Getaway', 'Manali Adventure', 'Spiti Valley', 'Bali Escape'].map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setGridFilter(filter)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      gridFilter === filter
                        ? 'bg-[#FF6B16] text-white shadow-md shadow-[#FF6B16]/25'
                        : 'bg-white text-neutral-600 hover:text-black border border-neutral-300/80 shadow-sm'
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Masonry-Style Photo Grid with Light Theme cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[220px]">
            {filteredGrid.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
                className={`relative group rounded-3xl overflow-hidden border border-neutral-200/90 shadow-sm hover:shadow-xl transition-all cursor-pointer bg-white ${item.span}`}
                onClick={() =>
                  setLightboxImage({
                    url: item.image,
                    title: item.title,
                    trip: `${item.trip} • ${item.location}`,
                  })
                }
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = SITE_MEDIA.heroLandscape;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

                {/* Hover overlay icon */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#111111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Card Title & Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold text-[#FF6B16] uppercase tracking-widest">
                    {item.trip}
                  </span>
                  <h4 className="text-sm font-bold leading-tight mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-300 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-[#FF6B16] shrink-0" />
                    <span>{item.location}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* ── LIGHTBOX MODAL FULLSCREEN ZOOM VIEW ── */}
      {/* ============================================================== */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxImage(null)}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Card */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
              />
              <div className="mt-4 text-center text-white">
                <h3 className="text-lg font-bold">{lightboxImage.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">{lightboxImage.trip}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
