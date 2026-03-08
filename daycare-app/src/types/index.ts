export interface User {
  id: string;
  name: string;
  role: 'parent' | 'nanny';
  avatar: string;
  location?: string;
}

export interface Nanny extends User {
  role: 'nanny';
  rate: number;
  experience: number;
  rating: number;
  reviewsCount: number;
  bio: string;
  specialties: string[];
  certifications: string[];
  responseRate: string;
  isVerified: boolean;
}

export interface Booking {
  id: string;
  nannyId: string;
  parentId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'past' | 'cancelled';
  nannyName: string;
  nannyAvatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}
