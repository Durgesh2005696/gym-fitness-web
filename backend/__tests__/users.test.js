const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/utils/prismaClient');
const {
    clearDatabase,
    createTestAdmin,
    createTestClient,
    createTestTrainer,
    createActiveClient,
} = require('../utils/testHelpers');

describe('User Management API Tests', () => {
    let adminToken;
    let clientToken;
    let trainerToken;

    beforeAll(async () => {
        await clearDatabase();

        // Create test users
        await createTestAdmin();
        await createTestClient();
        await createTestTrainer();

        // Login to get tokens
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'admin123' });
        adminToken = adminLogin.body.token;

        const clientLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'client@test.com', password: 'client123' });
        clientToken = clientLogin.body.token;

        const trainerLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'trainer@test.com', password: 'trainer123' });
        trainerToken = trainerLogin.body.token;
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    describe('GET /api/users', () => {
        it('should get all users as admin', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should not get users as non-admin', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Not authorized as an admin');
        });
    });

    describe('GET /api/users/clients', () => {
        it('should get all clients as admin', async () => {
            const res = await request(app)
                .get('/api/users/clients')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/users/trainers', () => {
        it('should get all trainers as admin', async () => {
            const res = await request(app)
                .get('/api/users/trainers')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.some(t => t.role === 'TRAINER')).toBe(true);
        });
    });

    describe('PUT /api/users/toggle-status', () => {
        it('should toggle user status as admin', async () => {
            const client = await prisma.user.findUnique({
                where: { email: 'client@test.com' },
            });

            const res = await request(app)
                .put('/api/users/toggle-status')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    userId: client.id,
                    isActive: true,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.isActive).toBe(true);
        });

        it('should not toggle status as non-admin', async () => {
            const client = await prisma.user.findUnique({
                where: { email: 'client@test.com' },
            });

            const res = await request(app)
                .put('/api/users/toggle-status')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    userId: client.id,
                    isActive: false,
                });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/users/assign-trainer', () => {
        it('should assign trainer to client as admin', async () => {
            const trainer = await prisma.user.findUnique({
                where: { email: 'trainer@test.com' },
            });

            const res = await request(app)
                .put('/api/users/assign-trainer')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    clientEmail: 'client@test.com',
                    trainerId: trainer.id,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.trainerId).toBe(trainer.id);
        });

        it('should not assign trainer with invalid client email', async () => {
            const trainer = await prisma.user.findUnique({
                where: { email: 'trainer@test.com' },
            });

            const res = await request(app)
                .put('/api/users/assign-trainer')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    clientEmail: 'nonexistent@test.com',
                    trainerId: trainer.id,
                });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Client not found');
        });
    });

    describe('PUT /api/users/renew-subscription', () => {
        it('should renew subscription as admin', async () => {
            const client = await prisma.user.findUnique({
                where: { email: 'client@test.com' },
            });

            const res = await request(app)
                .put('/api/users/renew-subscription')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    userId: client.id,
                    days: 30,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.isActive).toBe(true);
            expect(res.body.subscriptionExpiresAt).toBeTruthy();
        });
    });

    describe('PUT /api/users/questionnaire', () => {
        it('should update questionnaire as client', async () => {
            const res = await request(app)
                .put('/api/users/questionnaire')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    age: 28,
                    height: 175,
                    currentWeight: 72,
                    dietType: 'VEG',
                    lactoseIntolerant: false,
                    workoutTime: 'MORNING',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.isQuestionnaireFilled).toBe(true);
            expect(res.body.age).toBe(28);
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete user as admin', async () => {
            // Create a user to delete
            const userToDelete = await prisma.user.create({
                data: {
                    name: 'Delete Me',
                    email: 'deleteme@test.com',
                    password: 'password123',
                    role: 'CLIENT',
                },
            });

            await prisma.clientProfile.create({
                data: { userId: userToDelete.id },
            });

            const res = await request(app)
                .delete(`/api/users/${userToDelete.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('User deleted successfully');

            // Verify user is deleted
            const deletedUser = await prisma.user.findUnique({
                where: { id: userToDelete.id },
            });
            expect(deletedUser).toBeNull();
        });

        it('should not delete admin user', async () => {
            const admin = await prisma.user.findUnique({
                where: { email: 'admin@test.com' },
            });

            const res = await request(app)
                .delete(`/api/users/${admin.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Admin cannot be deleted');
        });

        it('should not delete user as non-admin', async () => {
            const client = await prisma.user.findUnique({
                where: { email: 'client@test.com' },
            });

            const res = await request(app)
                .delete(`/api/users/${client.id}`)
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(403);
        });
    });
});
