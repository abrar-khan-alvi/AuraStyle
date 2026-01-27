
import { GoogleGenAI, Type } from "@google/genai";
import { ClothingItem, Category, Outfit, UserPreferences } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeClothingImage = async (base64Image: string): Promise<Partial<ClothingItem>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this clothing item. Categorize it as one of: Tops, Bottoms, Shoes, Outerwear, or Accessories (e.g. ties, belts, hats). Identify the primary color, a descriptive name, and 3 style tags. Return as JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          color: { type: Type.STRING },
          name: { type: Type.STRING },
          tags: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["category", "color", "name", "tags"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {};
  }
};

export const suggestOutfits = async (wardrobe: ClothingItem[], preferences: UserPreferences): Promise<Outfit[]> => {
  const wardrobeSummary = wardrobe.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    color: item.color,
    tags: item.tags
  }));

  const prompt = `
    Based on this wardrobe: ${JSON.stringify(wardrobeSummary)}
    And style focus: ${preferences.style}
    
    Generate 3 high-fashion outfit combinations.
    Important: Try to include at least one top and one bottom. If accessories like ties or shoes are available, include them to complete the look.
    
    For each outfit:
    - name: Catchy fashion name
    - occasion: e.g. Business Formal, Casual Friday, Dinner Party
    - itemIds: Array of IDs from the provided wardrobe
    - description: Why these pieces work together
    - stylistTip: Professional advice on fit or styling
    
    Return as a JSON array of outfits.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            occasion: { type: Type.STRING },
            itemIds: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            stylistTip: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "occasion", "itemIds", "stylistTip", "description"]
        }
      }
    }
  });

  const parsed = JSON.parse(response.text || '[]');
  
  return parsed.map((o: any, index: number) => ({
    ...o,
    id: `outfit-${Date.now()}-${index}`,
    items: o.itemIds.map((id: string) => wardrobe.find(item => item.id === id)).filter(Boolean)
  }));
};
