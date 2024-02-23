type CampaignCategory = {
  _id: string;
  title: string;
  description: string; 
  status: 'active' | 'inactive';
  suggestions?: string[];
  createdAt: Date;
  updatedAt: Date;
};