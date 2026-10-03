import { PrismaClient, Role, EventStatus, EventType, RegistrationStatus, AttendanceStatus, TransactionType, AnnouncementType, FeedbackSentiment } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Ayojanix database seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.volunteerAssignment.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.financeTransaction.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // Password hashes
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const organizerPassword = await bcrypt.hash('Organizer@123', 10);
  const volunteerPassword = await bcrypt.hash('Volunteer@123', 10);
  const participantPassword = await bcrypt.hash('Participant@123', 10);

  // 1. Create Core Users
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. S. P. Akarte (Dean / Admin)',
      email: 'admin@ayojanix.demo',
      password: adminPassword,
      role: Role.ADMIN,
      phone: '+91 98765 43210',
      department: 'Computer Science & Engineering',
    },
  });

  const organizer = await prisma.user.create({
    data: {
      name: 'Prof. Vedant Himte (Convener)',
      email: 'organizer@ayojanix.demo',
      password: organizerPassword,
      role: Role.ORGANIZER,
      phone: '+91 98220 11223',
      department: 'CSE / Event Cell',
    },
  });

  // Volunteers
  const volunteer1 = await prisma.user.create({
    data: {
      name: 'Apurva Kadu (Lead Volunteer)',
      email: 'volunteer@ayojanix.demo', // Primary demo volunteer login
      password: volunteerPassword,
      role: Role.VOLUNTEER,
      phone: '+91 91234 56781',
      department: 'Computer Science',
    },
  });

  const volunteer2 = await prisma.user.create({
    data: {
      name: 'Arya Raut (Tech Lead Volunteer)',
      email: 'arya.v@ayojanix.demo',
      password: volunteerPassword,
      role: Role.VOLUNTEER,
      phone: '+91 91234 56782',
      department: 'Information Technology',
    },
  });

  const volunteer3 = await prisma.user.create({
    data: {
      name: 'Tejas Nikose (Logistics Volunteer)',
      email: 'tejas.v@ayojanix.demo',
      password: volunteerPassword,
      role: Role.VOLUNTEER,
      phone: '+91 91234 56783',
      department: 'Computer Science',
    },
  });

  // Participants
  const participant1 = await prisma.user.create({
    data: {
      name: 'Rahul Sharma (Student)',
      email: 'participant@ayojanix.demo', // Primary demo participant login
      password: participantPassword,
      role: Role.PARTICIPANT,
      phone: '+91 99887 76655',
      department: 'CSE - 3rd Year',
    },
  });

  const participant2 = await prisma.user.create({
    data: {
      name: 'Pooja Verma',
      email: 'pooja.verma@ayojanix.demo',
      password: participantPassword,
      role: Role.PARTICIPANT,
      phone: '+91 99887 76656',
      department: 'CSE - 4th Year',
    },
  });

  const participant3 = await prisma.user.create({
    data: {
      name: 'Aditya Deshmukh',
      email: 'aditya.d@ayojanix.demo',
      password: participantPassword,
      role: Role.PARTICIPANT,
      phone: '+91 99887 76657',
      department: 'AI & Data Science',
    },
  });

  const participant4 = await prisma.user.create({
    data: {
      name: 'Sneha Patil',
      email: 'sneha.patil@ayojanix.demo',
      password: participantPassword,
      role: Role.PARTICIPANT,
      phone: '+91 99887 76658',
      department: 'Electronics & Telecomm',
    },
  });

  const participant5 = await prisma.user.create({
    data: {
      name: 'Rohan Joshi',
      email: 'rohan.joshi@ayojanix.demo',
      password: participantPassword,
      role: Role.PARTICIPANT,
      phone: '+91 99887 76659',
      department: 'Information Technology',
    },
  });

  console.log('✅ Created 10 demo users across all roles.');

  // 2. Create Venues
  const venueAuditorium = await prisma.venue.create({
    data: {
      name: 'Dr. A.P.J. Abdul Kalam Central Auditorium',
      location: 'Block A, 2nd Floor, Campus East',
      capacity: 650,
      facilities: 'High-end Dolby sound, 4K Projector, Central AC, Podium Mic, Live Streaming rig',
      availability: true,
      price: 15000,
    },
  });

  const venueSeminarHall = await prisma.venue.create({
    data: {
      name: 'Visvesvaraya Seminar Complex (Hall 1)',
      location: 'CSE Department Building, Ground Floor',
      capacity: 220,
      facilities: 'Dual HD Projectors, Ergonomic theater seating, High-speed LAN & WiFi',
      availability: true,
      price: 8000,
    },
  });

  const venueHackLab = await prisma.venue.create({
    data: {
      name: 'Turing Advanced Computing Innovation Lab',
      location: 'IT Tower, 3rd Floor',
      capacity: 180,
      facilities: '120 Dedicated Workstations, Gigabit Switch, Dual UPS backup, Server Racks',
      availability: true,
      price: 12000,
    },
  });

  const venueAmphitheatre = await prisma.venue.create({
    data: {
      name: 'Open Air Amphitheatre & Cultural Arena',
      location: 'Student Activity Center Plaza',
      capacity: 1200,
      facilities: 'Open-air acoustic shell, Concert LED wall, Stage lighting, Green rooms',
      availability: true,
      price: 25000,
    },
  });

  console.log('✅ Created 4 campus venues.');

  // 3. Create Vendors
  const vendorCatering = await prisma.vendor.create({
    data: {
      name: 'Annapurna Gourmet Caterers & Hospitality',
      category: 'Food',
      contact: '+91 98230 44556 / catering@annapurna.demo',
      services: 'Buffet breakfast, High-tea snacks, Boxed lunch, Dinner spread, Mineral water counters',
      pricing: 180,
      rating: 4.8,
    },
  });

  const vendorAV = await prisma.vendor.create({
    data: {
      name: 'Apex Sound & Visual Stage Engineering',
      category: 'Equipment',
      contact: '+91 98230 77889 / sales@apexav.demo',
      services: 'Concert speakers, Wireless lapels, Truss lighting, 30ft LED backdrop screen',
      pricing: 35000,
      rating: 4.7,
    },
  });

  const vendorPrinting = await prisma.vendor.create({
    data: {
      name: 'SpeedyPrint Campus Solutions',
      category: 'Printing',
      contact: '+91 98230 99112 / print@speedyprint.demo',
      services: 'Lanyards, ID badges, Vinyl flex banners, Certificates, Standees, Pamphlets',
      pricing: 8500,
      rating: 4.9,
    },
  });

  const vendorPhoto = await prisma.vendor.create({
    data: {
      name: 'LensCraft Media & Drone Photography',
      category: 'Photography',
      contact: '+91 98230 22334 / info@lenscraft.demo',
      services: '4K Multi-camera coverage, 4K Drone highlights, Event aftermovie, Live photo booth',
      pricing: 18000,
      rating: 4.6,
    },
  });

  console.log('✅ Created 4 partner vendors.');

  // 4. Create Volunteer Profiles
  const volProfile1 = await prisma.volunteer.create({
    data: {
      userId: volunteer1.id,
      name: volunteer1.name,
      email: volunteer1.email,
      phone: volunteer1.phone || '',
      skills: 'Team Leadership, Registration Desk, Fast QR Validation, Crowd Management',
      availability: 'Full Day Available',
      department: 'Computer Science & Engineering',
    },
  });

  const volProfile2 = await prisma.volunteer.create({
    data: {
      userId: volunteer2.id,
      name: volunteer2.name,
      email: volunteer2.email,
      phone: volunteer2.phone || '',
      skills: 'Network Configuration, AV Equipment, Live Stream, Technical Support',
      availability: 'Morning & Afternoon Shift',
      department: 'Information Technology',
    },
  });

  const volProfile3 = await prisma.volunteer.create({
    data: {
      userId: volunteer3.id,
      name: volunteer3.name,
      email: volunteer3.email,
      phone: volunteer3.phone || '',
      skills: 'Hospitality, Catering Supervision, Stage Coordination, First Aid',
      availability: 'Afternoon & Evening Shift',
      department: 'Computer Science',
    },
  });

  console.log('✅ Created volunteer profiles.');

  // 5. Create 5 Flagship Events
  const now = new Date();
  
  // Event 1: AI & Cloud Masterclass (COMPLETED - rich attendance, feedback, certificates)
  const event1 = await prisma.event.create({
    data: {
      name: 'AI & Cloud Computing Masterclass 2026',
      description: 'An intensive, hands-on masterclass focusing on Large Language Models, Multi-Agent systems, and scalable cloud architectures on Google Cloud Platform and AWS. Delivered by Google Developer Experts and senior architects.',
      type: EventType.WORKSHOP,
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      startTime: '09:30 AM',
      endTime: '04:30 PM',
      venueId: venueSeminarHall.id,
      venueName: venueSeminarHall.name,
      capacity: 200,
      registrationFee: 150,
      organizerId: organizer.id,
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      status: EventStatus.COMPLETED,
      registrationOpen: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      registrationClose: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Event 2: Cyber Security Workshop (ONGOING - ready for live check-in/out scanning!)
  const event2 = await prisma.event.create({
    data: {
      name: 'Cyber Security & Ethical Hacking Bootcamp',
      description: 'Live CTF (Capture The Flag) competitions, penetration testing methodologies, API security auditing, and zero-day vulnerability demonstration in a dedicated sandbox environment.',
      type: EventType.WORKSHOP,
      date: new Date(), // Today
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      venueId: venueHackLab.id,
      venueName: venueHackLab.name,
      capacity: 150,
      registrationFee: 250,
      organizerId: organizer.id,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      status: EventStatus.ONGOING,
      registrationOpen: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      registrationClose: new Date(now.getTime() + 1 * 60 * 60 * 1000),
    },
  });

  // Event 3: Smart India Hackathon (REGISTRATION_OPEN - upcoming flagship)
  const event3 = await prisma.event.create({
    data: {
      name: 'Smart India Campus Hackathon 2026',
      description: '36-hour non-stop hackathon tackling real-world problems in smart governance, clean energy, agricultural AI, and healthcare logistics. Over ₹1,50,000 in cash prizes and incubator access.',
      type: EventType.HACKATHON,
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      startTime: '08:00 AM',
      endTime: '08:00 PM (36h)',
      venueId: venueAuditorium.id,
      venueName: venueAuditorium.name,
      capacity: 450,
      registrationFee: 300,
      organizerId: organizer.id,
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      status: EventStatus.REGISTRATION_OPEN,
      registrationOpen: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      registrationClose: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Event 4: DSA Contest (REGISTRATION_OPEN)
  const event4 = await prisma.event.create({
    data: {
      name: 'Algorithmic Grand Prix: DSA & Competitive Coding',
      description: 'Speed algorithmic problem-solving sprint featuring dynamic programming, graph theory, advanced data structures, and live code execution leaderboard.',
      type: EventType.TECHNICAL,
      date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // In 12 days
      startTime: '02:00 PM',
      endTime: '06:00 PM',
      venueId: venueSeminarHall.id,
      venueName: venueSeminarHall.name,
      capacity: 180,
      registrationFee: 100,
      organizerId: organizer.id,
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      status: EventStatus.REGISTRATION_OPEN,
      registrationOpen: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      registrationClose: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  // Event 5: Annual Cultural Fest (PUBLISHED)
  const event5 = await prisma.event.create({
    data: {
      name: 'Tarang 2026: Annual Inter-College Cultural Extravaganza',
      description: 'The mega annual cultural festival featuring battle of bands, classical fusion dance, theatrical drama, fashion runway, food carnivals, and celebrity artist night.',
      type: EventType.CULTURAL,
      date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // In 20 days
      startTime: '10:00 AM',
      endTime: '11:00 PM',
      venueId: venueAmphitheatre.id,
      venueName: venueAmphitheatre.name,
      capacity: 1200,
      registrationFee: 200,
      organizerId: organizer.id,
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      status: EventStatus.PUBLISHED,
      registrationOpen: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      registrationClose: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created 5 flagship college events.');

  // 6. Assign Volunteers to Duties
  await prisma.volunteerAssignment.createMany({
    data: [
      {
        eventId: event2.id, // Cyber Security Workshop (ONGOING)
        volunteerId: volProfile1.id,
        duty: 'Main Gate QR Registration & Pass Desk',
        shift: '09:00 AM - 01:00 PM',
        status: 'ASSIGNED',
      },
      {
        eventId: event2.id,
        volunteerId: volProfile2.id,
        duty: 'Lab 3 Terminal Configuration & WiFi Credentials',
        shift: '09:30 AM - 02:00 PM',
        status: 'ASSIGNED',
      },
      {
        eventId: event2.id,
        volunteerId: volProfile3.id,
        duty: 'Lunch Box & Mineral Water Distribution Desk',
        shift: '12:30 PM - 03:00 PM',
        status: 'ASSIGNED',
      },
      {
        eventId: event3.id, // Hackathon
        volunteerId: volProfile1.id,
        duty: 'Hacker Registration & Welcome Kit Distribution',
        shift: '07:30 AM - 12:00 PM',
        status: 'ASSIGNED',
      },
      {
        eventId: event3.id,
        volunteerId: volProfile2.id,
        duty: 'Mentorship Booth Coordination & Server Monitoring',
        shift: '02:00 PM - 08:00 PM',
        status: 'ASSIGNED',
      },
    ],
  });

  console.log('✅ Assigned volunteers to duty rosters.');

  // 7. Create Registrations for Participants
  // Registration IDs formatted as AYX-2026-00101, etc.
  const reg1 = await prisma.registration.create({
    data: {
      registrationCode: 'AYX-2026-00101',
      eventId: event1.id,
      userId: participant1.id,
      participantName: participant1.name,
      participantEmail: participant1.email,
      status: RegistrationStatus.ATTENDED,
      qrCodeData: JSON.stringify({
        code: 'AYX-2026-00101',
        event: event1.name,
        name: participant1.name,
        email: participant1.email,
      }),
    },
  });

  const reg2 = await prisma.registration.create({
    data: {
      registrationCode: 'AYX-2026-00102',
      eventId: event1.id,
      userId: participant2.id,
      participantName: participant2.name,
      participantEmail: participant2.email,
      status: RegistrationStatus.ATTENDED,
      qrCodeData: JSON.stringify({
        code: 'AYX-2026-00102',
        event: event1.name,
        name: participant2.name,
        email: participant2.email,
      }),
    },
  });

  const reg3 = await prisma.registration.create({
    data: {
      registrationCode: 'AYX-2026-00103',
      eventId: event1.id,
      userId: participant3.id,
      participantName: participant3.name,
      participantEmail: participant3.email,
      status: RegistrationStatus.ATTENDED,
      qrCodeData: JSON.stringify({
        code: 'AYX-2026-00103',
        event: event1.name,
        name: participant3.name,
        email: participant3.email,
      }),
    },
  });

  // Event 2 (Ongoing) Registrations
  const reg4 = await prisma.registration.create({
    data: {
      registrationCode: 'AYX-2026-00201',
      eventId: event2.id,
      userId: participant1.id,
      participantName: participant1.name,
      participantEmail: participant1.email,
      status: RegistrationStatus.CONFIRMED,
      qrCodeData: JSON.stringify({
        code: 'AYX-2026-00201',
        event: event2.name,
        name: participant1.name,
        email: participant1.email,
      }),
    },
  });

  const reg5 = await prisma.registration.create({
    data: {
      registrationCode: 'AYX-2026-00202',
      eventId: event2.id,
      userId: participant4.id,
      participantName: participant4.name,
      participantEmail: participant4.email,
      status: RegistrationStatus.CONFIRMED,
      qrCodeData: JSON.stringify({
        code: 'AYX-2026-00202',
        event: event2.name,
        name: participant4.name,
        email: participant4.email,
      }),
    },
  });

  const reg6 = await prisma.registration.create({
    data: {
      registrationCode: 'AYX-2026-00203',
      eventId: event2.id,
      userId: participant5.id,
      participantName: participant5.name,
      participantEmail: participant5.email,
      status: RegistrationStatus.CONFIRMED,
      qrCodeData: JSON.stringify({
        code: 'AYX-2026-00203',
        event: event2.name,
        name: participant5.name,
        email: participant5.email,
      }),
    },
  });

  // Event 3 (Hackathon) Registrations
  await prisma.registration.create({
    data: {
      registrationCode: 'AYX-2026-00301',
      eventId: event3.id,
      userId: participant1.id,
      participantName: participant1.name,
      participantEmail: participant1.email,
      status: RegistrationStatus.CONFIRMED,
      qrCodeData: JSON.stringify({
        code: 'AYX-2026-00301',
        event: event3.name,
        name: participant1.name,
        email: participant1.email,
      }),
    },
  });

  await prisma.registration.create({
    data: {
      registrationCode: 'AYX-2026-00302',
      eventId: event3.id,
      userId: participant2.id,
      participantName: participant2.name,
      participantEmail: participant2.email,
      status: RegistrationStatus.CONFIRMED,
      qrCodeData: JSON.stringify({
        code: 'AYX-2026-00302',
        event: event3.name,
        name: participant2.name,
        email: participant2.email,
      }),
    },
  });

  console.log('✅ Created participant registrations with unique AYX codes.');

  // 8. Create Attendance Records for Completed Event 1
  await prisma.attendance.create({
    data: {
      registrationId: reg1.id,
      eventId: event1.id,
      userId: participant1.id,
      status: AttendanceStatus.CHECKED_IN,
      checkInTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      checkOutTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
      scannedBy: volunteer1.name,
    },
  });

  await prisma.attendance.create({
    data: {
      registrationId: reg2.id,
      eventId: event1.id,
      userId: participant2.id,
      status: AttendanceStatus.CHECKED_IN,
      checkInTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000 + 15 * 60 * 1000),
      checkOutTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
      scannedBy: volunteer1.name,
    },
  });

  await prisma.attendance.create({
    data: {
      registrationId: reg3.id,
      eventId: event1.id,
      userId: participant3.id,
      status: AttendanceStatus.CHECKED_IN,
      checkInTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000 + 25 * 60 * 1000),
      checkOutTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
      scannedBy: volunteer1.name,
    },
  });

  // Seed 1 active check-in for Ongoing Event 2
  await prisma.attendance.create({
    data: {
      registrationId: reg4.id,
      eventId: event2.id,
      userId: participant1.id,
      status: AttendanceStatus.CHECKED_IN,
      checkInTime: new Date(now.getTime() - 45 * 60 * 1000),
      scannedBy: volunteer1.name,
    },
  });

  console.log('✅ Created attendance check-in/out records.');

  // 9. Create Feedback with Sentiments
  await prisma.feedback.create({
    data: {
      eventId: event1.id,
      registrationId: reg1.id,
      userId: participant1.id,
      rating: 5,
      comment: 'Superb masterclass! The hands-on deployment of LLMs on the cloud was thoroughly explained. Great instructors!',
      sentiment: FeedbackSentiment.POSITIVE,
      sentimentScore: 0.94,
    },
  });

  await prisma.feedback.create({
    data: {
      eventId: event1.id,
      registrationId: reg2.id,
      userId: participant2.id,
      rating: 4,
      comment: 'Very informative session and well coordinated. The lab network was slightly slow for 15 minutes, but overall an excellent learning experience.',
      sentiment: FeedbackSentiment.POSITIVE,
      sentimentScore: 0.72,
    },
  });

  await prisma.feedback.create({
    data: {
      eventId: event1.id,
      registrationId: reg3.id,
      userId: participant3.id,
      rating: 3,
      comment: 'Good presentation content, but the afternoon session felt rushed and needed more practical debugging time.',
      sentiment: FeedbackSentiment.NEUTRAL,
      sentimentScore: 0.15,
    },
  });

  console.log('✅ Created feedback entries with sentiments.');

  // 10. Create Certificates
  const cert1 = await prisma.certificate.create({
    data: {
      certificateCode: 'CERT-AYX-2026-90001',
      eventId: event1.id,
      registrationId: reg1.id,
      participantName: participant1.name,
      eventName: event1.name,
      issueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      status: 'VALID',
      qrCodeData: JSON.stringify({
        certId: 'CERT-AYX-2026-90001',
        student: participant1.name,
        event: event1.name,
        status: 'VALID',
        verifyUrl: 'http://localhost:5173/verify/CERT-AYX-2026-90001',
      }),
    },
  });

  await prisma.certificate.create({
    data: {
      certificateCode: 'CERT-AYX-2026-90002',
      eventId: event1.id,
      registrationId: reg2.id,
      participantName: participant2.name,
      eventName: event1.name,
      issueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      status: 'VALID',
      qrCodeData: JSON.stringify({
        certId: 'CERT-AYX-2026-90002',
        student: participant2.name,
        event: event1.name,
        status: 'VALID',
        verifyUrl: 'http://localhost:5173/verify/CERT-AYX-2026-90002',
      }),
    },
  });

  console.log('✅ Generated verified certificates with QR verification codes.');

  // 11. Create Finance Transactions & Invoices
  await prisma.financeTransaction.createMany({
    data: [
      {
        eventId: event1.id,
        description: 'Participant Registration Fees (185 tickets)',
        category: 'TicketSales',
        amount: 27750,
        type: TransactionType.INCOME,
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
      },
      {
        eventId: event1.id,
        description: 'Industry Sponsorship (CloudSys Tech)',
        category: 'Sponsorship',
        amount: 35000,
        type: TransactionType.INCOME,
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
      },
      {
        eventId: event1.id,
        description: 'Guest Speaker Honorarium & Travel',
        category: 'Other',
        amount: 15000,
        type: TransactionType.EXPENSE,
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
      },
      {
        eventId: event1.id,
        description: 'High-Tea & Buffet Lunch for Attendees',
        category: 'Food',
        amount: 18500,
        type: TransactionType.EXPENSE,
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        vendorId: vendorCatering.id,
        status: 'COMPLETED',
      },
      {
        eventId: event1.id,
        description: 'Event Kits, Badges & Certificates Printing',
        category: 'Printing',
        amount: 6200,
        type: TransactionType.EXPENSE,
        date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        vendorId: vendorPrinting.id,
        status: 'COMPLETED',
      },
      {
        eventId: event3.id, // Hackathon budget
        description: 'Title Sponsorship from Google Cloud for Startups',
        category: 'Sponsorship',
        amount: 120000,
        type: TransactionType.INCOME,
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
      },
      {
        eventId: event3.id,
        description: 'Auditorium Booking Advance',
        category: 'Venue',
        amount: 15000,
        type: TransactionType.EXPENSE,
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'COMPLETED',
      },
      {
        eventId: event3.id,
        description: 'Stage Lighting & Concert Sound Rigging',
        category: 'Equipment',
        amount: 28000,
        type: TransactionType.EXPENSE,
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        vendorId: vendorAV.id,
        status: 'COMPLETED',
      },
    ],
  });

  // Formal Invoices
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-AYX-2026-001',
      eventId: event1.id,
      vendorId: vendorCatering.id,
      recipientName: 'Annapurna Gourmet Caterers',
      recipientEmail: 'catering@annapurna.demo',
      description: 'Catering package for AI Masterclass (185 participants + 15 staff)',
      amount: 18500,
      paymentStatus: 'PAID',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-AYX-2026-002',
      eventId: event1.id,
      vendorId: vendorPrinting.id,
      recipientName: 'SpeedyPrint Campus Solutions',
      recipientEmail: 'print@speedyprint.demo',
      description: 'Lanyards, badges and participation certificate printing',
      amount: 6200,
      paymentStatus: 'PAID',
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created finance ledger transactions and formal invoices.');

  // 12. Create Announcements & Emergency Alert
  await prisma.announcement.create({
    data: {
      title: '🚨 EMERGENCY ALERT: Electrical Maintenance in Block B',
      message: 'Due to scheduled transformer load testing, all activities in Block B are temporarily relocated to the Main Auditorium until 02:00 PM. Follow volunteer guidance.',
      priority: AnnouncementType.EMERGENCY,
      createdById: admin.id,
    },
  });

  await prisma.announcement.create({
    data: {
      eventId: event2.id,
      title: 'Workshop WiFi Credentials & CTF Server IP',
      message: 'Connect to SSID: "Ayojanix-Secure-Lab" (Password: Hack@Campus2026). CTF Leaderboard is live on http://10.0.4.15:8080.',
      priority: AnnouncementType.IMPORTANT,
      createdById: organizer.id,
    },
  });

  await prisma.announcement.create({
    data: {
      eventId: event3.id,
      title: 'Smart India Hackathon: Problem Statements Released!',
      message: 'All 8 challenge tracks have now been published. Team leads must submit initial abstract PDFs before 11:59 PM tomorrow.',
      priority: AnnouncementType.NORMAL,
      createdById: organizer.id,
    },
  });

  console.log('✅ Created announcements including prominent Emergency Alert.');

  // 13. Create In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: participant1.id,
        title: 'Registration Confirmed!',
        message: 'Your registration for Cyber Security Workshop (AYX-2026-00201) is confirmed. Your QR pass is ready.',
        type: 'REGISTRATION',
        link: '/my-qr',
      },
      {
        userId: participant1.id,
        title: 'Certificate Available',
        message: 'Your certificate for AI & Cloud Masterclass is generated and ready to download.',
        type: 'CERTIFICATE',
        link: `/verify/${cert1.certificateCode}`,
      },
      {
        userId: volunteer1.id,
        title: 'Duty Assignment Notice',
        message: 'You have been assigned to Main Gate QR Registration & Pass Desk for Cyber Security Workshop.',
        type: 'DUTY',
        link: '/volunteer/duties',
      },
      {
        userId: admin.id,
        title: 'System Milestone',
        message: 'Over ₹1,80,000 in registrations and sponsorships logged across 5 college events.',
        type: 'FINANCE',
        link: '/admin/finance',
      },
    ],
  });

  console.log('✅ Created in-app user notifications.');

  console.log(`
=====================================================
🎉 AYOJANIX DATABASE SEEDING COMPLETED SUCCESSFULLY!
=====================================================
Demo Logins:
- Admin:       admin@ayojanix.demo       / Admin@123
- Organizer:   organizer@ayojanix.demo   / Organizer@123
- Volunteer:   volunteer@ayojanix.demo   / Volunteer@123
- Participant: participant@ayojanix.demo / Participant@123
=====================================================
`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
