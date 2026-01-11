<p align="center">
  <img src="https://img.shields.io/badge/PDF_Tools_Pro-6C63FF?style=for-the-badge&logo=files&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
</p>

<h1 align="center">PDF Tools Pro</h1>
<p align="center">
  <b>A complete, local-first PDF processing suite with 8 powerful tools</b><br>
  <i>Modern TypeScript backend • Beautiful responsive UI • 100% Local Processing • Dark Mode</i>
</p>

---

## ✨ Features

### 🎯 Core PDF Processing

| Feature | Description |
|--------|-------------|
| **Merge PDFs** | Combine multiple PDF files into one unified document |
| **Split PDF** | Split PDF by page count or extract specific pages |
| **Compress PDF** | Reduce file size without losing quality |
| **PDF Info** | Extract metadata and document information |

### 🚀 Advanced Features

| Feature | Description |
|--------|-------------|
| **PDF to Images** | Convert PDF pages to high-quality PNG or JPEG images |
| **PDF to Text** | Extract text content from PDF documents |
| **Split by Ranges** | Advanced splitting with custom page ranges (e.g., "1-3,5,7-9") |
| **Images to PDF** | Convert multiple images into a single PDF |

### 🔒 Security & Privacy

- ✅ 100% local processing  
- ✅ No data storage  
- ✅ No cloud uploads  
- ✅ No API keys required  

### ⚡ Performance

- Fast processing with optimized TypeScript and Node.js backend  
- Responsive UI that works on all devices  
- Modern design with beautiful dark mode support  
- Real-time progress feedback  
- Smooth animations and transitions  

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ (recommended 16+)
- npm or yarn
- (Optional) Poppler-utils for PDF to Image conversion

### Installation

1. **Clone the repository**
```bash
cd "d:\Personal Project\pdf-processor"
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the project**
```bash
npm run build
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

---

## 📦 Installation Guide for Optional Dependencies

### PDF to Image Conversion (Optional)

To enable PDF to Image conversion, install Poppler:

**Windows (using Chocolatey):**
```bash
choco install poppler
```

**macOS (using Homebrew):**
```bash
brew install poppler
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install poppler-utils
```

---

## 🛠 Development

### Available Scripts

```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Clean build artifacts
npm run clean
```

### Project Structure

```
pdf-processor/
├── src/
│   ├── server.ts              # Express server setup
│   ├── controllers/
│   │   └── pdfController.ts   # PDF operation handlers
│   ├── services/
│   │   └── pdfService.ts      # PDF processing logic
│   ├── routes/
│   │   └── pdfRoutes.ts       # API route definitions
│   └── utils/
│       └── fileHandler.ts     # Multer file upload config
├── public/
│   ├── index.html             # Main UI
│   ├── js/
│   │   └── app.js             # Frontend JavaScript
│   └── css/
│       └── styles.css         # Styling with dark mode
├── dist/                       # Compiled JavaScript
└── uploads/                    # Uploaded files (temporary)
```

---

## 📚 API Endpoints

All endpoints are available at `http://localhost:5000/api/pdf/`

### PDF Operations

- `POST /merge` - Merge multiple PDFs
- `POST /split` - Split PDF by page count
- `POST /compress` - Compress PDF
- `POST /info` - Get PDF information

### Advanced Operations

- `POST /convert-to-images` - Convert PDF to images
- `POST /convert-to-text` - Extract text from PDF
- `POST /split-by-ranges` - Split by custom ranges
- `POST /images-to-pdf` - Create PDF from images
- `GET /health` - API health check

---

## 🎨 Features Overview

### User Interface
- **Modern Design** - Clean, intuitive interface with gradient backgrounds
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Real-time Feedback** - Progress bars and status messages
- **Drag & Drop** - Easy file upload with drag and drop support
- **Tool Cards** - Beautiful tool selection interface with feature lists

### Backend
- **TypeScript** - Fully typed for better development experience
- **Express.js** - Lightweight and fast HTTP server
- **Multer** - Secure file upload handling
- **PDF-lib** - Advanced PDF manipulation
- **PDF2JSON** - PDF text extraction
- **PDF-Poppler** - PDF to image conversion

---

## 🔧 Configuration

### Environment Variables
No environment variables required for basic setup. The server runs on port 5000 by default.

To change the port, modify `src/server.ts`:
```typescript
const PORT = process.env.PORT || 5000;
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**2. Module not found errors**
```bash
npm install
npm run build
```

**3. PDF to Image conversion not working**
Install poppler-utils (see Installation Guide above)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Support

For issues or feature requests, please open an issue in the repository.

---

<p align="center">
  Made with ❤️ for PDF processing
</p>

## Quick Start

### Prerequisites

- Node.js 18 or higher  
- npm or yarn  

### Installation

```bash
git clone https://github.com/AllenJohnn/PDF-Tools.git
cd PDF-Tools
npm install
npm run build
npm run dev
npm start
