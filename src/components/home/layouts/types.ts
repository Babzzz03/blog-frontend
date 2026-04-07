import { Post, Category } from '@/types';
import { SiteSettings } from '@/services/settings.service';

export interface LayoutProps {
  posts: Post[];
  categories: Category[];
  settings: SiteSettings | null;
  totalPosts: number;
  currentPage: number;
  postsPerPage: number;
  activeCategory: string;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onCategoryChange: (cat: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchChange: (value: string) => void;
}
