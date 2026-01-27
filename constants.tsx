
import React from 'react';
import { Shirt, Footprints, Watch, ShoppingBag, Layers } from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: { label: Category; icon: React.ReactNode }[] = [
  { label: 'Tops', icon: <Shirt size={20} /> },
  { label: 'Bottoms', icon: <Layers size={20} /> },
  { label: 'Shoes', icon: <Footprints size={20} /> },
  { label: 'Outerwear', icon: <ShoppingBag size={20} /> },
  { label: 'Accessories', icon: <Watch size={20} /> },
];

export const INITIAL_WARDROBE = [];
