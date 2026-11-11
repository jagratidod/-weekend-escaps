import Package from '../models/Package.js';
import { generateDefaultPackageFAQs } from './packageFaqHelper.js';

export const RAW_DEFAULT_PACKAGES = [
  {
    id: 'kedarkantha-trek',
    name: 'Kedarkantha Trek',
    badge: 'Best Seller',
    badgeColor: 'bg-[#FF6B16] text-white',
    duration: '6 Days / 5 Nights',
    location: 'Uttarakhand, India',
    price: 8999,
    originalPrice: 12999,
    pricingType: 'sharing',
    pricingTiers: [
      { name: 'Quad Sharing', subtext: 'Camp in Kedarnath', price: 8999, originalPrice: 11999, isDefault: true },
      { name: 'Triple Sharing', subtext: 'Camp in Kedarnath', price: 9499, originalPrice: 12499, isDefault: false },
      { name: 'Double Sharing', subtext: 'Camp in Kedarnath', price: 9999, originalPrice: 13999, isDefault: false },
    ],
    rating: 4.9,
    reviewsCount: 320,
    image: '/newimage/exploresection/kedarkantha.png',
    travelType: 'Treks',
    difficulty: 'Easy to Moderate',
    season: 'Dec - Apr (Winter Snow)',
    groupSize: '12 - 18 Explorers',
    isTrending: true,
    isFeatured: true,
    isPrivateTrek: true,
    privateTrekNote: 'Direct WhatsApp Booking • Custom Batches',
    isActive: true,
    order: 1,
    included: [
      'Meals & Alpine Camps',
      'Certified Trek Leader & Local Guides',
      'Microspikes & Snow Gaiters',
      'Govind Wildlife Sanctuary Permits',
      'First Aid & Oxygen Cylinder Support',
    ],
    excluded: [
      'Personal trekking gear (backpack, shoes, thermals)',
      'Travel insurance',
      'Personal expenses & tipping',
    ],
    itinerary: [
      { day: 'Day 1', title: 'Drive from Dehradun to Sankri', desc: 'Scenic mountain drive via Mussoorie and Yamuna river valley (220 km).' },
      { day: 'Day 2', title: 'Trek from Sankri to Juda Ka Talab', desc: 'Gradual climb through dense oak and pine forests to high altitude lake.' },
      { day: 'Day 3', title: 'Trek to Kedarkantha Base Camp', desc: 'Emerge into open snowy meadows with arresting views of Bandarpoonch peaks.' },
      { day: 'Day 4', title: 'Summit Day & Descent to Hargaon', desc: 'Early 3 AM push to summit for spectacular sunrise over Himalayan ranges.' },
      { day: 'Day 5', title: 'Trek from Hargaon to Sankri', desc: 'Descent through scenic apple orchards and local villages.' },
      { day: 'Day 6', title: 'Drive from Sankri back to Dehradun', desc: 'Return with lifetime mountain memories and certified trek badge.' },
    ],
  },
  {
    id: 'kashmir-getaway',
    name: 'Kashmir Getaway',
    badge: 'New',
    badgeColor: 'bg-[#FF6B16] text-white',
    duration: '7 Days / 6 Nights',
    location: 'Jammu & Kashmir, India',
    price: 15999,
    originalPrice: 21999,
    rating: 4.95,
    reviewsCount: 450,
    image: '/newimage/exploresection/kashmir.png',
    travelType: 'Weekend Getaways',
    difficulty: 'Easy',
    season: 'All Year Round',
    groupSize: 'Family / Couples / Small Groups',
    isTrending: true,
    isFeatured: true,
    isPrivateTrek: true,
    privateTrekNote: 'Direct WhatsApp Booking • Custom Batches',
    isActive: true,
    order: 2,
    included: [
      'Heritage Wooden Houseboat Stay in Dal Lake',
      'Private Sanitized Cab for All Transfers',
      'Sunset Shikara Ride on Dal Lake',
      'All Daily Breakfasts & Dinners',
      'Local Tour Guide & Sightseeing Passes',
    ],
    excluded: [
      'Gondola ride tickets at Gulmarg Phase 2',
      'Pony rides or local ATV rentals',
      'Airfare to/from Srinagar',
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrive Srinagar & Dal Lake Shikara Ride', desc: 'Check-in to a luxury wooden houseboat with evening sunset cruise.' },
      { day: 'Day 2', title: 'Mughal Gardens & Old Srinagar Heritage', desc: 'Explore Nishat Bagh, Shalimar Bagh, and historic Shankaracharya Temple.' },
      { day: 'Day 3', title: 'Gulmarg Day Trip - Meadow of Flowers', desc: 'Board the world\'s highest operating Gondola cable car ride.' },
      { day: 'Day 4', title: 'Pahalgam - Valley of Shepherds', desc: 'En route visit Saffron fields at Pampore and Avantipur ruins.' },
      { day: 'Day 5', title: 'Betaab & Aru Valley Excursion', desc: 'Pristine alpine meadows, crystal clear streams, and pony rides.' },
      { day: 'Day 6', title: 'Sonmarg - Meadow of Gold', desc: 'Gateway to Ladakh, Thajiwas Glacier pony trek and snowy landscapes.' },
      { day: 'Day 7', title: 'Departure with Kashmir Memories', desc: 'Transfer to Srinagar airport with authentic Kashmiri saffron and tea.' },
    ],
  },
  {
    id: 'manali-adventure',
    name: 'Manali Adventure',
    badge: 'Popular',
    badgeColor: 'bg-[#FF6B16] text-white',
    duration: '5 Days / 4 Nights',
    location: 'Himachal Pradesh, India',
    price: 5999,
    originalPrice: 8999,
    pricingType: 'distance',
    pricingTiers: [
      { name: 'Manali to Manali', subtext: 'Ex-Basecamp (Self Drive / Direct Report)', price: 5999, originalPrice: 8999, isDefault: true },
      { name: 'Delhi to Delhi', subtext: 'Including AC Volvo Bus Transfers', price: 7999, originalPrice: 11999, isDefault: false },
    ],
    rating: 4.85,
    reviewsCount: 680,
    image: '/newimage/exploresection/manali.png',
    travelType: 'Adventure',
    difficulty: 'Easy to Moderate',
    season: 'March - November',
    groupSize: 'Friends & Groups',
    isTrending: true,
    isFeatured: true,
    isPrivateTrek: true,
    privateTrekNote: 'Direct WhatsApp Booking • Custom Batches',
    isActive: true,
    order: 3,
    included: [
      'Riverside Boutique Resort Stay',
      'White Water Rafting & Solang Valley Passes',
      'Atal Tunnel & Sissu Waterfall Day Excursion',
      'Evening Acoustic Bonfire & Music',
      'All Breakfasts & Dinners',
    ],
    excluded: [
      'Personal adventure sports gear',
      'Lunches & personal shopping in Mall Road',
      'Any extra vehicle charges for snow points',
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrive Manali & Old Manali Cafes', desc: 'Stroll Hadimba Temple, Mall Road, and Bohemian riverside cafes.' },
      { day: 'Day 2', title: 'Solang Valley Thrills & Atal Tunnel', desc: 'Zipline, Zorbing, ATV rides, and traverse the world\'s longest highway tunnel.' },
      { day: 'Day 3', title: 'Jogini Waterfalls & Vashisht Hot Springs', desc: 'Scenic nature trek through apple orchards leading to cascading waterfalls.' },
      { day: 'Day 4', title: 'White Water River Rafting in Kullu', desc: 'Class III-IV rapids in the foaming Beas River followed by riverside lunch.' },
      { day: 'Day 5', title: 'Farewell Manali', desc: 'Shopping for Tibetan handicrafts and evening Volvo bus departure.' },
    ],
  },
  {
    id: 'bali-escape',
    name: 'Bali Escape',
    badge: 'Trending',
    badgeColor: 'bg-[#FF6B16] text-white',
    duration: '7 Days / 6 Nights',
    location: 'Bali, Indonesia',
    price: 48999,
    originalPrice: 62000,
    rating: 4.9,
    reviewsCount: 890,
    image: '/newimage/exploresection/bali.png',
    travelType: 'International',
    difficulty: 'Easy',
    season: 'Apr - Oct',
    groupSize: 'Couples & Small Groups',
    isTrending: true,
    isFeatured: true,
    isPrivateTrek: true,
    privateTrekNote: 'Direct WhatsApp Booking • Custom Batches',
    isActive: true,
    order: 4,
    included: [
      '4-Star Private Pool Villa in Seminyak & Ubud',
      'Nusa Penida Fast Boat & Private Island Tour',
      'Ubud Giant Swings & Tegalalang Rice Terraces',
      'Iconic Floating Breakfast in Private Pool',
      'Private Air-Conditioned Vehicle with English Speaking Driver',
    ],
    excluded: [
      'International flights to Denpasar (DPS)',
      'Visa on Arrival fees (if applicable)',
      'Personal expenses & tipping',
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrival in Denpasar & Seminyak Sunset', desc: 'Welcome garlands and check-in to your private luxury pool villa.' },
      { day: 'Day 2', title: 'Ubud Rice Terraces & Iconic Giant Swings', desc: 'Tegalalang emerald rice fields, Luwak coffee plantation, and monkey forest.' },
      { day: 'Day 3', title: 'Mount Batur Sunrise & Hot Springs', desc: 'Early morning jeep or trek for breathtaking sunrise above caldera clouds.' },
      { day: 'Day 4', title: 'Nusa Penida Day Cruise', desc: 'Visit Kelingking T-Rex cliff, Angel\'s Billabong, and Broken Beach.' },
      { day: 'Day 5', title: 'Ulun Danu Beratan & Handara Gate', desc: 'The iconic floating lake temple and world-famous Bali stone gate.' },
      { day: 'Day 6', title: 'Uluwatu Sunset Temple & Kecak Fire Dance', desc: 'Dramatic cliff temple overlooking the Indian Ocean with fire dance ritual.' },
      { day: 'Day 7', title: 'Spa Session & Flight Home', desc: 'Traditional Balinese aroma massage before airport drop-off.' },
    ],
  },
,
  {
    id: 'tungnath',
    name: 'Chopta Tungnath & Chandrashila Trek',
    badge: 'Highest Shiva Temple',
    badgeColor: 'bg-[#FF6B16] text-white',
    duration: '5 Days / 4 Nights',
    location: 'Chopta, Uttarakhand',
    price: 6499,
    originalPrice: 8999,
    pricingType: 'sharing',
    pricingTiers: [
      { name: 'Quad Sharing', subtext: 'Camp in Chopta', price: 6499, originalPrice: 8999, isDefault: true },
      { name: 'Triple Sharing', subtext: 'Camp in Chopta', price: 6999, originalPrice: 9499, isDefault: false },
      { name: 'Double Sharing', subtext: 'Camp in Chopta', price: 7499, originalPrice: 10499, isDefault: false },
    ],
    rating: 4.95,
    reviewsCount: 380,
    image: '/newimage/exploresection/kedarkantha.png',
    travelType: 'Treks',
    difficulty: 'Easy to Moderate',
    season: 'All Year Round (Snow in Winter)',
    groupSize: '12 - 18 Explorers',
    departureCities: ['Ahmedabad', 'Mumbai', 'Pune'],
    isTrending: true,
    isFeatured: true,
    isPrivateTrek: false,
    isActive: true,
    order: 2,
    included: [
      'Alpine Camps & Swiss Tents in Chopta',
      'Experienced Certified Trek Leader & Mountain Guides',
      'All Meals during Trek (Healthy Veg & Egg options)',
      'Forest Entry Permits & Eco Passes',
      'First Aid Kit & Emergency Oxygen Cylinder Support',
    ],
    excluded: [
      'Personal trekking gear (shoes, backpack, thermals)',
      'Mule or Porter charges for personal backpack',
      'Travel insurance',
      'Any meals during transit',
    ],
    itinerary: [
      { day: 'Day 1', title: 'Rishikesh to Chopta Basecamp (200 km)', desc: 'Scenic mountain drive along the Alaknanda and Mandakini rivers via Devprayag Sangam to Chopta.' },
      { day: 'Day 2', title: 'Trek to Tungnath Temple & Chandrashila Peak', desc: 'Climb through rhododendron forests to the 1,000-year-old Tungnath Temple (highest Shiva shrine) and Chandrashila 4,000m panoramic summit.' },
      { day: 'Day 3', title: 'Trek to Deoriatal Emerald Alpine Lake', desc: 'Short trek through lush oak forests from Sari village to pristine Deoriatal with mirror reflections of Chaukhamba peaks.' },
      { day: 'Day 4', title: 'Chopta to Rishikesh Return', desc: 'Descent drive back to Rishikesh with optional Ganga Aarti and riverside cafe exploration.' },
      { day: 'Day 5', title: 'Departure', desc: 'Breakfast by the Ganges and onward departure for your home city.' }
    ],
    availability: {
      scheduleType: 'batches',
      defaultSeatsPerBatch: 16,
      minAdvanceNoticeDays: 1,
      batches: [
        { startDate: '2027-03-05', endDate: '2027-03-10', city: 'Ahmedabad', totalSeats: 16, bookedSeats: 2, status: 'available', note: 'March Batch 1' },
        { startDate: '2027-03-12', endDate: '2027-03-17', city: 'Ahmedabad', totalSeats: 16, bookedSeats: 3, status: 'available', note: 'March Batch 2' },
        { startDate: '2027-03-19', endDate: '2027-03-24', city: 'Ahmedabad', totalSeats: 16, bookedSeats: 4, status: 'available', note: 'March Batch 3' },
        { startDate: '2027-03-26', endDate: '2027-03-31', city: 'Ahmedabad', totalSeats: 16, bookedSeats: 1, status: 'available', note: 'March Batch 4' },

        { startDate: '2027-03-05', endDate: '2027-03-10', city: 'Mumbai', totalSeats: 16, bookedSeats: 3, status: 'available', note: 'Mumbai Group' },
        { startDate: '2027-03-12', endDate: '2027-03-17', city: 'Mumbai', totalSeats: 16, bookedSeats: 2, status: 'available', note: 'Spring Special' },
        { startDate: '2027-03-19', endDate: '2027-03-24', city: 'Mumbai', totalSeats: 16, bookedSeats: 5, status: 'available', note: 'High Demand' },
        { startDate: '2027-03-26', endDate: '2027-03-31', city: 'Mumbai', totalSeats: 16, bookedSeats: 2, status: 'available', note: 'Weekend Explorer' },

        { startDate: '2027-03-05', endDate: '2027-03-10', city: 'Pune', totalSeats: 16, bookedSeats: 2, status: 'available', note: 'Pune Circle' },
        { startDate: '2027-03-12', endDate: '2027-03-17', city: 'Pune', totalSeats: 16, bookedSeats: 4, status: 'available', note: 'Mid-March Special' },
        { startDate: '2027-03-19', endDate: '2027-03-24', city: 'Pune', totalSeats: 16, bookedSeats: 3, status: 'available', note: 'Spring Adventure' },
        { startDate: '2027-03-26', endDate: '2027-03-31', city: 'Pune', totalSeats: 16, bookedSeats: 1, status: 'available', note: 'End-March Departure' },

        { startDate: '2026-04-03', endDate: '2026-04-08', city: 'Ahmedabad', totalSeats: 16, bookedSeats: 3, status: 'available', note: 'Long Weekend Batch' },
        { startDate: '2026-04-10', endDate: '2026-04-15', city: 'Ahmedabad', totalSeats: 16, bookedSeats: 2, status: 'available', note: 'Spring Snow' },
        { startDate: '2026-04-17', endDate: '2026-04-22', city: 'Ahmedabad', totalSeats: 16, bookedSeats: 5, status: 'available', note: 'Summit Push' },
        { startDate: '2026-04-24', endDate: '2026-04-29', city: 'Ahmedabad', totalSeats: 16, bookedSeats: 2, status: 'available', note: 'April Departure' },

        { startDate: '2026-04-03', endDate: '2026-04-08', city: 'Mumbai', totalSeats: 16, bookedSeats: 4, status: 'available', note: 'Long Weekend Batch' },
        { startDate: '2026-04-10', endDate: '2026-04-15', city: 'Mumbai', totalSeats: 16, bookedSeats: 3, status: 'available', note: 'Spring Snow' },
        { startDate: '2026-04-17', endDate: '2026-04-22', city: 'Mumbai', totalSeats: 16, bookedSeats: 4, status: 'available', note: 'Summit Push' },
        { startDate: '2026-04-24', endDate: '2026-04-29', city: 'Mumbai', totalSeats: 16, bookedSeats: 1, status: 'available', note: 'April Departure' },

        { startDate: '2026-04-03', endDate: '2026-04-08', city: 'Pune', totalSeats: 16, bookedSeats: 2, status: 'available', note: 'Long Weekend Batch' },
        { startDate: '2026-04-10', endDate: '2026-04-15', city: 'Pune', totalSeats: 16, bookedSeats: 3, status: 'available', note: 'Spring Snow' },
        { startDate: '2026-04-17', endDate: '2026-04-22', city: 'Pune', totalSeats: 16, bookedSeats: 4, status: 'available', note: 'Summit Push' },
        { startDate: '2026-04-24', endDate: '2026-04-29', city: 'Pune', totalSeats: 16, bookedSeats: 2, status: 'available', note: 'April Departure' },
      ]
    }
  }
];

export const DEFAULT_PACKAGES = RAW_DEFAULT_PACKAGES.map((pkg) => ({
  ...pkg,
  faqs: generateDefaultPackageFAQs(pkg),
}));

export const seedFaqsForExistingPackages = async () => {
  try {
    const packages = await Package.find({});
    let updatedCount = 0;
    for (const pkg of packages) {
      if (!Array.isArray(pkg.faqs) || pkg.faqs.length === 0) {
        pkg.faqs = generateDefaultPackageFAQs(pkg);
        await pkg.save();
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`[Seed] Successfully seeded FAQs for ${updatedCount} existing packages in MongoDB.`);
    }
    return updatedCount;
  } catch (err) {
    console.error('[Seed] Error seeding FAQs for existing packages:', err.message);
    return 0;
  }
};

export const seedDefaultPackages = async () => {
  try {
    const count = await Package.countDocuments();
    if (count === 0) {
      console.log('[Seed] No packages found in database. Seeding initial packages...');
      await Package.insertMany(DEFAULT_PACKAGES);
      console.log(`[Seed] Successfully seeded ${DEFAULT_PACKAGES.length} packages into MongoDB!`);
    } else {
      // Seed FAQs for any existing packages that don't have them yet
      await seedFaqsForExistingPackages();
    }
  } catch (err) {
    console.error('[Seed] Package seeding error:', err.message);
  }
};
