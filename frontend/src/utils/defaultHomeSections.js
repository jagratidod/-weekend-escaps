export const DEFAULT_HOME_SECTIONS = {
  hero: {
    badge: 'EXPLORE • DISCOVER • ESCAPE',
    titleLine1: 'Your Next',
    titleHighlight: 'Adventure',
    titleLine2: 'Awaits',
    subtitle:
      'From majestic mountains to serene valleys, we craft unforgettable travel experiences for every explorer.',
    primaryButtonText: 'Explore Destinations',
    primaryButtonLink: '/destinations',
    heroImage: '/newimage/herosecction/heroimage.png',
    socialProof: {
      travelersText: '500+ Happy Travelers',
      rating: '4.9',
      reviewsText: '(500+ Reviews)',
      avatars: [
        '/images/testimonials/priya-sharma.webp',
        '/images/testimonials/rahul-verma.webp',
        '/images/testimonials/sneha-patel.webp',
      ],
      badgeCount: '500+',
    },
  },
  experiences: {
    badge: 'TRAVEL YOUR WAY',
    title: 'Choose Your Experience',
    subtitle: 'Every journey is unique. Find the travel style that matches you.',
    items: [
      { id: 'trekking', name: 'Trekking', icon: 'Mountain', link: '/experiences#trekking' },
      { id: 'adventure', name: 'Adventure', icon: 'Compass', link: '/experiences#adventure' },
      { id: 'honeymoon', name: 'Honeymoon', icon: 'Heart', link: '/experiences#honeymoon' },
      { id: 'family', name: 'Family Trips', icon: 'Users', link: '/experiences#family' },
      { id: 'group', name: 'Group Tours', icon: 'Flame', link: '/experiences#group' },
      { id: 'international', name: 'International', icon: 'Globe', link: '/experiences#international' },
    ],
  },
  whyChooseUs: {
    badge: 'WHY CHOOSE WEEKEND ESCAPES',
    title: 'More Than Just A Trip',
    subtitle:
      'We create meaningful travel experiences with care, expertise and a passion for exploration.',
    image: '/newimage/other sections image/image1.png',
    handwrittenNote: 'Travel even\nRepeat',
    benefits: [
      {
        icon: 'Mountain',
        title: 'Curated Experiences',
        desc: 'Handpicked destinations and verified stays',
      },
      {
        icon: 'Users',
        title: 'Expert Guidance',
        desc: 'Experienced travel leaders and local support',
      },
      {
        icon: 'Handshake',
        title: 'Safe & Secure Travel',
        desc: 'Your safety is our priority',
      },
      {
        icon: 'UsersRound',
        title: 'Best Price Guarantee',
        desc: 'Value-packed trips with no hidden costs',
      },
    ],
  },
  bookingProcess: {
    badge: 'OUR PROCESS',
    title: 'From Dream to Destination.',
    subtitle:
      'One continuous journey designed to make planning, booking, and exploring completely effortless.',
    steps: [
      {
        num: 1,
        stepNumber: '01',
        title: 'Explore',
        tagline: 'Curated Trails & Stays',
        desc: 'Browse our handpicked mountain treks, scenic road trips, and luxury weekend getaways.',
        icon: 'Compass',
      },
      {
        num: 2,
        stepNumber: '02',
        title: 'Plan',
        tagline: 'Bespoke Itinerary',
        desc: 'Customize dates, group sizes, and special preferences with our certified expedition marshals.',
        icon: 'CalendarDays',
      },
      {
        num: 3,
        stepNumber: '03',
        title: 'Book & Give Back',
        tagline: 'Secure & Gives Back',
        desc: 'Lock in slots with verified gateways. A share of every booking is donated to flood relief, food distribution & welfare trusts.',
        icon: 'ShieldCheck',
      },
      {
        num: 4,
        stepNumber: '04',
        title: 'Travel',
        tagline: 'Lifelong Memories',
        desc: 'Pack your bags, meet your trip leader at basecamp, and embark on your unforgettable escape.',
        icon: 'Plane',
      },
    ],
    welfare: {
      badge: 'Every Booking Gives Back',
      tagline: 'Travel With A Purpose',
      title: 'A Part of Your Trip Cost is Donated to Trusted Welfare & Relief Trusts',
      description:
        'Jab aap hamare saath apni trip book karte hain, aapke booking amount ka ek hissa direct verified relief trusts ko jata hai jisse zaroorat ke waqt real help provide ki ja sake:',
      items: [
        {
          icon: 'Waves',
          title: 'Flood & Calamity Relief',
          desc: 'Floods aur natural disasters ke waqt prompt rescue & rehabilitation help.',
          color: 'blue',
        },
        {
          icon: 'Utensils',
          title: 'Food & Ration Drives',
          desc: 'Remote aur underprivileged parivaron tak hygienic food aur ration supply.',
          color: 'emerald',
        },
        {
          icon: 'Heart',
          title: 'Community & Welfare',
          desc: 'Local mountain communities ki medical aid aur welfare support.',
          color: 'purple',
        },
      ],
    },
  },
  finalCta: {
    heading: 'Ready for Your Next Adventure?',
    subtitle:
      "Let's turn your travel dreams into unforgettable memories. Get personalized recommendations and plan your next escape.",
    bgImage: '/newimage/other sections image/footerbanner2.png',
    primaryButtonText: 'Plan My Trip',
    primaryButtonLink: '/plan-trip',
    whatsappButtonText: 'Talk on WhatsApp',
    whatsappUrl: '',
  },
};

export default DEFAULT_HOME_SECTIONS;
