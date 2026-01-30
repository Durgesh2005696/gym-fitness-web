const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/utils/prismaClient');
const { clearDatabase, createTestAdmin, createTestClient, createTestTrainer } = require('../utils/testHelpers');

describe('Authentication API Tests', () => {
    beforeAll(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new CLIENT user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New Client',
                    email: 'newclient@test.com',
                    password: 'password123',
                    role: 'CLIENT',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.email).toBe('newclient@test.com');
            expect(res.body.role).toBe('CLIENT');
            expect(res.body.token).toBeNull();
            expect(res.body.message).toBe('Registration successful. Please login.');
        });

        it('should register a new TRAINER user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New Trainer',
                    email: 'newtrainer@test.com',
                    password: 'password123',
                    role: 'TRAINER',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.role).toBe('TRAINER');
        });

        it('should not register user with existing email', async () => {
            await createTestClient();

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate User',
                    email: 'client@test.com',
                    password: 'password123',
                    role: 'CLIENT',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await clearDatabase();
            await createTestClient();
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'client@test.com',
                    password: 'client123',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.email).toBe('client@test.com');
            expect(res.body.role).toBe('CLIENT');
            expect(res.body).toHaveProperty('isActive');
        });

        it('should not login with invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'client@test.com',
                    password: 'wrongpassword',
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123',
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should generate new loginToken on each login (single device)', async () => {
            // First login
            const res1 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'client@test.com',
                    password: 'client123',
                });

            const token1 = res1.body.token;

            // Second login (simulating different device)
            const res2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'client@test.com',
                    password: 'client123',
                });

            const token2 = res2.body.token;

            // Tokens should be different
            expect(token1).not.toBe(token2);

            // First token should now be invalid
            const res3 = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token1}`);

            expect(res3.statusCode).toBe(401);
            expect(res3.body.message).toBe('Session expired. Logged in on another device.');
        });
    });

    describe('GET /api/auth/me', () => {
        let clientToken;

        beforeEach(async () => {
            await clearDatabase();
            await createTestClient();

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'client@test.com',
                    password: 'client123',
                });

            clientToken = loginRes.body.token;
        });

        it('should get current user profile with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe('client@test.com');
            expect(res.body.role).toBe('CLIENT');
            expect(res.body).toHaveProperty('profile');
        });

        it('should not get profile without token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Not authorized, no token');
        });

        it('should not get profile with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalidtoken123');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Not authorized, token failed');
        });
    });
});
