
export type Category = 'Tops' | 'Bottoms' | 'Shoes' | 'Outerwear' | 'Accessories';

export interface ClothingItem {
  id: string;
  imageUrl: string;
  category: Category;
  color: string;
  tags: string[];
  name: string;
}

export interface Outfit {
  id: string;
  name: string;
  description: string;
  occasion: string;
  items: ClothingItem[];
  stylistTip: string;
}

export interface UserPreferences {
  style: string;
  preferredColors: string[];
  vibe: string;
}
