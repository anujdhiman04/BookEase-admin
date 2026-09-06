export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface AdminOverview {
  cards: {
    users: number;
    providers: number;
    services: number;
    bookings: number;
    totalRevenueCents: number;
  };
  bookingStatus: Record<BookingStatus, number>;
}

export interface AdminUser {
  id: string;
  phone: string;
  name: string;
  role: string;
  accountStatus: string;
}

export interface AdminProvider {
  _id: string;
  name: string;
  category: string;
  address: string;
  ownerUserId: string;
  isActive: boolean;
}

export interface AdminService {
  _id: string;
  providerId: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  isActive: boolean;
}

export interface CategoryFee {
  key: string;
  label: string;
  feePercent: number;
  isActive: boolean;
}
