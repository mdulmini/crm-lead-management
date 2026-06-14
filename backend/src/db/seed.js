const bcrypt = require('bcryptjs');
const db = require('./database');

function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  db.exec('DELETE FROM notes; DELETE FROM leads; DELETE FROM users;');

  // Create users
  const hashedPassword = bcrypt.hashSync('password123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
  `);

  const admin = insertUser.run('Admin User', 'admin@example.com', hashedPassword, 'admin');
  const sarah = insertUser.run('Sarah Johnson', 'sarah@example.com', hashedPassword, 'salesperson');
  const mike = insertUser.run('Mike Chen', 'mike@example.com', hashedPassword, 'salesperson');

  // Create sample leads
  const insertLead = db.prepare(`
    INSERT INTO leads (lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const leads = [
    ['Alice Thompson', 'TechStart Inc', 'alice@techstart.com', '+1-555-0101', 'LinkedIn', sarah.lastInsertRowid, 'New', 15000],
    ['Bob Martinez', 'Global Solutions', 'bob@globalsol.com', '+1-555-0102', 'Website', mike.lastInsertRowid, 'Contacted', 32000],
    ['Carol White', 'NextGen Corp', 'carol@nextgen.com', '+1-555-0103', 'Referral', sarah.lastInsertRowid, 'Qualified', 48000],
    ['David Kim', 'Innovate LLC', 'david@innovate.com', '+1-555-0104', 'Cold Email', admin.lastInsertRowid, 'Proposal Sent', 75000],
    ['Emma Davis', 'Prime Business', 'emma@prime.com', '+1-555-0105', 'Event', mike.lastInsertRowid, 'Won', 120000],
    ['Frank Wilson', 'StartUp Hub', 'frank@startup.com', '+1-555-0106', 'LinkedIn', sarah.lastInsertRowid, 'Lost', 25000],
    ['Grace Lee', 'Digital Works', 'grace@digitalworks.com', '+1-555-0107', 'Website', mike.lastInsertRowid, 'New', 18000],
    ['Henry Brown', 'Scale Fast Co', 'henry@scalefast.com', '+1-555-0108', 'Referral', admin.lastInsertRowid, 'Qualified', 92000],
  ];

  const leadIds = leads.map(l => insertLead.run(...l).lastInsertRowid);

  // Create sample notes
  const insertNote = db.prepare(`
    INSERT INTO notes (lead_id, content, created_by) VALUES (?, ?, ?)
  `);

  insertNote.run(leadIds[0], 'Initial contact made via LinkedIn. Interested in Q1 implementation.', sarah.lastInsertRowid);
  insertNote.run(leadIds[1], 'Had a 30-min discovery call. Budget confirmed. Sending proposal next week.', mike.lastInsertRowid);
  insertNote.run(leadIds[2], 'Qualified lead. Decision maker identified. Technical requirements gathered.', sarah.lastInsertRowid);
  insertNote.run(leadIds[3], 'Proposal sent on Monday. Follow-up scheduled for Friday.', admin.lastInsertRowid);
  insertNote.run(leadIds[4], 'Contract signed! Deal closed. Onboarding scheduled.', mike.lastInsertRowid);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Test users created:');
  console.log('   admin@example.com / password123 (Admin)');
  console.log('   sarah@example.com / password123 (Salesperson)');
  console.log('   mike@example.com / password123 (Salesperson)');
}

seed();