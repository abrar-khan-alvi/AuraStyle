# AuraStyle 👕✨

**AuraStyle** is a premium, AI-powered personal stylist that transforms how you manage your wardrobe. Using Google's Gemini AI, it analyzes your clothing items to curate perfect outfit combinations for any occasion, all while keeping your data private and local.

## 🌟 Key Features

- **📸 Digital Wardrobe**: Digitally archive your entire clothing collection with AI-powered analysis of colors, categories, and tags.
- **🪄 AI Stylist**: Get personalized outfit suggestions based on your actual pieces. Gemini acts as your personal fashion consultant.
- **🔒 Privacy First**: Your wardrobe metadata and images are stored locally on your device. We respect your fashion privacy.
- **📱 Responsive Design**: A beautiful, glassmorphic interface that feels like a premium fashion app on any device.

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI Engine**: Google Gemini Pro Vision (@google/genai)
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abrar-khan-alvi/AuraStyle.git
   cd AuraStyle
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory (or use the existing one) and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📖 How to Use

1. **Add Piece**: Navigate to the "Wardrobe" tab and upload photos of your individual clothing items.
2. **Analysis**: AuraStyle will automatically categorize and tag your items using AI.
3. **Generate Magic**: Once you have at least 2 items, click the "AI Stylist" button to see curated outfit looks.
4. **Curate**: Manage your collection in the "Wardrobe" tab and view your style profile in the "Profile" tab.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for new features or improvements.

---

<p align="center">
  Built with ❤️ for fashion and technology.
</p>
