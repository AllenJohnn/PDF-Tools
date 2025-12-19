// Configuration
const API_BASE_URL = 'http://localhost:5000/api/pdf';
let currentTool = null;
let selectedFiles = [];
let processingResults = [];

// Tool Definitions
const TOOLS = [
    {
        id: 'merge',
        title: 'Merge PDFs',
        icon: 'fas fa-layer-group',
        description: 'Combine multiple PDF files into a single document',
        features: ['Combine unlimited PDFs', 'Preserve quality', 'Maintain order'],
        requiresMultiple: true,
        apiEndpoint: '/merge',
        fieldName: 'files'
    },
    {
        id: 'split',
        title: 'Split PDF',
        icon: 'fas fa-cut',
        description: 'Split PDF by pages or extract specific pages',
        features: ['Split by page count', 'Extract pages', 'Maintain quality'],
        requiresMultiple: false,
        apiEndpoint: '/split',
        fieldName: 'file'
    },
    {
        id: 'compress',
        title: 'Compress PDF',
        icon: 'fas fa-compress-alt',
        description: 'Reduce PDF file size without losing quality',
        features: ['Smart compression', 'Quality preservation', 'Fast processing'],
        requiresMultiple: false,
        apiEndpoint: '/compress',
        fieldName: 'file'
    },
    {
        id: 'info',
        title: 'PDF Info',
        icon: 'fas fa-info-circle',
        description: 'Extract metadata and document information',
        features: ['Page count', 'File size', 'Metadata extraction'],
        requiresMultiple: false,
        apiEndpoint: '/info',
        fieldName: 'file'
    },
    {
        id: 'pdf-to-images',
        title: 'PDF to Images',
        icon: 'fas fa-file-image',
        description: 'Convert PDF pages to high-quality images',
        features: ['PNG/JPEG formats', 'Custom resolution', 'Batch convert'],
        requiresMultiple: false,
        apiEndpoint: '/convert-to-images',
        fieldName: 'file',
        options: {
            format: { type: 'select', label: 'Format', options: ['png', 'jpeg'], default: 'png' },
            pages: { type: 'text', label: 'Pages (optional)', placeholder: 'e.g., 1-3,5 or "all"' }
        }
    },
    {
        id: 'pdf-to-text',
        title: 'PDF to Text',
        icon: 'fas fa-file-alt',
        description: 'Extract text content from PDF documents',
        features: ['Text extraction', 'Format preservation', 'Batch processing'],
        requiresMultiple: false,
        apiEndpoint: '/convert-to-text',
        fieldName: 'file'
    },
    {
        id: 'split-ranges',
        title: 'Split by Ranges',
        icon: 'fas fa-columns',
        description: 'Advanced splitting with custom page ranges',
        features: ['Custom ranges', 'Multiple outputs', 'Flexible splitting'],
        requiresMultiple: false,
        apiEndpoint: '/split-by-ranges',
        fieldName: 'file',
        options: {
            ranges: { type: 'text', label: 'Page Ranges', placeholder: 'e.g., 1-3,5,7-9', required: true }
        }
    },
    {
        id: 'images-to-pdf',
        title: 'Images to PDF',
        icon: 'fas fa-images',
        description: 'Convert multiple images into a single PDF',
        features: ['Multiple formats', 'Quality control', 'Custom ordering'],
        requiresMultiple: true,
        apiEndpoint: '/merge', // Using merge endpoint for now
        fieldName: 'files'
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeTools();
    setupEventListeners();
    checkServerStatus();
});

// Initialize Tools Grid
function initializeTools() {
    const toolsGrid = document.querySelector('.tools-grid');
    if (!toolsGrid) return;

    toolsGrid.innerHTML = TOOLS.map(tool => `
        <div class="tool-card" data-tool-id="${tool.id}">
            <div class="tool-header">
                <div class="tool-icon">
                    <i class="${tool.icon}"></i>
                </div>
                <h3>${tool.title}</h3>
            </div>
            <div class="tool-body">
                <p class="tool-description">${tool.description}</p>
                <ul class="tool-features">
                    ${tool.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                </ul>
            </div>
            <div class="tool-footer">
                <button class="btn btn-primary" onclick="selectTool('${tool.id}')">
                    <i class="fas fa-play"></i> Use Tool
                </button>
            </div>
        </div>
    `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // File input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Drag and drop
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
    }
}

// Theme Management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.querySelector('#themeToggle i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Tool Selection
function selectTool(toolId) {
    currentTool = TOOLS.find(t => t.id === toolId);
    if (!currentTool) return;

    // Update modal title
    document.getElementById('modalTitle').textContent = currentTool.title;

    // Show tool-specific options
    const toolOptions = document.getElementById('toolOptions');
    if (currentTool.options) {
        toolOptions.innerHTML = Object.entries(currentTool.options).map(([key, option]) => `
            <div class="option-group">
                <label for="${key}">${option.label}${option.required ? ' *' : ''}</label>
                ${option.type === 'select' ? `
                    <select id="${key}">
                        ${option.options.map(opt => `<option value="${opt}" ${opt === option.default ? 'selected' : ''}>${opt.toUpperCase()}</option>`).join('')}
                    </select>
                ` : `
                    <input type="text" id="${key}" placeholder="${option.placeholder || ''}" ${option.required ? 'required' : ''}>
                `}
            </div>
        `).join('');
        toolOptions.style.display = 'block';
    } else {
        toolOptions.innerHTML = '';
        toolOptions.style.display = 'none';
    }

    // Reset state
    selectedFiles = [];
    updateFileList();
    updateProcessButton();

    // Show modal
    document.getElementById('processingModal').classList.add('active');
}

// File Handling
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer.files).filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    addFiles(files);
}

function addFiles(files) {
    const validFiles = files.filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    selectedFiles.push(...validFiles.map(file => ({
        file: file,
        name: file.name,
        size: formatFileSize(file.size),
        id: Date.now() + Math.random()
    })));

    updateFileList();
    updateProcessButton();
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;

    if (selectedFiles.length === 0) {
        fileList.innerHTML = '<p class="no-files">No files selected</p>';
        return;
    }

    fileList.innerHTML = selectedFiles.map(file => `
        <div class="file-item" data-file-id="${file.id}">
            <div class="file-info">
                <i class="fas fa-file-pdf file-icon"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${file.size}</div>
                </div>
            </div>
            <button class="remove-file" onclick="removeFile('${file.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeFile(fileId) {
    selectedFiles = selectedFiles.filter(file => file.id !== fileId);
    updateFileList();
    updateProcessButton();
}

function updateProcessButton() {
    const processBtn = document.getElementById('processBtn');
    if (!processBtn) return;

    if (!currentTool) {
        processBtn.disabled = true;
        return;
    }

    const hasFiles = selectedFiles.length > 0;
    const hasRequiredOptions = currentTool.options ? 
        Object.entries(currentTool.options).every(([key, option]) => 
            !option.required || document.getElementById(key)?.value.trim()
        ) : true;

    processBtn.disabled = !hasFiles || !hasRequiredOptions;
}

// Processing
async function processFiles() {
    if (!currentTool || selectedFiles.length === 0) return;

    const processBtn = document.getElementById('processBtn');
    const statusArea = document.getElementById('statusArea');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');

    // Disable process button
    processBtn.disabled = true;
    processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    // Clear previous status
    statusArea.innerHTML = '';
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';

    try {
        // Create FormData
        const formData = new FormData();
        
        // Add files
        if (currentTool.fieldName === 'files') {
            selectedFiles.forEach(file => {
                formData.append('files', file.file);
            });
        } else {
            formData.append('file', selectedFiles[0].file);
        }

        // Add tool-specific options
        if (currentTool.options) {
            Object.keys(currentTool.options).forEach(key => {
                const element = document.getElementById(key);
                if (element && element.value) {
                    formData.append(key, element.value);
                }
            });
        }

        // Show progress
        progressFill.style.width = '50%';
        progressPercent.textContent = '50%';
        statusArea.innerHTML = '<div class="status-info"><i class="fas fa-cog fa-spin"></i> Processing files...</div>';

        // Make API request
        const response = await fetch(API_BASE_URL + currentTool.apiEndpoint, {
            method: 'POST',
            body: formData
        });

        // Update progress
        progressFill.style.width = '100%';
        progressPercent.textContent = '100%';

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        // Handle response based on content type
        const contentType = response.headers.get('content-type');
        let result;

        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else if (contentType && contentType.includes('application/pdf')) {
            const blob = await response.blob();
            result = {
                type: 'pdf',
                blob: blob,
                filename: getOutputFilename(currentTool.id)
            };
        } else if (contentType && (contentType.includes('image/') || contentType.includes('text/'))) {
            const blob = await response.blob();
            result = {
                type: contentType.includes('image/') ? 'image' : 'text',
                blob: blob,
                filename: getOutputFilename(currentTool.id, contentType)
            };
        } else {
            const text = await response.text();
            result = { text: text };
        }

        // Store result
        processingResults = [result];

        // Show results
        showResults();

    } catch (error) {
        console.error('Processing error:', error);
        statusArea.innerHTML = `
            <div class="status-error">
                <i class="fas fa-exclamation-circle"></i>
                <div>
                    <strong>Processing failed</strong>
                    <p>${error.message}</p>
                </div>
            </div>
        `;
        
        processBtn.disabled = false;
        processBtn.innerHTML = '<i class="fas fa-cogs"></i> Try Again';
    }
}

function getOutputFilename(toolId, contentType = null) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    
    switch (toolId) {
        case 'merge':
            return `merged-${timestamp}.pdf`;
        case 'compress':
            return `compressed-${timestamp}.pdf`;
        case 'split':
        case 'split-ranges':
            return `split-${timestamp}.pdf`;
        case 'pdf-to-images':
            return `converted-${timestamp}.png`;
        case 'pdf-to-text':
            return `extracted-${timestamp}.txt`;
        default:
            if (contentType) {
                const ext = contentType.includes('pdf') ? 'pdf' : 
                           contentType.includes('png') ? 'png' : 
                           contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'txt';
                return `output-${timestamp}.${ext}`;
            }
            return `output-${timestamp}.pdf`;
    }
}

function showResults() {
    const resultsModal = document.getElementById('resultsModal');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const resultsList = document.getElementById('resultsList');

    if (!processingResults || processingResults.length === 0) {
        resultTitle.textContent = 'No Results';
        resultMessage.textContent = 'No files were processed.';
        resultsList.innerHTML = '';
    } else {
        resultTitle.textContent = 'Processing Complete!';
        resultMessage.textContent = `Successfully processed ${processingResults.length} file(s).`;
        
        resultsList.innerHTML = processingResults.map((result, index) => `
            <div class="result-item">
                <div class="file-info">
                    <i class="fas fa-${result.type === 'pdf' ? 'file-pdf' : result.type === 'image' ? 'file-image' : 'file-alt'}"></i>
                    <div>
                        <div class="file-name">${result.filename || `Result ${index + 1}`}</div>
                        <div class="file-size">${result.blob ? formatFileSize(result.blob.size) : 'N/A'}</div>
                    </div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="downloadResult(${index})">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `).join('');
    }

    // Close processing modal and open results modal
    closeModal();
    resultsModal.classList.add('active');
}

function downloadResult(index) {
    const result = processingResults[index];
    if (!result || !result.blob) return;

    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename || 'download.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadAllResults() {
    processingResults.forEach((result, index) => {
        if (result.blob) {
            setTimeout(() => downloadResult(index), index * 100);
        }
    });
}

function processAgain() {
    closeResultsModal();
    setTimeout(() => {
        document.getElementById('processingModal').classList.add('active');
    }, 300);
}

// Modal Management
function closeModal() {
    document.getElementById('processingModal').classList.remove('active');
    resetProcessingState();
}

function closeResultsModal() {
    document.getElementById('resultsModal').classList.remove('active');
}

function resetProcessingState() {
    const processBtn = document.getElementById('processBtn');
    if (processBtn) {
        processBtn.disabled = false;
        processBtn.innerHTML = '<i class="fas fa-cogs"></i> Process Files';
    }

    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    if (progressFill) progressFill.style.width = '0%';
    if (progressPercent) progressPercent.textContent = '0%';

    document.getElementById('statusArea').innerHTML = '';
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function checkServerStatus() {
    try {
        const response = await fetch(API_BASE_URL + '/health');
        if (response.ok) {
            console.log('Server is running');
        } else {
            console.warn('Server health check failed');
        }
    } catch (error) {
        console.error('Cannot connect to server:', error);
    }
}

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}