# PDF Tools Pro

A complete PDF processing suite built with TypeScript and Node.js. Process PDFs locally with 8 powerful tools, ensuring your files never leave your device.

## Features

### Core Operations

- **Merge PDFs** - Combine multiple PDF files into one document
- **Split PDF** - Split by page count or extract specific pages
- **Compress PDF** - Reduce file size while maintaining quality
- **PDF Info** - Extract metadata and document information

### Advanced Operations

- **PDF to Images** - Convert PDF pages to PNG or JPEG format
- **PDF to Text** - Extract text content from documents
- **Split by Ranges** - Custom page range splitting (e.g., "1-3,5,7-9")
- **Images to PDF** - Convert multiple images into a single PDF

### Security

All processing happens locally on your machine. No data is stored, uploaded to the cloud, or requires API keys.

## Quick Start

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Poppler-utils (optional, for PDF to Image conversion)

### Installation

```bash
git clone https://github.com/AllenJohnn/PDF-Tools.git
cd PDF-Tools
npm install
npm run build
npm run dev
```

The application will be available at `http://localhost:5000`

## React Client (Optional)

A modern React frontend is available in the `client` directory:

```bash
cd client
npm install
npm run dev
```

React app runs at `http://localhost:3001`

## Project Structure

```
pdf-processor/
├── src/
│   ├── server.ts              # Express server
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── routes/                # API routes
│   └── utils/                 # Utilities
├── public/                    # Static frontend
├── client/                    # React application
├── dist/                      # Compiled output
└── uploads/                   # Temporary file storage
```

## API Endpoints

Base URL: `http://localhost:5000/api/pdf/`

### Available Endpoints

- `POST /merge` - Merge multiple PDFs
- `POST /split` - Split PDF by page count
- `POST /compress` - Compress PDF file
- `POST /info` - Get PDF information
- `POST /convert-to-images` - Convert PDF to images
- `POST /convert-to-text` - Extract text from PDF
- `POST /split-by-ranges` - Split by custom ranges
- `POST /images-to-pdf` - Create PDF from images
- `GET /health` - Health check endpoint

## Development

### Available Scripts

```bash
npm run dev      # Development mode with auto-reload
npm run build    # Build TypeScript
npm start        # Start production server
npm run clean    # Remove build artifacts
```

### Technology Stack

**Backend:**
- TypeScript
- Express.js
- Multer (file uploads)
- PDF-lib (PDF manipulation)
- PDF2JSON (text extraction)
- PDF-Poppler (image conversion)

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Vite

## Configuration

### Port Configuration

Default port is 5000. To change it, modify `src/server.ts`:

```typescript
const PORT = process.env.PORT || 5000;
```

### Installing Poppler (Optional)

Required for PDF to Image conversion.

**Windows:**
```bash
choco install poppler
```

**macOS:**
```bash
brew install poppler
```

**Linux:**
```bash
sudo apt-get install poppler-utils
```

## Troubleshooting

### Port Already in Use

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Module Errors

```bash
npm install
npm run build
```

## License

MIT License

## Links

- Repository: [github.com/AllenJohnn/PDF-Tools](https://github.com/AllenJohnn/PDF-Tools)
- GitHub: [github.com/AllenJohnn](https://github.com/AllenJohnn)
- LinkedIn: [linkedin.com/in/allenjohnjoy](https://www.linkedin.com/in/allenjohnjoy/)
