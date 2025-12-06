document.addEventListener("DOMContentLoaded", function() {
    const toolsGrid = document.getElementById("toolsGrid");
    const toolModal = document.getElementById("toolModal");
    const modalTitle = document.getElementById("modalTitle");
    const fileInput = document.getElementById("fileInput");
    const fileList = document.getElementById("fileList");
    const processBtn = document.getElementById("processBtn");
    const progressFill = document.getElementById("progressFill");
    const statusMessage = document.getElementById("statusMessage");
    const uploadArea = document.getElementById("uploadArea");

    let currentTool = "";
    let selectedFiles = [];
    const BACKEND_URL = "http://localhost:5000/api/pdf";

    // Define the tools
    const tools = [
        { 
            id: "merge", 
            icon: "🔄", 
            title: "Merge PDFs", 
            description: "Combine multiple PDF files into one",
            endpoint: "/merge"
        },
        { 
            id: "split", 
            icon: "✂️", 
            title: "Split PDF", 
            description: "Split a PDF into multiple files",
            endpoint: null
        },
        { 
            id: "compress", 
            icon: "📦", 
            title: "Compress PDF", 
            description: "Reduce PDF file size",
            endpoint: null
        },
        { 
            id: "convert", 
            icon: "🔄", 
            title: "Convert PDF", 
            description: "Convert to/from other formats",
            endpoint: null
        }
    ];

    // Load tools into the grid
    function loadTools() {
        toolsGrid.innerHTML = "";
        tools.forEach(tool => {
            const toolCard = document.createElement("div");
            toolCard.className = "tool-card";
            toolCard.innerHTML = `
                <div class="tool-icon">${tool.icon}</div>
                <h3>${tool.title}</h3>
                <p>${tool.description}</p>
                <button class="tool-btn" data-tool="${tool.id}" data-title="${tool.title}">
                    <i class="fas fa-play"></i> Select Tool
                </button>
            `;
            toolsGrid.appendChild(toolCard);
        });
    }

    // Show status message
    function showStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${isError ? 'status-error' : 'status-success'}`;
        statusMessage.style.display = 'block';
        
        if (!isError) {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
    }

    // Open tool modal
    function openTool(toolId, toolTitle) {
        currentTool = toolId;
        modalTitle.textContent = toolTitle;
        toolModal.style.display = "block";
        selectedFiles = [];
        fileList.innerHTML = "";
        processBtn.disabled = true;
        progressFill.style.width = "0%";
        statusMessage.style.display = "none";
        
        const tool = tools.find(t => t.id === toolId);
        if (!tool.endpoint) {
            showStatus(`⚠️ ${toolTitle} feature is coming soon! Currently only Merge PDFs is available.`, true);
        }
    }

    // Close modal
    function closeModal() {
        toolModal.style.display = "none";
        selectedFiles = [];
        fileList.innerHTML = "";
        statusMessage.style.display = "none";
    }

    // Handle tool selection
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("tool-btn") && e.target.dataset.tool) {
            openTool(e.target.dataset.tool, e.target.dataset.title);
        }
    });

    // Handle drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        );
        
        if (files.length > 0) {
            handleFiles(files);
        } else {
            showStatus('❌ Only PDF files are allowed!', true);
        }
    });

    // Handle file input
    fileInput.addEventListener("change", function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleFiles(files);
        }
    });

    // Handle files
    function handleFiles(files) {
        selectedFiles = files;
        fileList.innerHTML = "";
        
        files.forEach((file, index) => {
            const fileItem = document.createElement("div");
            fileItem.className = "file-item";
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-pdf file-icon"></i>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
        
        processBtn.disabled = false;
        showStatus(`✅ ${files.length} PDF file(s) selected`, false);
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Remove file
    document.addEventListener("click", function(e) {
        if (e.target.closest(".remove-file")) {
            const index = parseInt(e.target.closest(".remove-file").dataset.index);
            selectedFiles.splice(index, 1);
            fileList.innerHTML = "";
            
            selectedFiles.forEach((file, i) => {
                const fileItem = document.createElement("div");
                fileItem.className = "file-item";
                fileItem.innerHTML = `
                    <div class="file-info">
                        <i class="fas fa-file-pdf file-icon"></i>
                        <div>
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <button class="remove-file" data-index="${i}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                fileList.appendChild(fileItem);
            });
            
            processBtn.disabled = selectedFiles.length === 0;
            
            if (selectedFiles.length === 0) {
                showStatus('No files selected', true);
            } else {
                showStatus(`✅ ${selectedFiles.length} PDF file(s) selected`, false);
            }
        }
    });

    // Process button click
    processBtn.addEventListener("click", async function() {
        if (selectedFiles.length === 0) return;
        
        const tool = tools.find(t => t.id === currentTool);
        
        if (!tool.endpoint) {
            showStatus(`⚠️ ${tool.title} feature is coming soon!`, true);
            return;
        }
        
        processBtn.disabled = true;
        progressFill.style.width = "30%";
        showStatus("📤 Uploading files to server...", false);
        
        try {
            // Create FormData
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('pdfs', file);
            });
            
            progressFill.style.width = "60%";
            showStatus("🔄 Processing files...", false);
            
            // Send to backend
            const response = await fetch(`${BACKEND_URL}${tool.endpoint}`, {
                method: 'POST',
                body: formData
            });
            
            progressFill.style.width = "90%";
            
            if (!response.ok) {
                let errorText = 'Unknown error';
                try {
                    errorText = await response.text();
                } catch (e) {
                    errorText = response.statusText;
                }
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }
            
            // Get the merged PDF
            const blob = await response.blob();
            
            // Check if blob is valid
            if (blob.size === 0) {
                throw new Error('Server returned empty file');
            }
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `merged_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            progressFill.style.width = "100%";
            showStatus("✅ Processing complete! Download started.", false);
            
            // Reset after 2 seconds
            setTimeout(() => {
                closeModal();
                progressFill.style.width = "0%";
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            progressFill.style.width = "0%";
            processBtn.disabled = false;
            showStatus(`❌ Error: ${error.message}`, true);
        }
    });

    // Close modal when clicking outside
    toolModal.addEventListener("click", function(e) {
        if (e.target === toolModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && toolModal.style.display === "block") {
            closeModal();
        }
    });

    // Make functions globally available for HTML onclick
    window.openTool = openTool;
    window.closeModal = closeModal;

    // Initialize
    loadTools();
    console.log("✅ PDF Processor UI loaded!");
    console.log(`📡 Backend URL: ${BACKEND_URL}`);
    console.log(`🔗 Merge endpoint: ${BACKEND_URL}/merge`);
});