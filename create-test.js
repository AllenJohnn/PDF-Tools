const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

async function createSimplePDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Add a page
  const page = pdfDoc.addPage([600, 400]);
  
  // Draw some text
  page.drawText("Test PDF for PDF Processor", {
    x: 50,
    y: 350,
    size: 24,
    font: font,
    color: rgb(0, 0, 0.8),
  });
  
  page.drawText("This is a test document created for testing the PDF Processor application.", {
    x: 50,
    y: 300,
    size: 14,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText("You can use this PDF to test:", {
    x: 50,
    y: 250,
    size: 14,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  const features = [
    "✓ Merge multiple PDFs",
    "✓ Split PDF into multiple files", 
    "✓ Compress PDF size",
    "✓ Get PDF information"
  ];
  
  let y = 220;
  features.forEach(feature => {
    page.drawText(feature, {
      x: 70,
      y: y,
      size: 12,
      font: font,
      color: rgb(0, 0.5, 0),
    });
    y -= 25;
  });
  
  page.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: 50,
    y: 100,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  require("fs").writeFileSync("test.pdf", pdfBytes);
  console.log("✅ Test PDF created: test.pdf");
  console.log("📄 Size: " + (pdfBytes.length / 1024).toFixed(2) + " KB");
}

createSimplePDF().catch(console.error);
