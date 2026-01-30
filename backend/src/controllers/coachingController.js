const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get full client details for trainer (or client viewing themselves)
// @route   GET /api/coaching/client/:clientId
// @access  Private (Trainer/Admin or Self) - Protected by verifyClientOwnership middleware
const getClientDetails = async (req, res) => {
    try {
        const { clientId } = req.params;
        const callerRole = req.user.role;
        const callerId = req.user.id;

        // Use clientProfile from middleware (set by verifyClientOwnership)
        let clientProfile = req.clientProfile;

        // Fallback if middleware didn't set it (shouldn't happen, but defense-in-depth)
        if (!clientProfile) {
            clientProfile = await prisma.clientProfile.findUnique({
                where: { userId: clientId },
                include: { user: true, trainer: true }
            });
        }

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        // DEFENSE-IN-DEPTH: Re-validate ownership at controller level
        if (callerRole === 'TRAINER' && clientProfile.trainerId !== callerId) {
            console.warn(`SECURITY: Trainer ${callerId} bypassed middleware for Client ${clientId}`);
            return res.status(403).json({ message: 'Access denied' });
        }
        if (callerRole === 'CLIENT' && clientProfile.userId !== callerId) {
            console.warn(`SECURITY: Client ${callerId} tried to access Client ${clientId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const profileId = clientProfile.id;

        // Fetch related data
        const [activities, feedbacks, progress, photos, plans] = await Promise.all([
            prisma.dailyActivity.findMany({
                where: { clientProfileId: profileId },
                orderBy: { date: 'desc' },
                take: 30 // Last 30 days
            }),
            prisma.dailyFeedback.findMany({
                where: { clientProfileId: profileId },
                orderBy: { submittedAt: 'desc' },
                take: 30
            }),
            prisma.clientProgress.findMany({
                where: { clientProfileId: profileId },
                orderBy: { recordedAt: 'desc' }
            }),
            prisma.progressPhoto.findMany({
                where: { clientProfileId: profileId },
                orderBy: { uploadedAt: 'desc' }
            }),
            prisma.plan.findMany({
                where: { clientProfileId: profileId }
            })
        ]);

        res.json({
            profile: clientProfile,
            activities,
            feedbacks,
            progress,
            photos,
            plans
        });

    } catch (error) {
        console.error('Error fetching client details:', error.message);
        console.error('Error stack:', error.stack);
        console.error('clientId:', req.params.clientId);
        console.error('req.clientProfile:', req.clientProfile);
        res.status(500).json({ message: 'Server error fetching client details', error: error.message });
    }
};

// @desc    Update Daily Activity (Water, Workout, Meals)
// @route   POST /api/coaching/activity
// @access  Private (Client)
const updateDailyActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { waterIntake, workoutCompleted, mealsCompleted, date } = req.body;

        const clientProfile = await prisma.clientProfile.findUnique({ where: { userId } });
        if (!clientProfile) return res.status(404).json({ message: 'Client profile not found' });

        // Check if entry exists for today (or passed date)
        // For simplicity, we assume date is passed as ISO string YYYY-MM-DD
        // Prisma DateTime is specific, so we might need range or just day check. 
        // A simple way is to delete/re-create or findFirst.

        // We will just create a new one or update the latest one for "today"
        // Better: Use `upsert` logic if we had a unique constraint on date+client.
        // For now, we'll Create New if none exists for this "date", or Update latest.

        // Find activity for this date (approx)
        const targetDate = new Date(date || Date.now());
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const existing = await prisma.dailyActivity.findFirst({
            where: {
                clientProfileId: clientProfile.id,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        let activity;
        if (existing) {
            activity = await prisma.dailyActivity.update({
                where: { id: existing.id },
                data: {
                    waterIntake: waterIntake !== undefined ? waterIntake : existing.waterIntake,
                    workoutCompleted: workoutCompleted !== undefined ? workoutCompleted : existing.workoutCompleted,
                    mealsCompleted: mealsCompleted !== undefined ? mealsCompleted : existing.mealsCompleted
                }
            });
        } else {
            activity = await prisma.dailyActivity.create({
                data: {
                    clientProfileId: clientProfile.id,
                    waterIntake: waterIntake || 0,
                    workoutCompleted: workoutCompleted || false,
                    mealsCompleted: mealsCompleted || 0,
                    date: startOfDay // normalize to start of day
                }
            });
        }

        res.json(activity);
    } catch (error) {
        console.error('Error in daily activity:', error);
        res.status(500).json({ message: 'Server error updating activity' });
    }
};

// @desc    Submit Daily Feedback
// @route   POST /api/coaching/feedback
// @access  Private (Client)
const submitDailyFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { energyLevel, sleepQuality, motivation, soreness, notes } = req.body;

        const clientProfile = await prisma.clientProfile.findUnique({ where: { userId } });
        if (!clientProfile) return res.status(404).json({ message: 'Client profile not found' });

        const feedback = await prisma.dailyFeedback.create({
            data: {
                clientProfileId: clientProfile.id,
                energyLevel: parseInt(energyLevel) || 5,
                sleepQuality: parseInt(sleepQuality) || 5,
                motivation: parseInt(motivation) || 5,
                soreness: parseInt(soreness) || 5,
                notes
            }
        });

        res.status(201).json(feedback);
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Server error submitting feedback' });
    }
};

// @desc    Add Progress Record (Weight/Measurements)
// @route   POST /api/coaching/progress
// @access  Private (Client/Trainer) - Protected by verifyClientOwnership middleware
const addProgressRecord = async (req, res) => {
    try {
        const { clientId, weight, bodyFat, chest, waist, hips, arms, thighs, trainerNotes } = req.body;
        const callerRole = req.user.role;
        const callerId = req.user.id;

        let targetProfileId;

        if (callerRole === 'ADMIN' || callerRole === 'TRAINER') {
            // Trainer/Admin accessing a client
            if (!clientId) {
                return res.status(400).json({ message: "Client ID required for trainers" });
            }

            // Use middleware-provided clientProfile if available
            let clientProfile = req.clientProfile;
            if (!clientProfile) {
                const clientUser = await prisma.user.findUnique({
                    where: { id: clientId },
                    include: { clientProfile: true }
                });
                if (!clientUser || !clientUser.clientProfile) {
                    return res.status(404).json({ message: "Client profile not found" });
                }
                clientProfile = clientUser.clientProfile;
            }

            // DEFENSE-IN-DEPTH: Re-validate trainer ownership
            if (callerRole === 'TRAINER' && clientProfile.trainerId !== callerId) {
                console.warn(`SECURITY: Trainer ${callerId} attempted progress update for Client ${clientId}`);
                return res.status(403).json({ message: 'Access denied. This client is not assigned to you.' });
            }

            targetProfileId = clientProfile.id;
        } else {
            // Client accessing themselves (no clientId needed, use their own profile)
            const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: callerId } });
            if (!clientProfile) {
                return res.status(404).json({ message: "Profile not found" });
            }
            targetProfileId = clientProfile.id;
        }

        const progress = await prisma.clientProgress.create({
            data: {
                clientProfileId: targetProfileId,
                weight: parseFloat(weight) || undefined,
                bodyFat: parseFloat(bodyFat) || undefined,
                chest: parseFloat(chest) || undefined,
                waist: parseFloat(waist) || undefined,
                hips: parseFloat(hips) || undefined,
                arms: parseFloat(arms) || undefined,
                thighs: parseFloat(thighs) || undefined,
                trainerNotes: (callerRole === 'TRAINER' || callerRole === 'ADMIN') ? trainerNotes : undefined
            }
        });

        // Also update the ClientProfile current stats for quick access
        if (weight) {
            await prisma.clientProfile.update({
                where: { id: targetProfileId },
                data: { currentWeight: parseFloat(weight) }
            });
        }

        res.status(201).json(progress);

    } catch (error) {
        console.error('Error adding progress:', error);
        res.status(500).json({ message: 'Server error adding progress' });
    }
};

// @desc    Upload Progress Photo
// @route   POST /api/coaching/photos
// @access  Private (Client)
const uploadProgressPhoto = async (req, res) => {
    try {
        // We assume multer middleware has processed the file and it's available in req.file
        // OR the client sends a Base64 string for simplicity in this prototype.
        // Let's support Base64 string in body for easiest implementation without S3/Multer setup if possible,
        // BUT schema says 'photoUrl'.
        // If 'photoUrl' is passed (e.g. from frontend handling upload to a cloud), use it.
        // If req.file is present, use that path (local).

        const userId = req.user.id;
        const { photoType, photoUrl: bodyUrl } = req.body; // FRONT, SIDE, BACK

        let finalPhotoUrl = bodyUrl;

        if (req.file) {
            // If using local storage via multer
            finalPhotoUrl = `/uploads/${req.file.filename}`;
        }

        if (!finalPhotoUrl) {
            return res.status(400).json({ message: 'No photo provided' });
        }

        const clientProfile = await prisma.clientProfile.findUnique({ where: { userId } });

        const photo = await prisma.progressPhoto.create({
            data: {
                clientProfileId: clientProfile.id,
                photoUrl: finalPhotoUrl,
                photoType: photoType || 'FRONT',
                uploadedAt: new Date()
            }
        });

        res.status(201).json(photo);

    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ message: 'Server error uploading photo' });
    }
};

// @desc    Add client to trainer's roster by email (initiates payment flow)
// @route   POST /api/coaching/add-client
// @access  Private (Active Trainer only)
const addClientByEmail = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const trainerRole = req.user.role;
        const { clientEmail } = req.body;

        // Ensure caller is a trainer or admin
        if (trainerRole !== 'TRAINER' && trainerRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Only trainers can add clients' });
        }

        // For trainers, validate account is ACTIVE
        if (trainerRole === 'TRAINER' && req.user.accountStatus !== 'ACTIVE') {
            return res.status(403).json({
                message: 'Your trainer account is not active. Complete payment first.',
                code: 'TRAINER_INACTIVE',
                accountStatus: req.user.accountStatus
            });
        }

        // Validate email provided
        if (!clientEmail || !clientEmail.trim()) {
            return res.status(400).json({ message: 'Client email is required' });
        }

        // Find client user by email
        const clientUser = await prisma.user.findUnique({
            where: { email: clientEmail.trim().toLowerCase() },
            include: { clientProfile: true }
        });

        if (!clientUser) {
            return res.status(404).json({ message: 'No user found with that email address' });
        }

        // Check user is a CLIENT
        if (clientUser.role !== 'CLIENT') {
            return res.status(400).json({ message: 'That user is not a client' });
        }

        // Check if client already has a trainer assigned
        if (clientUser.clientProfile?.trainerId) {
            if (clientUser.clientProfile.trainerId === trainerId) {
                return res.status(400).json({ message: 'This client is already assigned to you' });
            }
            return res.status(400).json({
                message: 'This client is already assigned to another trainer. Contact admin to reassign.'
            });
        }

        // Create or update client profile with trainer assignment
        let updatedProfile;
        if (!clientUser.clientProfile) {
            // Create profile if doesn't exist
            updatedProfile = await prisma.clientProfile.create({
                data: {
                    userId: clientUser.id,
                    trainerId: trainerId,
                    activationStatus: 'UNASSIGNED' // Payment required
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });
        } else {
            // Update existing profile
            updatedProfile = await prisma.clientProfile.update({
                where: { userId: clientUser.id },
                data: {
                    trainerId: trainerId,
                    activationStatus: 'UNASSIGNED' // Payment required
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });
        }

        res.status(200).json({
            message: 'Client linked! They must now complete payment to activate coaching.',
            client: {
                id: clientUser.id,
                name: clientUser.name,
                email: clientUser.email,
                activationStatus: 'UNASSIGNED',
                profile: updatedProfile
            }
        });

    } catch (error) {
        console.error('Error adding client:', error);
        res.status(500).json({ message: 'Server error adding client' });
    }
};

const updateBodyStats = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { pastWeight, currentWeight, targetWeight, bodyFat } = req.body;

        // Verify trainer access
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: clientId },
            include: { trainer: true }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client not found' });
        }

        if (clientProfile.trainerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this client' });
        }

        const updatedProfile = await prisma.clientProfile.update({
            where: { id: clientProfile.id },
            data: {
                pastWeight: pastWeight !== undefined && pastWeight !== '' ? parseFloat(pastWeight) : undefined,
                currentWeight: currentWeight !== undefined && currentWeight !== '' ? parseFloat(currentWeight) : undefined,
                targetWeight: targetWeight !== undefined && targetWeight !== '' ? parseFloat(targetWeight) : undefined,
                bodyFat: bodyFat !== undefined && bodyFat !== '' ? parseFloat(bodyFat) : undefined,
                lastBodyStatsUpdate: new Date()
            }
        });

        // Also add a history record for tracking if weight changed
        if (currentWeight !== undefined || bodyFat !== undefined) {
            await prisma.clientProgress.create({
                data: {
                    clientProfileId: clientProfile.id,
                    weight: currentWeight !== undefined && currentWeight !== '' ? parseFloat(currentWeight) : undefined,
                    bodyFat: bodyFat !== undefined && bodyFat !== '' ? parseFloat(bodyFat) : undefined,
                    recordedAt: new Date()
                }
            });
        }

        res.json({ message: 'Body stats updated', stats: updatedProfile });

    } catch (error) {
        console.error('Error updating body stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const removeClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const trainerId = req.user.id;

        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: clientId }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client not found' });
        }

        if (clientProfile.trainerId !== trainerId) {
            return res.status(403).json({ message: 'Not authorized to remove this client' });
        }

        await prisma.clientProfile.update({
            where: { id: clientProfile.id },
            data: { trainerId: null }
        });

        res.json({ message: 'Client removed successfully' });
    } catch (error) {
        console.error('Error removing client:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getClientDetails,
    updateDailyActivity,
    submitDailyFeedback,
    addProgressRecord,
    uploadProgressPhoto,
    addClientByEmail,
    updateBodyStats,
    removeClient
};
