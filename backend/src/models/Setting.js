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
    siteName: {
      type: String,
      default: 'Weekend Escapes',
    },
    tagline: {
      type: String,
      default: 'Crafting Adventures',
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
