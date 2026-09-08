export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: 'development' | 'design' | 'growth' | 'solutions';
  icon: string;
  features: string[];
  deliverables: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'Business Websites' | 'eCommerce Stores' | 'Web Applications' | 'Custom Digital Solutions';
  client: string;
  description: string;
  techStack: string[];
  metrics: string;
  link?: string;
  featuredImage: string;
  overview: string;
  keyFeatures: string[];
}

export interface TechItem {
  name: string;
  category: 'Frontend' | 'Backend' | 'CMS & eCommerce' | 'Design & Database';
  description: string;
  iconName: string;
  level: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  projectType: string;
  avatarUrl: string;
}

export interface MetricItem {
  value: string;
  label: string;
  subtext: string;
  icon: string;
}

