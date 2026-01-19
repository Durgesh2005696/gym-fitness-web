const prisma = require('../utils/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const generateToken = (id, loginToken) => {
    return jwt.sign({ id, loginToken }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'CLIENT',
                isActive: false,
            },
        });

        if (role === 'TRAINER') {
            await prisma.trainerProfile.create({
                data: { userId: user.id },
            });
        } else if (role === 'CLIENT') {
            await prisma.clientProfile.create({
                data: { userId: user.id },
            });
        }

        // Auto-login logic (optional), or just return success
        // Let's return success and make them login to set the token properly
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: null, // Force login to get token
            message: "Registration successful. Please login."
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {

            // One-device login: generate new loginToken
            const loginToken = uuidv4();
            await prisma.user.update({
                where: { id: user.id },
                data: { loginToken },
            });

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                token: generateToken(user.id, loginToken),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
            trainerProfile: true,
            clientProfile: true
        }
    });
    if (user) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            profile: user.trainerProfile || user.clientProfile
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
