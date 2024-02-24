type _File = {
  ext: string;
  mime: string;
  type: 'image' | 'video';
  thumbnail: string;
  filename: string;
  size: number;
  dimensions?: {
    height: number;
    width: number;
    orientation: number;
  };
};

type Campaign = {
  _id?: string;
  title: string;
  owner: User;
  description: string;
  status: 'active' | 'inactive';
  target: number;
  raised: number;
  current: number;
  currency: 'KES' | 'USD',
  coverImage?: string;
  category: CampaignCategory;
  suggestions?: string[];
  createdAt: Date;
  updatedAt: Date;
};