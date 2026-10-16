import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      parsed[key] = val;
    }
  }
  return parsed;
}

function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function main() {
  console.log('\n======================================================');
  console.log('   ILLUMINATE CLI - SECURE ADMIN CREDENTIAL RECOVERY   ');
  console.log('======================================================\n');

  const args = parseArgs();
  let email = args.email;
  let password = args.password;
  let role = args.role || 'SUPER_ADMIN';

  if (!email) {
    email = await prompt('Enter Admin Email Address: ');
  }
  if (!password) {
    password = await prompt('Enter New Secure Password (min 8 chars): ');
  }

  email = String(email).trim().toLowerCase();
  password = String(password).trim();

  if (!email || !email.includes('@')) {
    console.error('❌ Error: A valid email address is required.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  // If local db exists, update or add
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

  const existingIdx = db.admins.findIndex((a) => a.email.toLowerCase() === email);
  const now = new Date().toISOString();

  if (existingIdx !== -1) {
    db.admins[existingIdx].password_hash = hash;
    db.admins[existingIdx].updated_at = now;
    console.log(`✅ Success: Password for existing admin "${email}" updated!`);
  } else {
    db.admins.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      email,
      username: email.split('@')[0],
      password_hash: hash,
      role,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
    console.log(`✅ Success: New ${role} account "${email}" created!`);
  }

  // Record audit log
  db.auditLogs.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    admin_email: 'CLI_DEVELOPER',
    action: 'CLI_PASSWORD_RESET',
    target: email,
    metadata: { note: 'Executed via secure local terminal CLI command' },
    created_at: now,
  });

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');

  console.log(`\n📌 Database updated at: ${DB_FILE}`);
  console.log(`🔐 Role: ${role}`);
  console.log(`🕒 Timestamp: ${now}`);
  console.log('\n======================================================\n');
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
