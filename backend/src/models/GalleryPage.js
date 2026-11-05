import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema(
  {
    value: { type: String, default: '' },
    label: { type: String, default: '' },
    highlightColor: { type: String, default: '#FF6B16' },
  },
  { _id: false }
);

const philosophyBottomCardSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => 'card_' + Math.random().toString(36).substring(2, 9) },
    image: { type: String, default: '' },
    tag: { type: String, default: '' },
    title: { type: String, default: '' },
    trip: { type: String, default: '' },
  },
  { _id: false }
);

const filmstripPanelSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => 'panel_' + Math.random().toString(36).substring(2, 9) },
    category: { type: String, default: 'HIMALAYAN TREKS' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    tag: { type: String, default: '' },
    isCenter: { type: Boolean, default: false },
  },
  { _id: false }
);

const accommodationDetailSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'Users' },
    label: { type: String, default: '' },
  },
  { _id: false }
);

const accommodationSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => 'stay_' + Math.random().toString(36).substring(2, 9) },
    number: { type: String, default: '01. KEDARKANTHA RIDGE DOME' },
    tripName: { type: String, default: '' },
    title: { type: String, default: '' },
    location: { type: String, default: '' },
    desc: { type: String, default: '' },
    bathroomImg: { type: String, default: '' },
    mainImg: { type: String, default: '' },
    details: { type: [accommodationDetailSchema], default: [] },
  },
  { _id: false }
);

const masonryItemSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => 'item_' + Math.random().toString(36).substring(2, 9) },
    trip: { type: String, default: '' },
    category: { type: String, default: '' },
    title: { type: String, default: '' },
    location: { type: String, default: '' },
    image: { type: String, default: '' },
    span: { type: String, default: 'col-span-1 row-span-1' },
  },
  { _id: false }
);

const galleryPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      default: 'gallery_main',
      unique: true,
      index: true,
    },
    hero: {
      badge: {
        type: String,
        default: 'WEEKEND ESCAPES • OFFICIAL PHOTO ARCHIVE',
      },
      preHeading: {
        type: String,
        default: 'GET AN',
      },
      heading: {
        type: String,
        default: 'Experience',
      },
      description: {
        type: String,
        default:
          'Unfiltered captures from our real expedition departures — from snowy Kedarkantha ridge summits and Dal Lake wooden houseboats to Solang slopes and high-altitude Spiti desert homestays.',
      },
      bgImage: {
        type: String,
        default: '/newimage/herosecction/heroimage.png',
      },
      metrics: {
        type: [metricSchema],
        default: [
          { value: '12,500 ft', label: 'Kedarkantha Summit', highlightColor: '#FF6B16' },
          { value: '100%', label: 'Batch Tour Captures', highlightColor: '#111111' },
          { value: '5 Core Hubs', label: 'Himalayas to Bali', highlightColor: '#FF6B16' },
          { value: 'Certified', label: 'Wilderness Leaders', highlightColor: '#111111' },
        ],
      },
    },
    philosophy: {
      badge: {
        type: String,
        default: 'WEEKEND ESCAPES PHILOSOPHY',
      },
      title: {
        type: String,
        default: 'More than a trip — an experience.',
      },
      description: {
        type: String,
        default:
          'Every tour with Weekend Escapes is engineered for authenticity: certified mountaineering trek marshals, cozy basecamp stays, hot regional meals, and friendships that last long after the journey ends.',
      },
      leftCard: {
        image: {
          type: String,
          default:
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=85&w=1200&auto=format&fit=crop',
        },
        title: {
          type: String,
          default: 'Thermal Hot Tub Soak after Snowy Trek Day',
        },
        trip: {
          type: String,
          default: 'Manali Adventure • Solang Valley',
        },
      },
      rightCard: {
        image: {
          type: String,
          default:
            'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=85&w=1200&auto=format&fit=crop',
        },
        title: {
          type: String,
          default: 'Gulmarg Gondola Ascent to Apharwat Phase 2',
        },
        trip: {
          type: String,
          default: 'Kashmir Getaway • 13,780 ft',
        },
        tag: {
          type: String,
          default: 'Gulmarg Peak 13,780 ft',
        },
      },
      bottomCards: {
        type: [philosophyBottomCardSchema],
        default: [
          {
            id: 'bot_1',
            image:
              'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=85&w=1200&auto=format&fit=crop',
            tag: 'MANALI ADVENTURE',
            title: 'Solang Snow Slopes & Sports',
            trip: 'Manali Adventure • Solang Valley',
          },
          {
            id: 'bot_2',
            image:
              'https://images.unsplash.com/photo-1517824806704-9040b037703b?q=85&w=1200&auto=format&fit=crop',
            tag: 'STARGAZING & BONFIRES',
            title: 'Campfire Nights under Snow Peaks',
            trip: 'Weekend Escapes Evenings',
          },
          {
            id: 'bot_3',
            image:
              'https://images.unsplash.com/photo-1471400974796-1c823d00a96f?q=85&w=1200&auto=format&fit=crop',
            tag: 'EXPEDITION MORNINGS',
            title: 'Steaming Hot Chai & Sunrise Vistas',
            trip: 'Himalayan Trek Mornings',
          },
        ],
      },
    },
    filmstrip: {
      categories: {
        type: [String],
        default: ['HIMALAYAN TREKS', 'SCENIC & LAKES', 'CAMPS & BONFIRE', 'ROAD EXPEDITIONS'],
      },
      panels: {
        type: [filmstripPanelSchema],
        default: [
          {
            id: 'kedarkantha-sunrise',
            category: 'HIMALAYAN TREKS',
            title: 'JUDA KA TALAB ALPINE SUNRISE',
            subtitle:
              'Steaming ginger chai, snow gaiters & morning sunrise reflection over the frozen lake',
            image: '/newimage/exploresection/kedarkantha.png',
            tag: 'Kedarkantha • 9,100 ft',
            isCenter: false,
          },
          {
            id: 'kashmir-shikara',
            category: 'SCENIC & LAKES',
            title: 'DAL LAKE SUNSET SHIKARA',
            subtitle:
              'Golden waters, floating lotus gardens, and traditional Kashmiri saffron Kahwa',
            image: '/newimage/exploresection/kashmir.png',
            tag: 'Srinagar • Kashmir',
            isCenter: false,
          },
          {
            id: 'trail-hampers',
            category: 'CAMPS & BONFIRE',
            title: 'EXPEDITION TRAIL HAMPERS',
            subtitle:
              'Artisan trail sandwiches, energy bars, dry fruits, and hot thermos soup on high passes',
            image:
              'https://images.unsplash.com/photo-1574390696797-d1c894b7ec79?q=85&w=1200&auto=format&fit=crop',
            tag: 'Trail Food & Dining',
            isCenter: true,
          },
          {
            id: 'manali-bonfire',
            category: 'ROAD EXPEDITIONS',
            title: 'OLD MANALI ACOUSTIC BONFIRE',
            subtitle:
              'Fireside acoustic jams, mountain stories, and stargazing by the Beas riverbanks',
            image:
              'https://images.unsplash.com/photo-1659187313578-66ec5323bc2f?q=85&w=1200&auto=format&fit=crop',
            tag: 'Evening Community',
            isCenter: false,
          },
        ],
      },
    },
    accommodations: {
      type: [accommodationSchema],
      default: [
        {
          id: '01',
          number: '01. KEDARKANTHA RIDGE DOME',
          tripName: 'Kedarkantha Trek (6D/5N)',
          title: 'INSULATED ALPINE DOME BASECAMP',
          location: 'Sankri / Juda Ka Talab, Uttarakhand',
          desc: 'Insulated 4-season geodesic dome camp equipped with heavy-duty down sleeping bags, fleece liners, hot water bottles, and 360-degree snow peak vistas.',
          bathroomImg:
            'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=85&w=800&auto=format&fit=crop',
          mainImg: '/newimage/exploresection/kedarkantha.png',
          details: [
            { icon: 'Users', label: '2 - 3 Trekkers per Dome' },
            { icon: 'Maximize', label: 'Insulated Dual-layer Fabric' },
            { icon: 'Bed', label: 'Sub-zero Thermal Bedding' },
            { icon: 'Mountain', label: 'Views of Swargarohini Peaks' },
          ],
        },
        {
          id: '02',
          number: '02. DAL LAKE HERITAGE HOUSEBOAT',
          tripName: 'Kashmir Getaway (7D/6N)',
          title: 'ROYAL DEODAR CEDAR HOUSEBOAT',
          location: 'Nigeen Lake / Dal Lake, Srinagar',
          desc: 'Century-old carved deodar cedar wood luxury houseboat with antique walnut furnishings, private lakeside front deck, and complimentary morning Shikara ride.',
          bathroomImg:
            'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=85&w=800&auto=format&fit=crop',
          mainImg: '/newimage/exploresection/kashmir.png',
          details: [
            { icon: 'Users', label: '2 - 4 Guests (Private Suite)' },
            { icon: 'Maximize', label: '55 sqm | Historic Heritage' },
            { icon: 'Bed', label: '2 King Luxury Bedrooms' },
            { icon: 'Mountain', label: 'Private Dal Lake Front Balcony' },
          ],
        },
        {
          id: '03',
          number: '03. SUMMIT CHALET & LOFT',
          tripName: 'Manali Adventure (5D/4N)',
          title: 'SOLANG VALLEY ALPINE LOFT & CHALET',
          location: 'Solang Valley / Old Manali, Himachal',
          desc: 'Features an open-plan living area, panoramic floor-to-ceiling glass walls, and a spa-inspired bathroom with a cedar soaking tub facing the snowy valley.',
          bathroomImg:
            'https://images.unsplash.com/photo-1667837526762-0e4dcb3d0def?q=85&w=800&auto=format&fit=crop',
          mainImg:
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=85&w=1400&auto=format&fit=crop',
          details: [
            { icon: 'Users', label: '2 - 4 Travelers' },
            { icon: 'Maximize', label: '45 sqm | 485 sq ft' },
            { icon: 'Bed', label: '1 King-size Luxury Bed' },
            { icon: 'Mountain', label: 'Private Balcony with Peak Views' },
          ],
        },
        {
          id: '04',
          number: '04. SPITI STONE RETREAT',
          tripName: 'Spiti Valley Expedition (8D/7N)',
          title: 'KIBBER HERITAGE HOMESTAY',
          location: 'Kibber Village (14,200 ft), Spiti',
          desc: 'Traditional Tibetan mud-stone architecture offering geothermal natural warmth, authentic wood Bukhari stove, organic Spiti meals, and rooftop Milky Way views.',
          bathroomImg:
            'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=85&w=800&auto=format&fit=crop',
          mainImg: '/newimage/exploresection/vally.png',
          details: [
            { icon: 'Users', label: '2 - 3 Explorers' },
            { icon: 'Maximize', label: 'Handcrafted Stone Living' },
            { icon: 'Bed', label: 'Authentic Tibetan Wool Mattresses' },
            { icon: 'Mountain', label: 'Views of Key Monastery' },
          ],
        },
      ],
    },
    masonry: {
      eyebrow: {
        type: String,
        default: 'WEEKEND ESCAPES GALLERY',
      },
      title: {
        type: String,
        default: 'Captures from Our Expeditions',
      },
      subtitle: {
        type: String,
        default:
          'Raw, authentic photos taken during actual batch tours across Kedarkantha, Kashmir, Manali, Spiti, and Bali.',
      },
      categories: {
        type: [String],
        default: [
          'All',
          'Kedarkantha Trek',
          'Kashmir Getaway',
          'Manali Adventure',
          'Spiti Valley',
          'Bali Escape',
        ],
      },
      items: {
        type: [masonryItemSchema],
        default: [
          {
            id: 'p1',
            trip: 'Kedarkantha Trek',
            category: 'Himalayan Treks',
            title: 'Summit Push at 12,500 ft (Snow Trail)',
            location: 'Sankri, Uttarakhand',
            image: '/newimage/exploresection/kedarkantha.png',
            span: 'col-span-1 md:col-span-2 row-span-2',
          },
          {
            id: 'p2',
            trip: 'Kashmir Getaway',
            category: 'Scenic Views',
            title: 'Sunset Shikara Cruise on Dal Lake',
            location: 'Srinagar, Kashmir',
            image: '/newimage/exploresection/kashmir.png',
            span: 'col-span-1 row-span-1',
          },
          {
            id: 'p3',
            trip: 'Manali Adventure',
            category: 'Adventure',
            title: 'Solang Valley Paragliding & Ski Slopes',
            location: 'Manali, Himachal Pradesh',
            image: '/newimage/exploresection/manali.png',
            span: 'col-span-1 row-span-1',
          },
          {
            id: 'p4',
            trip: 'Spiti Valley',
            category: 'Scenic Views',
            title: 'Chandratal Crescent Moon Lake Camp',
            location: 'Spiti Valley, Himachal Pradesh',
            image: '/newimage/exploresection/vally.png',
            span: 'col-span-1 row-span-2',
          },
          {
            id: 'p5',
            trip: 'Bali Escape',
            category: 'International',
            title: 'Kelingking T-Rex Beach & Coastal Cliffs',
            location: 'Nusa Penida, Bali',
            image: '/newimage/exploresection/bali.png',
            span: 'col-span-1 md:col-span-2 row-span-1',
          },
          {
            id: 'p6',
            trip: 'Kedarkantha Trek',
            category: 'Camps & Stays',
            title: 'Juda Ka Talab Frozen Alpine Campsite',
            location: 'Govind Pashu Vihar, Uttarakhand',
            image: '/newimage/about/kedarkantha.png',
            span: 'col-span-1 row-span-1',
          },
          {
            id: 'p7',
            trip: 'Kashmir Getaway',
            category: 'Adventure',
            title: 'Gulmarg Gondola to Apharwat Snow Peak',
            location: 'Gulmarg, Kashmir',
            image:
              'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=85&w=1200&auto=format&fit=crop',
            span: 'col-span-1 md:col-span-2 row-span-1',
          },
          {
            id: 'p8',
            trip: 'Manali Adventure',
            category: 'Camps & Stays',
            title: 'Old Manali Riverside Chalet Evenings',
            location: 'Beas River Valley, Manali',
            image: '/newimage/about/manali.png',
            span: 'col-span-1 row-span-1',
          },
        ],
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

const GalleryPage = mongoose.model('GalleryPage', galleryPageSchema);
export default GalleryPage;
