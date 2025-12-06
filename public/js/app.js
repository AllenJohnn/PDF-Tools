document.addEventListener("DOMContentLoaded", function() {
    const toolsGrid = document.getElementById("toolsGrid");
    const toolModal = document.getElementById("toolModal");
    const modalTitle = document.getElementById("modalTitle");
    const fileInput = document.getElementById("fileInput");
    const fileList = document.getElementById("fileList");
    const processBtn = document.getElementById("processBtn");
    const progressFill = document.getElementById("progressFill");

    let currentTool = "";
    let selectedFiles = [];

    // Define the tools
    const tools = [
        { id: "merge", icon: "🔄", title: "Merge PDFs", description: "Combine multiple PDF files into one" },
        { id: "split", icon: "✂️", title: "Split PDF", description: "Split a PDF into multiple files" },
        { id: "compress", icon: "📦", title: "Compress PDF", description: "Reduce PDF file size" },
        { id: "convert", icon: "🔄", title: "Convert PDF", description: "Convert to/from other formats" }
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
                <button class="upload-btn" data-tool="${tool.id}" data-title="${tool.title}">
                    Select
                </button>
            `;
            toolsGrid.appendChild(toolCard);
        });
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
    }

    // Close modal
    function closeModal() {
        toolModal.style.display = "none";
        selectedFiles = [];
        fileList.innerHTML = "";
    }

    // Handle tool selection
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("upload-btn") && e.target.dataset.tool) {
            openTool(e.target.dataset.tool, e.target.dataset.title);
        }
    });

    // Handle file input
    fileInput.addEventListener("change", function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            selectedFiles = files;
            fileList.innerHTML = "";
            files.forEach((file, index) => {
                const fileItem = document.createElement("div");
                fileItem.className = "file-item";
                fileItem.innerHTML = `
                    <span>${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                    <button class="remove-file" data-index="${index}">❌</button>
                `;
                fileList.appendChild(fileItem);
            });
            processBtn.disabled = false;
        }
    });

    // Remove file
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("remove-file")) {
            const index = parseInt(e.target.dataset.index);
            selectedFiles.splice(index, 1);
            fileList.innerHTML = "";
            selectedFiles.forEach((file, i) => {
                const fileItem = document.createElement("div");
                fileItem.className = "file-item";
                fileItem.innerHTML = `
                    <span>${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                    <button class="remove-file" data-index="${i}">❌</button>
                `;
                fileList.appendChild(fileItem);
            });
            processBtn.disabled = selectedFiles.length > 0;
        }
    });

    // Process button click
    processBtn.addEventListener("click", function() {
        if (selectedFiles.length === 0) return;
        
        processBtn.disabled = true;
        progressFill.style.width = "50%";
        
        // Simulate processing
        setTimeout(() => {
            progressFill.style.width = "100%";
            alert(`Processing ${selectedFiles.length} file(s) with ${currentTool} tool!\n\nNote: Backend integration needed for actual PDF processing.`);
            setTimeout(() => {
                closeModal();
                progressFill.style.width = "0%";
            }, 1000);
        }, 1500);
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
    console.log("PDF Processor UI loaded!");
});