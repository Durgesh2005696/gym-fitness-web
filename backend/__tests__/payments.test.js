const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/utils/prismaClient');
const { clearDatabase, createTestAdmin, createTestClient } = require('../utils/testHelpers');

describe('Payment API Tests', () => {
    let adminToken;
    let clientToken;
    let clientUser;

    beforeAll(async () => {
        await clearDatabase();

        await createTestAdmin();
        clientUser = await createTestClient();

        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'admin123' });
        adminToken = adminLogin.body.token;

        const clientLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'client@test.com', password: 'client123' });
        clientToken = clientLogin.body.token;
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    describe('POST /api/payments', () => {
        it('should submit payment as authenticated user', async () => {
            const res = await request(app)
                .post('/api/payments')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    amount: 6000,
                    transactionId: 'TXN123456789',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.amount).toBe(6000);
            expect(res.body.transactionId).toBe('TXN123456789');
            expect(res.body.status).toBe('PENDING');
        });

        it('should not submit payment without token', async () => {
            const res = await request(app)
                .post('/api/payments')
                .send({
                    amount: 6000,
                    transactionId: 'TXN987654321',
                });

            expect(res.statusCode).toBe(401);
        });

        it('should not submit payment without transaction ID', async () => {
            const res = await request(app)
                .post('/api/payments')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    amount: 6000,
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Transaction ID and Amount are required');
        });
    });

    describe('GET /api/payments/pending', () => {
        beforeEach(async () => {
            // Create a pending payment
            await prisma.payment.create({
                data: {
                    userId: clientUser.id,
                    amount: 6000,
                    transactionId: 'PENDING123',
                    status: 'PENDING',
                },
            });
        });

        it('should get pending payments as admin', async () => {
            const res = await request(app)
                .get('/api/payments/pending')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].status).toBe('PENDING');
            expect(res.body[0].user).toBeDefined();
        });

        it('should not get pending payments as non-admin', async () => {
            const res = await request(app)
                .get('/api/payments/pending')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/payments/:id/approve', () => {
        let paymentId;

        beforeEach(async () => {
            const payment = await prisma.payment.create({
                data: {
                    userId: clientUser.id,
                    amount: 6000,
                    transactionId: 'APPROVE123',
                    status: 'PENDING',
                },
            });
            paymentId = payment.id;
        });

        it('should approve payment as admin', async () => {
            const res = await request(app)
                .put(`/api/payments/${paymentId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Payment approved and user activated for 30 days');

            // Verify payment status updated
            const updatedPayment = await prisma.payment.findUnique({
                where: { id: paymentId },
            });
            expect(updatedPayment.status).toBe('APPROVED');

            // Verify user activated
            const updatedUser = await prisma.user.findUnique({
                where: { id: clientUser.id },
            });
            expect(updatedUser.isActive).toBe(true);
            expect(updatedUser.subscriptionExpiresAt).toBeTruthy();
        });

        it('should not approve already approved payment', async () => {
            // First approval
            await request(app)
                .put(`/api/payments/${paymentId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            // Second approval attempt
            const res = await request(app)
                .put(`/api/payments/${paymentId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Payment already approved');
        });

        it('should not approve payment as non-admin', async () => {
            const res = await request(app)
                .put(`/api/payments/${paymentId}/approve`)
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/payments/:id/reject', () => {
        let paymentId;

        beforeEach(async () => {
            const payment = await prisma.payment.create({
                data: {
                    userId: clientUser.id,
                    amount: 6000,
                    transactionId: 'REJECT123',
                    status: 'PENDING',
                },
            });
            paymentId = payment.id;
        });

        it('should reject payment as admin', async () => {
            const res = await request(app)
                .put(`/api/payments/${paymentId}/reject`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Payment rejected');

            // Verify payment status updated
            const updatedPayment = await prisma.payment.findUnique({
                where: { id: paymentId },
            });
            expect(updatedPayment.status).toBe('REJECTED');
        });

        it('should not reject payment as non-admin', async () => {
            const res = await request(app)
                .put(`/api/payments/${paymentId}/reject`)
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(403);
        });
    });
});
