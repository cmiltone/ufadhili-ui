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
  _id?: string;
  fullName: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  dob?: Date;
  avatarUrl?: string;
  role: UserRole[];
  status?: 'active' | 'blocked';
  suggestions?: string[];
  phone: string;
  hash?: string;
  paystackRecipientCode: string;
  createdAt?: Date;
  updatedAt?: Date; 
};