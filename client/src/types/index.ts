export type Role = 'ADMIN' | 'ORGANIZER' | 'VOLUNTEER' | 'PARTICIPANT';

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type EventType =
  | 'HACKATHON'
  | 'WORKSHOP'
  | 'SEMINAR'
  | 'CONFERENCE'
  | 'CULTURAL'
  | 'TECHNICAL'
  | 'SPORTS'
  | 'OTHER';

export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED';

export type AttendanceStatus = 'CHECKED_IN' | 'CHECKED_OUT';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type AnnouncementType = 'NORMAL' | 'IMPORTANT' | 'EMERGENCY';

export type FeedbackSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  department?: string | null;
  createdAt?: string;
  _count?: {
    registrations?: number;
    attendanceRecords?: number;
    eventsOrganized?: number;
  };
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string;
  availability: boolean;
  price: number;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  services: string;
  pricing: number;
  rating: number;
}

export interface Volunteer {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone: string;
  skills: string;
  availability: string;
  department: string;
  assignments?: VolunteerAssignment[];
}

export interface VolunteerAssignment {
  id: string;
  eventId: string;
  volunteerId: string;
  duty: string;
  shift: string;
  status: string;
  event?: Event;
  volunteer?: Volunteer;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  venueId?: string | null;
  venueName?: string | null;
  capacity: number;
  registrationFee: number;
  organizerId: string;
  image?: string | null;
  status: EventStatus;
  registrationOpen?: string | null;
  registrationClose?: string | null;
  organizer?: { id: string; name: string; email: string; phone?: string | null };
  venue?: Venue | null;
  volunteerAssignments?: VolunteerAssignment[];
  announcements?: Announcement[];
  _count?: {
    registrations: number;
    attendance: number;
    feedback: number;
  };
}

export interface Registration {
  id: string;
  registrationCode: string;
  eventId: string;
  userId: string;
  participantName: string;
  participantEmail: string;
  status: RegistrationStatus;
  qrCodeData: string;
  createdAt: string;
  event?: Event;
  attendance?: Attendance[];
  feedback?: Feedback | null;
  certificate?: Certificate | null;
}

export interface Attendance {
  id: string;
  registrationId: string;
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  checkInTime: string;
  checkOutTime?: string | null;
  scannedBy?: string | null;
  registration?: {
    registrationCode: string;
    participantName: string;
    participantEmail: string;
  };
}

export interface FinanceTransaction {
  id: string;
  eventId?: string | null;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
  status: string;
  vendorId?: string | null;
  event?: { id: string; name: string } | null;
  vendor?: { id: string; name: string; category: string } | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  eventId?: string | null;
  vendorId?: string | null;
  recipientName: string;
  recipientEmail: string;
  description: string;
  amount: number;
  date: string;
  paymentStatus: string;
  event?: { id: string; name: string } | null;
  vendor?: { id: string; name: string; category: string } | null;
}

export interface Feedback {
  id: string;
  eventId: string;
  registrationId: string;
  userId: string;
  rating: number;
  comment: string;
  sentiment: FeedbackSentiment;
  sentimentScore: number;
  createdAt: string;
  user?: { id: string; name: string; department?: string | null };
}

export interface Announcement {
  id: string;
  eventId?: string | null;
  title: string;
  message: string;
  priority: AnnouncementType;
  createdById: string;
  createdAt: string;
  event?: { id: string; name: string } | null;
  createdBy?: { id: string; name: string; role: Role } | null;
}

export interface Certificate {
  id: string;
  certificateCode: string;
  eventId: string;
  registrationId: string;
  participantName: string;
  eventName: string;
  issueDate: string;
  qrCodeData: string;
  status: string;
  event?: Event;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}
