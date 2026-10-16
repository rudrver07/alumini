import { WorkshopSessionItem } from '@/types';
import { EVENT_CONFIG } from '@/config/event.config';

export const WORKSHOP_METRICS = {
  studentsTrained: '18,000+',
  workshopsConducted: '200+',
  statesReached: '15+',
  hoursImmersive: '6 Hours',
  fee: EVENT_CONFIG.participationFee,
  brochureOriginalFee: EVENT_CONFIG.brochureOriginalFee,
  feeLabel: EVENT_CONFIG.feeLabel,
  feeStatusNote: EVENT_CONFIG.feeStatusNote,
  minParticipants: 70,
  minHallCapacity: 100,
  window: '14th July – 31st October 2026',
  timing: '11:00 AM – 6:00 PM (1 Hr Lunch & Networking Break)',
};

export const WORKSHOP_SESSIONS: WorkshopSessionItem[] = [
  {
    number: 1,
    topic: 'Introduction & Icebreaker',
    duration: '15 Minutes',
    durationMinutes: 15,
    category: 'Foundation',
    activity:
      'Interactive exercises designed to help participants connect with one another and become acquainted with the speaker, setting an energetic stage for entrepreneurial discovery.',
  },
  {
    number: 2,
    topic: 'What is Entrepreneurship',
    duration: '15 Minutes',
    durationMinutes: 15,
    category: 'Foundation',
    activity:
      "Understanding fundamental aspects of entrepreneurship, including its definition, mindset shifts, and why innovation is the primary engine of modern economic transformation.",
  },
  {
    number: 3,
    topic: 'Team Formation',
    duration: '15 Minutes',
    durationMinutes: 15,
    category: 'Foundation',
    activity:
      'Organizing participants into multidisciplinary teams to facilitate high-impact engagement, role delegation, and collaborative synergy for the day’s sprint.',
  },
  {
    number: 4,
    topic: 'Idea Generation & Problem Identification',
    duration: '15 Minutes',
    durationMinutes: 15,
    category: 'Ideation',
    activity:
      'Guided group activity focused on brainstorming pain points and identifying real-world problems, designed to stimulate lateral thinking and root-cause analysis.',
  },
  {
    number: 5,
    topic: 'Business Model Canvas (BMC) Workshop',
    duration: '30 Minutes',
    durationMinutes: 30,
    category: 'Strategy',
    activity:
      'The speaker provides a deep-dive overview of the 9 building blocks of the Business Model Canvas (BMC) and coaches participants on charting viable business architectures.',
  },
  {
    number: 6,
    topic: 'Team Activity: Filling Out BMC',
    duration: '30 Minutes',
    durationMinutes: 30,
    category: 'Strategy',
    activity:
      'Teams undertake a structured sprint to stress-test their ideas, map value propositions, target customer segments, and comprehensively complete their physical BMC worksheet.',
  },
  {
    number: 7,
    topic: 'Finance For Entrepreneurs',
    duration: '30 Minutes',
    durationMinutes: 30,
    category: 'Financials',
    activity:
      'Understanding core financial principles: unit economics, pricing strategies, assessing market viability, burn rates, and financial projections for early-stage ventures.',
  },
  {
    number: 8,
    topic: 'Insights Into Startup Development',
    duration: '60 Minutes',
    durationMinutes: 60,
    category: 'Execution',
    activity:
      'Mastering startup execution through Minimum Viable Products (MVPs) and Proofs of Concept (POCs). Learn how to build rapid prototypes, validate hypotheses, and iterate based on customer feedback.',
  },
  {
    number: 9,
    topic: 'Pitching Workshop & Live QnA',
    duration: '60 Minutes',
    durationMinutes: 60,
    category: 'Pitch',
    activity:
      'Teams present their refined business concepts to judges and peers in a live pitching round, followed by constructive critiques and an open question & answer session with the mentors.',
  },
];

export const WORKSHOP_BENEFITS = [
  {
    title: 'E-Cell IIT Bombay Certification',
    description:
      'Prestigious Certificate of Participation certified directly by The Entrepreneurship Cell, IIT Bombay for all participating students.',
    icon: 'Award',
  },
  {
    title: 'Exclusive Startup Kit',
    description:
      'Physical starter kit including curated founder handbook, custom Business Model Canvas worksheets, and startup resource vouchers.',
    icon: 'Package',
  },
  {
    title: 'Seasoned Mentors & Founders',
    description:
      'Learn directly from real-world entrepreneurs, venture builders, and industry veterans handpicked by E-Cell IIT Bombay.',
    icon: 'Users',
  },
  {
    title: 'Pathway to Eureka!',
    description:
      "Direct guidance and fast-track consideration for Eureka! — Asia's largest business model competition held at IIT Bombay campus.",
    icon: 'Rocket',
  },
  {
    title: 'Institutional Recognition',
    description:
      'Host institution gains the privilege to become the official workshop partner, with Certificates of Appreciation for faculty coordinators.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Leadership & Coordination Credentials',
    description:
      'Student organizing coordinators receive official Certificates of Coordination endorsing their leadership and event management excellence.',
    icon: 'Briefcase',
  },
];

export const COLLEGE_REQUIREMENTS = [
  {
    title: 'Auditorium / Seminar Hall',
    description: '1-day dedicated hall with 100+ comfortable seating capacity and high-fidelity public address system.',
    badge: 'Infrastructure',
  },
  {
    title: 'Speaker Transit & Hospitality',
    description: 'Pick and drop arrangement from the nearest airport / railway station / bus terminal for the trainer.',
    badge: 'Logistics',
  },
  {
    title: 'Student & Faculty Team',
    description: 'Minimum 5 student coordinators and 1 designated faculty coordinator to oversee local operations.',
    badge: 'Coordination',
  },
  {
    title: 'Official Confirmation & Advance',
    description: 'Formal confirmation letter signed by Principal/Head and 50% advance at least 10 days prior to workshop.',
    badge: 'Formalities',
  },
];

export const CONTACT_PERSONS = [
  {
    name: 'Rachit Kumar',
    phone: '+91 9719362033',
    email: 'rachit@ecell.in',
    role: 'Events & Workshop Lead',
  },
  {
    name: 'Abhishek Gill',
    phone: '+91 8619283450',
    email: 'abhishek@ecell.in',
    role: 'Events & Workshop Lead',
  },
];
