const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Increased to support larger JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Fitness App Backend is Running');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const logRoutes = require('./routes/logRoutes');
const settingRoutes = require('./routes/settingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const coachingRoutes = require('./routes/coachingRoutes');
const adminRoutes = require('./routes/adminRoutes');
// NEW Coaching Module
const foodRoutes = require('./routes/foodRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const supplementRoutes = require('./routes/supplementRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/foods', foodRoutes); // Food Library
app.use('/api/exercises', exerciseRoutes); // Workout Library
app.use('/api/supplements', supplementRoutes); // Supplement Library
app.use('/api/admin', adminRoutes);


// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export app for testing
module.exports = app;
