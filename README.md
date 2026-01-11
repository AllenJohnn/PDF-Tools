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

## Links

- Repository: [github.com/AllenJohnn/PDF-Tools](https://github.com/AllenJohnn/PDF-Tools)
- GitHub: [github.com/AllenJohnn](https://github.com/AllenJohnn)
- LinkedIn: [linkedin.com/in/allenjohnjoy](https://www.linkedin.com/in/allenjohnjoy/)
