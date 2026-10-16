export interface EventConfig {
  workshopName: string;
  organizer: string;
  seasonWindow: string;
  timing: string;
  durationHours: string;
  minParticipants: number;
  minHallCapacity: number;
  participationFee: number;
  currencySymbol: string;
  feeLabel: string;
  feeStatusNote: string;
  brochureOriginalFee: number;
  audioPath: string;
  registrationSuccessAudioPath: string;
  contacts: {
    name: string;
    phone: string;
    email: string;
    role: string;
  }[];
}

export const EVENT_CONFIG: EventConfig = {
  workshopName: 'ILLUMINATE',
  organizer: 'The Entrepreneurship Cell, IIT Bombay',
  seasonWindow: '14th July – 31st October 2026',
  timing: '11:00 AM – 6:00 PM (1 Hr Lunch & Networking Break)',
  durationHours: '6 Hours',
  minParticipants: 70,
  minHallCapacity: 100,
  participationFee: 699,
  currencySymbol: '₹',
  feeLabel: 'Participation Fee per Student',
  feeStatusNote: 'Special updated participation fee (pending organizer confirmation; baseline brochure fee ₹799 preserved for historical reference).',
  brochureOriginalFee: 799,
  audioPath: '/audio/ambient-theme.wav',
  registrationSuccessAudioPath: '/audio/registration-success.wav',
  contacts: [
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
  ],
};
