const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    loginToken: true
                }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check Single Device Login
            // NOTE: We need to figure out how to compare tokens.
            // If we stored loginToken in DB, we should check if the user has a valid loginToken.
            // But wait, the JWT was signed BEFORE we knew the new loginToken? No, on login we generated token.
            // But we didn't put loginToken IN the JWT in my previous step.
            // So ANY valid JWT for that user ID will pass the verify step.
            // The "One-device" restrict comes from:
            // 1. User logs in Device A -> DB has Token A.
            // 2. User logs in Device B -> DB has Token B.
            // 3. Device A sends request. JWT is valid.
            // WE MUST CHECK if Device A is "current".
            // PROBLEM: How does Device A know it holds Token A?
            // Options:
            // a) Put loginToken IN the JWT payload.
            // b) Client sends loginToken in headers separately? No.
            // c) Just use JWT. If we rotate JWT secret, all invalid. But we want per-user.

            // FIX in Controller:
            // When generating JWT, include the `loginToken` in the payload!
            // I need to update authController.js to include loginToken in JWT.
            // Then here in Middleware, we compare decoded.loginToken === req.user.loginToken.

            // Let's implement checking against DB.
            // But wait, if I didn't put it in JWT, I can't compare.
            // So I will update middleware to just check if user exists for now, 
            // AND I will update authController.js to include it, and then update this middleware.

            // Actually, I can fix authMiddleware.js now to EXPECT it, and then fix authController.js.
            // Or I can rewrite authController.js in the next step.

            // Let's assume the JWT payload HAS 'loginToken'.
            if (decoded.loginToken !== req.user.loginToken) {
                return res.status(401).json({ message: 'Session expired. Logged in on another device.' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

exports.trainer = (req, res, next) => {
    if (req.user && (req.user.role === 'TRAINER' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a trainer' });
    }
};
