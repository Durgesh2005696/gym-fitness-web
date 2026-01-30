const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF() {
    console.log('Starting Quick Guide PDF generation...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Load the HTML file
    const htmlPath = path.join(__dirname, 'quick-user-guide.html');
    await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });

    console.log('HTML loaded, generating PDF...');

    // Generate PDF
    await page.pdf({
        path: path.join(__dirname, 'FitWithDY-QuickGuide.pdf'),
        format: 'A4',
        printBackground: true,
        margin: {
            top: '15mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm'
        }
    });

    await browser.close();
    console.log('PDF generated successfully: FitWithDY-QuickGuide.pdf');
}

generatePDF().catch(console.error);
