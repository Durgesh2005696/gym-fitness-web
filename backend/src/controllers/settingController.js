const prisma = require('../utils/prismaClient');

/**
 * @desc    Get All Settings (Prices, Duration, QR)
 * @route   GET /api/settings
 * @access  Private
 */
exports.getSettings = async (req, res) => {
    try {
        let settings = await prisma.systemSetting.findFirst();

        // If no settings exist, create default
        if (!settings) {
            settings = await prisma.systemSetting.create({
                data: {
                    id: 'global',
                    clientPrice: 6000,
                    trainerPrice: 659,
                    subscriptionDuration: 30,
                    qrCode: '/payment-qr.jpg'
                }
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

/**
 * @desc    Update All Settings
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
exports.updateSettings = async (req, res) => {
    const { clientPrice, trainerPrice, subscriptionDuration, qrCode } = req.body;

    try {
        const updateData = {};
        if (clientPrice !== undefined) updateData.clientPrice = parseFloat(clientPrice);
        if (trainerPrice !== undefined) updateData.trainerPrice = parseFloat(trainerPrice);
        if (subscriptionDuration !== undefined) updateData.subscriptionDuration = parseInt(subscriptionDuration);
        if (qrCode !== undefined) updateData.qrCode = qrCode;

        const settings = await prisma.systemSetting.upsert({
            where: { id: 'global' },
            update: updateData,
            create: {
                id: 'global',
                ...updateData
            }
        });

        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating settings' });
    }
};

// Legacy support if needed for current frontend calls (though better to update frontend)
exports.getQRCode = async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findFirst() || { qrCode: '' };
        res.json({ qrCodeUrl: settings.qrCode });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};

exports.updateQRCode = async (req, res) => {
    try {
        const { qrCodeUrl } = req.body;
        const settings = await prisma.systemSetting.upsert({
            where: { id: 'global' },
            update: { qrCode: qrCodeUrl },
            create: { id: 'global', qrCode: qrCodeUrl }
        });
        res.json({ message: 'Success', qrCodeUrl: settings.qrCode });
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};
