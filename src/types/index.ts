export interface User {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  userId: string;
  title: string;
  content: string;
  excerpt?: string;
  image: string;
  category: string;
  slug: string;
  status?: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    robots?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    keywords?: string;
    focusKeyword?: string;
  };
  isPremium?: boolean;
  price?: number;
  priceUSD?: number;
  views?: number;
  likes: string[];
  numberOfLikes: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    image: string;
    isAdmin: boolean;
  };
}

export interface Comment {
  _id: string;
  content: string;
  postId: string;
  userId: string;
  parentId?: string | null;
  likes: string[];
  numberOfLikes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPosts {
  posts: Post[];
  totalPosts: number;
  lastMonthPosts: number;
}

export interface PaginatedComments {
  comments: Comment[];
  totalComments: number;
  lastMonthComments: number;
}

export interface PaginatedUsers {
  users: User[];
  totalUsers: number;
  lastMonthUsers: number;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
}
