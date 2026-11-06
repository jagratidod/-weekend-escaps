/**
 * Helper to generate smart, trek-specific default FAQs for any package
 */
export function generateDefaultPackageFAQs(pkg = {}) {
  const name = pkg?.name || pkg?.title || 'this tour';
  const location = pkg?.location || 'Uttarakhand, Himalayas';
  const duration = pkg?.duration || '6 Days / 5 Nights';
  const difficulty = pkg?.difficulty || 'Easy to Moderate';
  const season = pkg?.season || 'All Year Round';

  return [
    {
      question: `How physically demanding is the ${name} trek and who can do it?`,
      answer: `The ${name} expedition is rated as ${difficulty}. It is well-suited for beginners with reasonable fitness, families, and seasoned trekkers alike. You will be trekking an average of 4 to 6 hours daily along well-marked alpine paths. We recommend starting light cardio (brisk walking, jogging, or cycling) 2 to 3 weeks prior to your departure date to maximize comfort on the trail.`,
    },
    {
      question: `What is the best season and weather to experience ${name}?`,
      answer: `The recommended season for ${name} is ${season}. Summer and spring months (April to June) offer lush green meadows, blooming rhododendrons, and pleasant daytime temperatures (12°C to 18°C). Autumn (September to November) brings crystal clear skies and panoramic views of snow-capped peaks. Winter batches experience crisp snowscapes with nighttime temperatures dropping below freezing, for which proper 3-layer winter gear is required.`,
    },
    {
      question: `What kind of accommodation and meals are provided during the trip?`,
      answer: `Depending on the itinerary (${duration}), accommodation consists of clean, cozy guesthouses / homestays at base camps and high-quality 4-season alpine dome tents on higher campsites. Stays are on twin, triple, or quad sharing as per your selected booking tier. We provide freshly prepared, nutritious, and hygienic vegetarian meals (energizing breakfast, packed or hot lunch, evening tea & snacks, and wholesome dinner) curated specifically for high-altitude energy.`,
    },
    {
      question: `Are forest permits, environmental passes, and entry fees included?`,
      answer: `Yes, absolutely! All required forest department permits, state entry fees, camping charges, and environmental trail passes for ${name} (${location}) are arranged and included in your package cost. You will only need to carry a valid government-issued photo ID (Aadhaar Card, Passport, or Voter ID) for verification at checkpoints.`,
    },
    {
      question: `What safety protocols and medical support are maintained on the trail?`,
      answer: `Safety is our top priority. Every batch is accompanied by certified Trek Marshals (Basic & Advanced Mountaineering Certified) trained in Wilderness First Aid. Leaders carry dedicated first-aid kits, pulse oximeters, blood pressure monitors, and emergency oxygen cylinders. Daily health check-ups and acclimatization briefings are conducted at camp before each push.`,
    },
    {
      question: `Is mobile network and electricity available during the trek?`,
      answer: `Mobile connectivity (primarily Jio and Airtel) is reliable at basecamp villages and major transit hubs in ${location}. As you hike higher up the trail, signals become intermittent or unavailable. We strongly advise completing urgent calls before departing the basecamp and carrying a fully charged 10,000 to 20,000 mAh power bank, as charging points are unavailable at alpine tent campsites.`,
    },
    {
      question: `Can I offload my backpack during the trek?`,
      answer: `Yes. While we encourage trekkers to carry their own gear for the authentic trekking experience, backpack offloading onto mules or porters is available if requested in advance. You can trek comfortably with just a light 10–20L daypack containing your water bottle, rain poncho, warm layer, and personal medications. Offloading charges can be settled directly at basecamp.`,
    },
    {
      question: `What is the booking process and cancellation policy?`,
      answer: `You can secure your spot instantly online with an advance deposit or full payment. We offer flexible cancellation policies: Full refund or 100% credit voucher on cancellations made 15+ days prior to departure; 50% credit voucher between 7–14 days. If the trek is interrupted due to extreme unforeseen weather or government advisories, our team provides alternative dates or credit vouchers valid for 12 months.`,
    },
  ];
}
