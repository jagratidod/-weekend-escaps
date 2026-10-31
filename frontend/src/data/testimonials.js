import { getImageUrl } from '../utils/imageHelper';

export const TESTIMONIALS = [
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    trip: "Kedarkantha Trek",
    location: "Mumbai, India",
    image: getImageUrl("/images/testimonials/priya-sharma-card.png"),
    rating: 5,
    quote: "Kedarkantha with Weekend Escapes was an incredible experience. Everything was well-organized and the team was amazing.",
    badge: "Solo Hiker"
  },
  {
    id: "rahul-mehta",
    name: "Rahul Mehta",
    trip: "Kashmir Package",
    location: "Bangalore, India",
    image: getImageUrl("/images/testimonials/rahul-mehta-card.png"),
    rating: 5,
    quote: "Best travel company! Our Kashmir trip was magical. Highly recommended for their professional service.",
    badge: "Couples Tour"
  },
  {
    id: "sneha-patel",
    name: "Sneha Patel",
    trip: "Manali Trip",
    location: "Delhi NCR, India",
    image: getImageUrl("/images/testimonials/sneha-patel-card.png"),
    rating: 5,
    quote: "A perfect blend of adventure and comfort. Can't wait for my next trip with Weekend Escapes!",
    badge: "Family Group"
  },
  {
    id: "amit-roy",
    name: "Amit Roy",
    trip: "Spiti Valley Expedition",
    location: "Pune, India",
    image: getImageUrl("/images/testimonials/rahul-mehta-card.png"),
    rating: 5,
    quote: "The Spiti road trip was the adventure of a lifetime. The drivers and marshals took care of every twist and high altitude challenge!",
    badge: "Road Tripper"
  },
  {
    id: "kavita-menon",
    name: "Kavita Menon",
    trip: "Manali Adventure",
    location: "Hyderabad, India",
    image: getImageUrl("/images/testimonials/priya-sharma-card.png"),
    rating: 5,
    quote: "River rafting, paragliding in Solang, and cozy bonfire nights in Old Manali. We made friends for life with our group batch!",
    badge: "Adventure Enthusiast"
  }
];

export default TESTIMONIALS;
