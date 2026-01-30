const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF() {
    console.log('Starting PDF generation...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Load the HTML file
    const htmlPath = path.join(__dirname, 'user-manual.html');
    await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });

    console.log('HTML loaded, generating PDF...');

    // Generate PDF
    await page.pdf({
        path: path.join(__dirname, 'FitWithDY-UserManual.pdf'),
        format: 'A4',
        printBackground: true,
        margin: {
            top: '0',
            right: '0',
            bottom: '0',
            left: '0'
        },
        preferCSSPageSize: true
    });

    await browser.close();
    console.log('PDF generated successfully: FitWithDY-UserManual.pdf');
}

generatePDF().catch(console.error);
