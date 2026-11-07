import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'site_settings',
    },
    logoUrl: {
      type: String,
      default: '/logo/weekend-escapes-logo.svg',
    },
    footerLogoUrl: {
      type: String,
      default: '/logo/weekend-escapes-logo.svg',
    },
    darkLogoUrl: {
      type: String,
      default: '/logo/weekend-escapes-logo.svg',
    },
    siteName: {
      type: String,
      default: 'Weekend Escapes',
    },
    tagline: {
      type: String,
      default: 'Crafting Adventures',
    },
    themeColor: {
      type: String,
      default: '#FF6B16',
    },
    themeColorHover: {
      type: String,
      default: '#e05809',
    },
    whatsappNumber: {
      type: String,
      default: '+91 98765 43210',
    },
    whatsappMessage: {
      type: String,
      default: 'Hi Weekend Escapes! I would like to plan my next adventure.',
    },
    contactInfo: {
      heroTitle: {
        type: String,
        default: 'Contact us',
      },
      heroSubtitle: {
        type: String,
        default:
          'Weekend Escapes is ready to provide the right solution and adventure according to your needs',
      },
      address: {
        type: String,
        default: 'Himalayan Ridge View, Sector 4, Manali / Dehradun, India',
      },
      emailPrimary: {
        type: String,
        default: 'hello@weekendescapes.com',
      },
      emailSupport: {
        type: String,
        default: 'support@weekendescapes.com',
      },
      phone: {
        type: String,
        default: '+91 98765 43210',
      },
      helpline: {
        type: String,
        default: '+91 91234 56789',
      },
      whatsapp: {
        type: String,
        default: '+91 98765 43210',
      },
      mapUrl: {
        type: String,
        default:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108861.32598379051!2d77.10898544976735!3d32.2396324905322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390487081634b2f7%3A0x7292a870d0617302!2sManali%2C%20Himachal%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
      },
      socials: {
        facebook: {
          type: String,
          default: 'https://facebook.com/weekendescapes',
        },
        instagram: {
          type: String,
          default: 'https://instagram.com/weekendescapes',
        },
        twitter: {
          type: String,
          default: 'https://twitter.com/weekendescapes',
        },
        youtube: {
          type: String,
          default: 'https://youtube.com/@weekendescapes',
        },
      },
    },
    blogHero: {
      tagline: {
        type: String,
        default: 'WEEKEND ESCAPES JOURNAL',
      },
      title: {
        type: String,
        default: 'Travel Stories & Guides',
      },
      subtitle: {
        type: String,
        default: 'Inspiring trail notes, high-altitude pass guides, and gear tips',
      },
      featuredImage: {
        type: String,
        default: '/newimage/exploresection/kedarkantha.png',
      },
      featuredBlogId: {
        type: String,
        default: '',
      },
    },
    homeSections: {
      hero: {
        badge: {
          type: String,
          default: 'EXPLORE • DISCOVER • ESCAPE',
        },
        titleLine1: {
          type: String,
          default: 'Your Next',
        },
        titleHighlight: {
          type: String,
          default: 'Adventure',
        },
        titleLine2: {
          type: String,
          default: 'Awaits',
        },
        subtitle: {
          type: String,
          default:
            'From majestic mountains to serene valleys, we craft unforgettable travel experiences for every explorer.',
        },
        primaryButtonText: {
          type: String,
          default: 'Explore Destinations',
        },
        primaryButtonLink: {
          type: String,
          default: '/destinations',
        },
        heroImage: {
          type: String,
          default: '/newimage/herosecction/heroimage.png',
        },
        socialProof: {
          travelersText: {
            type: String,
            default: '500+ Happy Travelers',
          },
          rating: {
            type: String,
            default: '4.9',
          },
          reviewsText: {
            type: String,
            default: '(500+ Reviews)',
          },
          avatars: {
            type: [String],
            default: [
              '/images/testimonials/priya-sharma.webp',
              '/images/testimonials/rahul-verma.webp',
              '/images/testimonials/sneha-patel.webp',
            ],
          },
          badgeCount: {
            type: String,
            default: '500+',
          },
        },
      },
      experiences: {
        badge: {
          type: String,
          default: 'TRAVEL YOUR WAY',
        },
        title: {
          type: String,
          default: 'Choose Your Experience',
        },
        subtitle: {
          type: String,
          default: 'Every journey is unique. Find the travel style that matches you.',
        },
        items: [
          {
            id: { type: String, default: '' },
            name: { type: String, default: '' },
            icon: { type: String, default: 'Mountain' },
            link: { type: String, default: '/packages' },
          },
        ],
      },
      whyChooseUs: {
        badge: {
          type: String,
          default: 'WHY CHOOSE WEEKEND ESCAPES',
        },
        title: {
          type: String,
          default: 'More Than Just A Trip',
        },
        subtitle: {
          type: String,
          default:
            'We create meaningful travel experiences with care, expertise and a passion for exploration.',
        },
        image: {
          type: String,
          default: '/newimage/other sections image/image1.png',
        },
        handwrittenNote: {
          type: String,
          default: 'Travel even\nRepeat',
        },
        benefits: [
          {
            icon: { type: String, default: 'Mountain' },
            title: { type: String, default: '' },
            desc: { type: String, default: '' },
          },
        ],
      },
      bookingProcess: {
        badge: {
          type: String,
          default: 'OUR PROCESS',
        },
        title: {
          type: String,
          default: 'From Dream to Destination.',
        },
        subtitle: {
          type: String,
          default:
            'One continuous journey designed to make planning, booking, and exploring completely effortless.',
        },
        steps: [
          {
            num: { type: Number, default: 1 },
            stepNumber: { type: String, default: '01' },
            title: { type: String, default: '' },
            tagline: { type: String, default: '' },
            desc: { type: String, default: '' },
            icon: { type: String, default: 'Compass' },
          },
        ],
        welfare: {
          badge: {
            type: String,
            default: 'Every Booking Gives Back',
          },
          tagline: {
            type: String,
            default: 'Travel With A Purpose',
          },
          title: {
            type: String,
            default: 'A Part of Your Trip Cost is Donated to Trusted Welfare & Relief Trusts',
          },
          description: {
            type: String,
            default:
              'Jab aap hamare saath apni trip book karte hain, aapke booking amount ka ek hissa direct verified relief trusts ko jata hai jisse zaroorat ke waqt real help provide ki ja sake:',
          },
          items: [
            {
              icon: { type: String, default: 'Waves' },
              title: { type: String, default: '' },
              desc: { type: String, default: '' },
              color: { type: String, default: 'blue' },
            },
          ],
        },
      },
      finalCta: {
        heading: {
          type: String,
          default: 'Ready for Your Next Adventure?',
        },
        subtitle: {
          type: String,
          default:
            "Let's turn your travel dreams into unforgettable memories. Get personalized recommendations and plan your next escape.",
        },
        bgImage: {
          type: String,
          default: '/newimage/other sections image/footerbanner2.png',
        },
        primaryButtonText: {
          type: String,
          default: 'Explore Packages',
        },
        primaryButtonLink: {
          type: String,
          default: '/packages',
        },
        whatsappButtonText: {
          type: String,
          default: 'Talk on WhatsApp',
        },
        whatsappUrl: {
          type: String,
          default: '',
        },
      },
      gallery: {
        eyebrow: {
          type: String,
          default: 'Memories For A Lifetime',
        },
        title: {
          type: String,
          default: 'Moments From Our Trips',
        },
        subtitle: {
          type: String,
          default: 'Real people. Real adventures. Real memories.',
        },
        buttonText: {
          type: String,
          default: 'View Gallery',
        },
        buttonLink: {
          type: String,
          default: '/about#gallery',
        },
        snapshotsLabel: {
          type: String,
          default: 'Captured Snapshots',
        },
        items: [
          {
            id: { type: String, default: '' },
            title: { type: String, default: '' },
            category: { type: String, default: '' },
            image: { type: String, default: '' },
            location: { type: String, default: '' },
          },
        ],
      },
      sectionOrder: {
        type: [String],
        default: [
          'hero',
          'reels',
          'experiences',
          'packages',
          'whyChooseUs',
          'bookingProcess',
          'testimonials',
          'gallery',
          'blogs',
          'finalCta',
        ],
      },
      sectionVisibility: {
        hero: { type: Boolean, default: true },
        reels: { type: Boolean, default: true },
        experiences: { type: Boolean, default: true },
        packages: { type: Boolean, default: true },
        whyChooseUs: { type: Boolean, default: true },
        bookingProcess: { type: Boolean, default: true },
        testimonials: { type: Boolean, default: true },
        gallery: { type: Boolean, default: true },
        blogs: { type: Boolean, default: true },
        finalCta: { type: Boolean, default: true },
      },
    },
    packageFaqSection: {
      badge: {
        type: String,
        default: "Got Questions? We've Got Answers",
      },
      title: {
        type: String,
        default: 'Frequently Asked Questions',
      },
      subtitle: {
        type: String,
        default:
          'Everything you need to know about preparation, safety, stays, permits, and booking for our expeditions.',
      },
      defaultFaqs: [
        {
          question: { type: String, default: '' },
          answer: { type: String, default: '' },
        },
      ],
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

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
