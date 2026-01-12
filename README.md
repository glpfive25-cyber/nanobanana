# 🍌 Gemini Nano Banana Plus

A beautiful Next.js web application powered by Google's Gemini 2.5 Flash Image Preview model for AI image generation and editing.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xianyu110/gemini-nanobanana-plus)

## ✨ Features

### 🎨 AI Image Generation
- **Text-to-Image**: Generate images from text descriptions
- **Image Editing**: Upload images and edit them through natural conversation
- **Multiple Styles**: Enhanced details, artistic, anime, and photorealistic styles
- **Batch Generation**: Generate 1-4 images at once

### 🎯 User Experience
- **Beautiful UI**: Modern dark theme with gradient backgrounds and smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile devices  
- **Real-time Preview**: Instant feedback and loading animations
- **Multiple Modes**: Switch between upload and text generation modes

### 🔧 Technical Features
- **Next.js 14**: Server-side rendering and API routes
- **TypeScript**: Type-safe development
- **Multi-Model Support**: 
  - **Gemini 2.5 Flash**: Google's latest AI model for image generation
  - **Doubao SeedReam 4.0**: ByteDance's advanced image generation model
  - **Gitee AI (z-image-turbo)**: Fast image generation with daily quota (100 images/day)
- **Vercel Ready**: Optimized for seamless deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- API keys for AI models:
  - **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
  - **Doubao API key** from [Volcano Engine](https://console.volcengine.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xianyu110/gemini-nanobanana-plus.git
   cd gemini-nanobanana-plus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   MAYNOR_API_KEY=your_doubao_api_key_here
   MAYNOR_API_URL=https://apipro.maynor1024.live
   GITEE_AI_API_KEY=your_gitee_ai_api_key_here
   ```
   
   **Note**: Gitee AI has a daily limit of 100 images. See [Gitee AI Documentation](docs/GITEE_AI.md) for details.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

### One-Click Deploy
Click the button above to deploy directly to Vercel.

### Manual Deployment

1. **Fork this repository** on GitHub

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository

3. **Configure Environment Variables**
   In your Vercel project settings, add:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Deploy**
   Vercel will automatically build and deploy your project

## 🎯 Usage Guide

### Available Pages
- **Main App**: `/nano` - Full-featured Nano Banana interface
- **MVP Demo**: `/mvp` - Simple demo version
- **Home**: `/` - Landing page

### AI Model Selection
Choose between two powerful AI models:
- **🤖 Gemini 2.5 Flash**: Google's latest multimodal AI model
- **🎨 Doubao SeedReam 4.0**: ByteDance's advanced image generation model

### Text-to-Image Generation
1. Select "文生图模式" (Text-to-Image mode)
2. Choose your preferred AI model (Gemini or Doubao)
3. Enter your description in Chinese or English
4. Choose a style (Enhanced, Artistic, Anime, Photo)
5. Select number of images to generate (1-4)
6. Click "开始生成" (Start Generation)

### Image Editing
1. Select "通过对话编辑图像" (Image Editing mode)
2. Choose your preferred AI model (Gemini or Doubao)
3. Upload an image (PNG, JPG, WebP supported)
4. Describe the changes you want to make
5. Choose a style and generate

### Example Prompts
- **中文**: "一只可爱的橘猫坐在彩虹桥上，梦幻风格，柔和光线"
- **English**: "A cute orange cat sitting on a rainbow bridge, dreamy style, soft lighting"
- **编辑**: "将这张图片转换为油画风格，增加温暖色调"

## 🛠️ Development

### Project Structure
```
gemini-nano-banana/
├── app/
│   ├── api/
│   │   ├── gemini/          # Main Gemini API endpoint
│   │   ├── generate/        # Alternative generation endpoint
│   │   └── generate-demo/   # Demo endpoint
│   ├── nano/                # Main application page
│   ├── mvp/                 # MVP demo page
│   └── layout.tsx           # Root layout
├── public/                  # Static assets
├── .env.example            # Environment variables template
├── vercel.json            # Vercel deployment config
└── README.md              # Project documentation
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### API Endpoints
- `/api/gemini` - Gemini 2.5 Flash image generation API
- `/api/doubao` - Doubao SeedReam 4.0 image generation API
- `/api/generate` - Alternative generation endpoint
- `/api/generate-demo` - Demo endpoint

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Gemini API key from Google AI Studio | ✅ |
| `MAYNOR_API_KEY` | Your Doubao API key from Volcano Engine | ✅ |
| `MAYNOR_API_URL` | Doubao API base URL | ✅ |

## 🌟 UI Features

### 🍌 Nano Banana Interface
- **Modern Dark Theme**: Eye-friendly design with gradient backgrounds
- **Smooth Animations**: Hover effects and loading animations
- **Responsive Layout**: Perfect on desktop and mobile
- **Interactive Elements**: Enhanced buttons, inputs, and cards

### Visual Elements
- **Gradient Cards**: Beautiful background gradients
- **Glowing Effects**: Subtle shadows and glows
- **Smooth Transitions**: 0.3s ease transitions throughout
- **Loading States**: Rotating gear icon and pulse animations

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/xianyu110/gemini-nanobanana-plus/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🌟 Acknowledgments

- [Google Gemini](https://gemini.google.com) for the powerful AI model
- [Next.js](https://nextjs.org) for the amazing framework
- [Vercel](https://vercel.com) for seamless deployment

---

**Made with ❤️ using Google Gemini 2.5 Flash Image Preview**