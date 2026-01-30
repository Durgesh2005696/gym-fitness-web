const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/utils/prismaClient');
const { clearDatabase, createTestAdmin, createActiveClient, createTestTrainer } = require('../utils/testHelpers');

describe('Plans and Logs API Tests', () => {
    let adminToken;
    let clientToken;
    let trainerToken;
    let clientUser;
    let clientProfile;

    beforeAll(async () => {
        await clearDatabase();

        await createTestAdmin();
        clientUser = await createActiveClient();
        await createTestTrainer();

        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'admin123' });
        adminToken = adminLogin.body.token;

        const clientLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'activeclient@test.com', password: 'activeclient123' });
        clientToken = clientLogin.body.token;

        const trainerLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'trainer@test.com', password: 'trainer123' });
        trainerToken = trainerLogin.body.token;

        clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: clientUser.id },
        });
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    describe('POST /api/plans', () => {
        it('should create diet plan for client as trainer', async () => {
            const planData = {
                breakfast: 'Oats with fruits',
                lunch: 'Rice and dal',
                dinner: 'Roti and vegetables',
            };

            const res = await request(app)
                .post('/api/plans')
                .set('Authorization', `Bearer ${trainerToken}`)
                .send({
                    clientId: clientUser.id,
                    type: 'DIET',
                    data: planData,
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.type).toBe('DIET');
            expect(res.body.clientProfileId).toBe(clientProfile.id);
        });

        it('should create workout plan for client as trainer', async () => {
            const planData = {
                monday: 'Chest and triceps',
                tuesday: 'Back and biceps',
                wednesday: 'Legs',
            };

            const res = await request(app)
                .post('/api/plans')
                .set('Authorization', `Bearer ${trainerToken}`)
                .send({
                    clientId: clientUser.id,
                    type: 'WORKOUT',
                    data: planData,
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.type).toBe('WORKOUT');
        });

        it('should not create plan for non-existent client', async () => {
            const res = await request(app)
                .post('/api/plans')
                .set('Authorization', `Bearer ${trainerToken}`)
                .send({
                    clientId: 'non-existent-id',
                    type: 'DIET',
                    data: { meal: 'test' },
                });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Client profile not found');
        });
    });

    describe('GET /api/plans/:clientId', () => {
        beforeEach(async () => {
            // Create a plan for testing
            await prisma.plan.create({
                data: {
                    clientProfileId: clientProfile.id,
                    type: 'DIET',
                    data: JSON.stringify({ meal: 'test meal' }),
                },
            });
        });

        it('should get plans for client', async () => {
            const res = await request(app)
                .get(`/api/plans/${clientUser.id}`)
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should return empty array for client with no plans', async () => {
            // Create a new client without plans
            const newClient = await prisma.user.create({
                data: {
                    name: 'New Client',
                    email: 'newclient@test.com',
                    password: 'password',
                    role: 'CLIENT',
                },
            });

            await prisma.clientProfile.create({
                data: { userId: newClient.id },
            });

            const res = await request(app)
                .get(`/api/plans/${newClient.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });
    });

    describe('POST /api/logs', () => {
        it('should create water log as client', async () => {
            const res = await request(app)
                .post('/api/logs')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    type: 'WATER',
                    value: '2.5',
                    date: new Date().toISOString(),
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.type).toBe('WATER');
            expect(res.body.value).toBe('2.5');
        });

        it('should create weight log as client', async () => {
            const res = await request(app)
                .post('/api/logs')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    type: 'WEIGHT',
                    value: '75.5',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.type).toBe('WEIGHT');
            expect(res.body.value).toBe('75.5');
        });

        it('should create note log as client', async () => {
            const res = await request(app)
                .post('/api/logs')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    type: 'NOTE',
                    value: 'Great workout today!',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.type).toBe('NOTE');
        });
    });

    describe('GET /api/logs', () => {
        beforeEach(async () => {
            // Create some logs
            await prisma.log.createMany({
                data: [
                    {
                        clientProfileId: clientProfile.id,
                        type: 'WATER',
                        value: '2.0',
                    },
                    {
                        clientProfileId: clientProfile.id,
                        type: 'WEIGHT',
                        value: '75.0',
                    },
                    {
                        clientProfileId: clientProfile.id,
                        type: 'NOTE',
                        value: 'Feeling great!',
                    },
                ],
            });
        });

        it('should get all logs for client', async () => {
            const res = await request(app)
                .get('/api/logs')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should filter logs by type', async () => {
            const res = await request(app)
                .get('/api/logs?type=WATER')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.every(log => log.type === 'WATER')).toBe(true);
        });

        it('should limit logs to 50', async () => {
            const res = await request(app)
                .get('/api/logs')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeLessThanOrEqual(50);
        });
    });
});
