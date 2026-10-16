import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const sampleParticipants = [
  {
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@iitb.ac.in',
    phone: '+91 98201 44521',
    college: 'IIT Bombay',
    department: 'Computer Science & Engineering',
    year_of_study: '3rd Year',
    city: 'Mumbai',
    state: 'Maharashtra',
    expectations: 'Looking to learn BMC and validate my AI healthcare startup idea.',
    referral_code: 'ECELL2026',
    status: 'confirmed',
    payment_status: 'unpaid',
  },
  {
    full_name: 'Priya Iyer',
    email: 'priya.iyer@bits-pilani.ac.in',
    phone: '+91 97112 88490',
    college: 'BITS Pilani',
    department: 'Electronics & Instrumentation',
    year_of_study: '4th Year',
    city: 'Pilani',
    state: 'Rajasthan',
    expectations: 'Want to fast-track to Eureka! 2026 and connect with angel mentors.',
    referral_code: 'EUREKA50',
    status: 'confirmed',
    payment_status: 'unpaid',
  },
  {
    full_name: 'Rohan Deshmukh',
    email: 'rohan.d@coep.ac.in',
    phone: '+91 98902 33114',
    college: 'COEP Technological University',
    department: 'Mechanical Engineering',
    year_of_study: '2nd Year',
    city: 'Pune',
    state: 'Maharashtra',
    expectations: 'Understand unit economics and startup seed funding.',
    referral_code: '',
    status: 'confirmed',
    payment_status: 'unpaid',
  },
  {
    full_name: 'Ananya Sen',
    email: 'ananya.sen@iitkgp.ac.in',
    phone: '+91 94331 77620',
    college: 'IIT Kharagpur',
    department: 'Industrial Engineering',
    year_of_study: '3rd Year',
    city: 'Kharagpur',
    state: 'West Bengal',
    expectations: 'Gain hands-on experience structuring our green-tech MVP.',
    referral_code: 'CAMPUS26',
    status: 'pending_payment',
    payment_status: 'unpaid',
  },
  {
    full_name: 'Vikramaditya Rao',
    email: 'v.rao@nitk.edu.in',
    phone: '+91 81234 56789',
    college: 'NIT Surathkal',
    department: 'Information Technology',
    year_of_study: '1st Year',
    city: 'Mangaluru',
    state: 'Karnataka',
    expectations: 'Learn team formation and how to pitch to seed investors.',
    referral_code: '',
    status: 'confirmed',
    payment_status: 'unpaid',
  },
  {
    full_name: 'Meera Patel',
    email: 'meera.p@nirmauni.ac.in',
    phone: '+91 98250 99881',
    college: 'Nirma University',
    department: 'Chemical Engineering',
    year_of_study: '3rd Year',
    city: 'Ahmedabad',
    state: 'Gujarat',
    expectations: 'Keen to understand financial models and MVP validation.',
    referral_code: 'ILLUM20',
    status: 'confirmed',
    payment_status: 'unpaid',
  },
];

function generateRegistrationId(i) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let k = 0; k < 5; k++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ILLUM-2026-${rand}${i}`;
}

async function seed() {
  console.log('🌱 Seeding database with realistic initial participants...');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let db = { registrations: [], admins: [], auditLogs: [] };
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      // fresh
    }
  }

  // Ensure default admin exists
  const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || 'admin@ecell.in').toLowerCase();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Illuminate@IITB2026#Secure';
  if (!db.admins.some((a) => a.email.toLowerCase() === adminEmail)) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPassword, salt);
    db.admins.push({
      id: crypto.randomUUID ? crypto.randomUUID() : 'admin_super_1',
      email: adminEmail,
      username: 'superadmin',
      password_hash: hash,
      role: 'SUPER_ADMIN',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    console.log(`🔐 Super Admin seeded: ${adminEmail}`);
  }

  // Seed sample registrations only if explicitly requested via --with-dummy or --demo flag
  const shouldSeedDummy = process.argv.includes('--with-dummy') || process.argv.includes('--demo');
  if (shouldSeedDummy && db.registrations.length === 0) {
    const now = new Date();
    sampleParticipants.forEach((p, index) => {
      const regTime = new Date(now.getTime() - index * 3600 * 1000 * 4).toISOString();
      db.registrations.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `seed_reg_${index}`,
        registration_id: generateRegistrationId(index + 1),
        ...p,
        synced_to_sheets: false,
        created_at: regTime,
        updated_at: regTime,
      });
    });
    console.log(`✅ Seeded ${sampleParticipants.length} sample participant records (--demo flag detected).`);
  } else {
    console.log(`ℹ️ Production mode active. Real registrations count: ${db.registrations.length}`);
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  console.log('Done!');
}

seed().catch(console.error);
