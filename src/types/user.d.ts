type UserRole = 'campaigner' | 'contributor' | 'admin';

type CountryCode = {
  _id?: string;
  name: string;
  code: string;
  dialCode: string;
  currency?: string;
  suggestions?: string[];
  status?: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date; 
};

type User = {
  _id: string;
  fullName: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  dob: Date;
  avatarUrl?: string;
  role: UserRole[];
  status?: 'active' | 'blocked';
  suggestions?: string[];
  phone: string;
  hash?: string;
  wallet?: {
    amount: number;
    currency: string;
    recipientCode?: string;
  };
  about?: {
    title: string;
    description: string;
    links?: { _id: string; label: string; url: string }[];
    imageUrls?: string[];
  },
  country?: CountryCode;
  createdAt?: Date;
  updatedAt?: Date; 
};