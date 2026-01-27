
import React, { useState, useEffect } from 'react';
import { Shirt, Sparkles, User, PlusCircle, Camera, Loader2, PackageOpen, Plus } from 'lucide-react';
import { ClothingItem, Outfit, UserPreferences, Category } from './types';
import { CATEGORIES } from './constants';
import { analyzeClothingImage, suggestOutfits } from './geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'stylist' | 'profile'>('wardrobe');
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>(() => {
    const saved = localStorage.getItem('aura-style-wardrobe');
    return saved ? JSON.parse(saved) : [];
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [preferences] = useState<UserPreferences>({
    style: 'Personalized',
    preferredColors: [],
    vibe: 'Daily Wear'
  });

  // Persist wardrobe to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('aura-style-wardrobe', JSON.stringify(wardrobe));
  }, [wardrobe]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const analysis = await analyzeClothingImage(base64);

        const newItem: ClothingItem = {
          id: Date.now().toString(),
          imageUrl: reader.result as string,
          category: (analysis.category as Category) || 'Tops',
          color: analysis.color || 'Unknown',
          name: analysis.name || 'New Item',
          tags: analysis.tags || []
        };

        setWardrobe(prev => [newItem, ...prev]);
      } catch (err) {
        console.error("Error analyzing image:", err);
        alert("Failed to analyze image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateOutfits = async () => {
    if (wardrobe.length < 2) {
      alert("Please upload at least 2 items to generate outfits!");
      return;
    }
    setIsGenerating(true);
    try {
      const suggestions = await suggestOutfits(wardrobe, preferences);
      setOutfits(suggestions);
      setActiveTab('stylist');
    } catch (error) {
      console.error(error);
      alert("Style consultation failed. Try uploading more items.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredWardrobe = selectedCategory === 'All'
    ? wardrobe
    : wardrobe.filter(item => item.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <Shirt className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">AuraStyle</h1>
        </div>
        <button
          onClick={handleGenerateOutfits}
          disabled={isGenerating || wardrobe.length < 2}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          AI Stylist
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-32 overflow-y-auto">
        {activeTab === 'wardrobe' && (
          <div className="p-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-1">Your Collection</h2>
                <p className="text-gray-500">{wardrobe.length} pieces digitized</p>
              </div>

              <div className="flex gap-2">
                <label className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                  <Plus size={20} className="text-black" />
                  <span className="font-semibold text-gray-900">Add Piece</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* Categories Filter */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-6 py-2.5 rounded-full transition-all flex-shrink-0 font-medium ${selectedCategory === 'All' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-black'}`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all flex-shrink-0 font-medium ${selectedCategory === cat.label ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-black'}`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Wardrobe State */}
            {isUploading && (
              <div className="mb-6 bg-white p-8 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-black" size={24} />
                </div>
                <p className="text-gray-600 font-medium text-center">Gemini is analyzing the details of your garment...</p>
              </div>
            )}

            {wardrobe.length === 0 && !isUploading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <PackageOpen className="text-gray-400" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Wardrobe Empty</h3>
                <p className="text-gray-500 max-w-xs mb-8">Start by photographing your favorite shirt, pant, or tie to begin your collection.</p>
                <label className="bg-black text-white px-8 py-3.5 rounded-full font-bold cursor-pointer hover:bg-gray-800 transition-all shadow-xl">
                  Curate Your First Piece
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
                {filteredWardrobe.map((item) => (
                  <div key={item.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">{item.category}</p>
                      <h3 className="text-base font-bold text-gray-900 truncate">{item.name}</h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-md font-bold uppercase">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setWardrobe(prev => prev.filter(i => i.id !== item.id))}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/10 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500"
                    >
                      <Plus className="rotate-45" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stylist' && (
          <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold mb-2">Curated Looks</h2>
              <p className="text-gray-500 italic">"Style is a way to say who you are without having to speak."</p>
            </div>

            {outfits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm px-6 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="text-gray-300" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3">No Styling Consultations Yet</h3>
                <p className="text-gray-500 max-w-md mb-8">Ready for some inspiration? Click below to let Gemini generate outfits from your actual pieces.</p>
                <button
                  onClick={handleGenerateOutfits}
                  disabled={wardrobe.length < 2}
                  className="bg-black text-white px-10 py-4 rounded-full hover:bg-gray-800 transition-all font-bold shadow-xl disabled:bg-gray-300"
                >
                  Generate Magic
                </button>
                {wardrobe.length < 2 && <p className="mt-4 text-xs text-red-500 font-bold uppercase tracking-widest">You need at least 2 items in your wardrobe</p>}
              </div>
            ) : (
              <div className="space-y-16">
                {outfits.map((outfit) => (
                  <div key={outfit.id} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 transition-all hover:shadow-lg">
                    <div className="flex flex-col lg:flex-row gap-12">
                      <div className="lg:w-1/2">
                        <span className="inline-block px-4 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                          {outfit.occasion}
                        </span>
                        <h3 className="text-4xl font-bold mb-4">{outfit.name}</h3>
                        <p className="text-gray-600 text-lg mb-8 leading-relaxed font-medium">{outfit.description}</p>

                        <div className="bg-gray-50 rounded-2xl p-6 border-l-4 border-black">
                          <h4 className="font-black flex items-center gap-2 mb-2 text-xs uppercase tracking-widest text-gray-900">
                            <Sparkles size={14} /> Stylist's Tip
                          </h4>
                          <p className="text-gray-700 italic leading-relaxed">"{outfit.stylistTip}"</p>
                        </div>
                      </div>

                      <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                        {outfit.items.map((item, idx) => (
                          <div key={item.id} className={`rounded-3xl overflow-hidden relative shadow-md ${idx === 0 ? 'row-span-2' : ''}`}>
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                              <div>
                                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-0.5">{item.category}</p>
                                <p className="text-white text-sm font-bold">{item.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center gap-8 mb-10">
                <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-3xl font-black text-white shadow-xl">
                  MY
                </div>
                <div>
                  <h2 className="text-3xl font-bold">My Personal Style</h2>
                  <p className="text-gray-400 font-medium">Digital Wardrobe Manager</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Total Collection</p>
                    <p className="text-3xl font-bold">{wardrobe.length} Pieces</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Styling Sessions</p>
                    <p className="text-3xl font-bold">{outfits.length > 0 ? 'Active' : 'Ready'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Storage Information</label>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    All images and wardrobe metadata are stored locally on this device. Clearing your browser data will reset your collection.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm("Are you sure? This will delete all your uploaded pieces.")) {
                  setWardrobe([]);
                  setOutfits([]);
                  localStorage.removeItem('style-synch-wardrobe');
                }
              }}
              className="w-full py-4 text-red-500 font-bold border-2 border-red-50 border-dashed rounded-[2rem] hover:bg-red-50 transition-colors"
            >
              Reset My Wardrobe
            </button>
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-100 px-6 py-4 pb-8 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'wardrobe' ? 'text-black' : 'text-gray-400'}`}
          >
            <Shirt size={24} strokeWidth={activeTab === 'wardrobe' ? 2.5 : 2} className={activeTab === 'wardrobe' ? 'scale-110' : ''} />
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">Wardrobe</span>
          </button>

          <button
            onClick={() => setActiveTab('stylist')}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'stylist' ? 'text-black' : 'text-gray-400'}`}
          >
            <Sparkles size={24} strokeWidth={activeTab === 'stylist' ? 2.5 : 2} className={activeTab === 'stylist' ? 'scale-110' : ''} />
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">Stylist</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'profile' ? 'text-black' : 'text-gray-400'}`}
          >
            <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} className={activeTab === 'profile' ? 'scale-110' : ''} />
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">Profile</span>
          </button>
        </div>
      </nav>

      {/* Mobile Add Button Floating */}
      {activeTab === 'wardrobe' && (
        <label className="fixed right-6 bottom-28 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform active:scale-95 z-50">
          <Camera size={28} />
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>
      )}
    </div>
  );
};

export default App;
