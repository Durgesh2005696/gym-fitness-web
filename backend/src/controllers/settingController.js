const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../data/settings.json');

// Helper to read settings
const readSettings = () => {
    if (!fs.existsSync(settingsPath)) {
        // Ensure directory exists
        const dir = path.dirname(settingsPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        // Create default
        const defaultSettings = { qrCodeUrl: '' };
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings));
        return defaultSettings;
    }
    return JSON.parse(fs.readFileSync(settingsPath));
};

// Helper to write settings
const writeSettings = (data) => {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
};

exports.getQRCode = async (req, res) => {
    try {
        const settings = readSettings();
        res.json({ qrCodeUrl: settings.qrCodeUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching QR code' });
    }
};

exports.updateQRCode = async (req, res) => {
    try {
        const { qrCodeUrl } = req.body; // Expecting a URL string (or Base64)
        if (!qrCodeUrl) {
            return res.status(400).json({ message: 'QR Code URL is required' });
        }

        const settings = readSettings();
        settings.qrCodeUrl = qrCodeUrl;
        writeSettings(settings);

        res.json({ message: 'QR Code updated successfully', qrCodeUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error updating QR code' });
    }
};
