const puppeteer = require('puppeteer');
const path = require('path');

async function generateBrochurePDF() {
    console.log('Starting Tri-Fold Brochure PDF generation...');
    console.log('Specifications: A4 Landscape, 300 DPI equivalent');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport for high resolution
    await page.setViewport({
        width: 1754,  // A4 landscape at ~150 DPI for screen
        height: 1240,
        deviceScaleFactor: 2  // 2x for higher resolution
    });

    // Load the HTML file
    const htmlPath = path.join(__dirname, 'brochure-trifold.html');
    await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });

    console.log('HTML loaded, generating high-resolution PDF...');

    // Generate PDF with print specifications
    await page.pdf({
        path: path.join(__dirname, 'FitWithDY-TriFold-Brochure.pdf'),
        width: '297mm',
        height: '210mm',
        printBackground: true,
        margin: {
            top: '0',
            right: '0',
            bottom: '0',
            left: '0'
        },
        preferCSSPageSize: true,
        scale: 1
    });

    await browser.close();
    console.log('\n✅ PDF generated successfully!');
    console.log('📄 File: FitWithDY-TriFold-Brochure.pdf');
    console.log('📐 Size: A4 Landscape (297mm x 210mm)');
    console.log('📏 Layout: 3 panels per side (99mm each)');
    console.log('\n🖨️  PRINTING INSTRUCTIONS:');
    console.log('   1. Print Page 1 (Outside panels)');
    console.log('   2. Flip paper and print Page 2 (Inside panels)');
    console.log('   3. Fold into thirds');
    console.log('   4. Front cover should face outward\n');
}

generateBrochurePDF().catch(console.error);
