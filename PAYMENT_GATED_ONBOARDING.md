# Payment-Gated Onboarding System - Complete Architecture

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Data Model & Status Design](#data-model--status-design)
3. [Payment Flow Architecture](#payment-flow-architecture)
4. [Frontend Gating Logic](#frontend-gating-logic)
5. [Backend Authorization & Workflows](#backend-authorization--workflows)
6. [API Endpoints Specification](#api-endpoints-specification)
7. [Security Implementation](#security-implementation)
8. [Testing & Debugging Guide](#testing--debugging-guide)
9. [Common Pitfalls & Best Practices](#common-pitfalls--best-practices)
10. [Migration Strategy](#migration-strategy)

---

## Executive Summary

### Current State Analysis
The existing system has a simplified payment model:
- Single `isActive` boolean + `subscriptionExpiresAt` date
- All payments go to Admin
- No distinction between trainer-to-admin and client-to-trainer flows
- Trainers can add clients without payment verification

### Target State
A production-grade payment-gated system where:
- **Trainers** pay **Admin** to activate their account
- **Clients** pay **Trainers** to activate coaching
- Access is strictly gated by role + payment status + trainer-client linkage
- No feature access until payment verification

---

## Data Model & Status Design

### Schema Changes Required

```prisma
// Enhanced User Model
model User {
  id                    String    @id @default(uuid())
  name                  String
  email                 String    @unique
  password              String
  role                  String    @default("CLIENT") // ADMIN, TRAINER, CLIENT
  
  // === STATUS FIELDS (NEW) ===
  accountStatus         String    @default("PENDING") 
                        // TRAINER: PENDING | ACTIVE | REJECTED | SUSPENDED
                        // CLIENT:  REGISTERED | PENDING_PAYMENT | ACTIVE | SUSPENDED
  
  // Legacy (kept for backward compatibility)
  isActive              Boolean   @default(false)
  subscriptionExpiresAt DateTime?
  
  // Trainer-specific: Their QR code for client payments
  paymentQrCode         String?   
  
  loginToken            String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  trainerProfile TrainerProfile?
  clientProfile  ClientProfile?
  
  // Payments MADE by this user
  paymentsMade   Payment[] @relation("PaymentPayer")
  
  // Payments RECEIVED by this user (trainers receive from clients)
  paymentsReceived Payment[] @relation("PaymentReceiver")
  
  managedClients ClientProfile[] @relation("TrainerClients")
}

// Enhanced Payment Model
model Payment {
  id            String   @id @default(uuid())
  
  // Who is paying
  payerId       String
  payer         User     @relation("PaymentPayer", fields: [payerId], references: [id], onDelete: Cascade)
  
  // Who receives payment (Admin for trainers, Trainer for clients)
  receiverId    String?
  receiver      User?    @relation("PaymentReceiver", fields: [receiverId], references: [id])
  
  // Payment Type
  paymentType   String   @default("SUBSCRIPTION") 
                // TRAINER_SUBSCRIPTION (trainer → admin)
                // CLIENT_ACTIVATION (client → trainer)
                // RENEWAL (any → respective receiver)
  
  amount        Float
  screenshotUrl String?
  transactionId String?
  
  status        String   @default("PENDING")
                // PENDING | APPROVED | REJECTED
  
  // For client payments: which trainer is this for?
  targetTrainerId String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Enhanced ClientProfile
model ClientProfile {
  id                    String  @id @default(uuid())
  userId                String  @unique
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // === CLIENT ACTIVATION STATUS (NEW) ===
  activationStatus      String  @default("UNASSIGNED")
                        // UNASSIGNED | PENDING_PAYMENT | PAYMENT_SUBMITTED | ACTIVE
  
  // Existing fields...
  trainerId             String?
  trainer               User?   @relation("TrainerClients", fields: [trainerId], references: [id])
  isQuestionnaireFilled Boolean @default(false)
  
  // ... other existing fields
}
```

### Status State Machines

#### Trainer Account Status
```
PENDING ──────────────────────────────────────────────┐
   │                                                   │
   │ [Submit Payment]                                  │
   ▼                                                   │
PAYMENT_SUBMITTED ─────────────────────────────────────┤
   │                                                   │
   ├──[Admin Approves]──► ACTIVE ◄─[Admin Creates]────┘
   │
   └──[Admin Rejects]───► REJECTED
   
ACTIVE ──[Admin Suspends]──► SUSPENDED
   │
   └──[Subscription Expires]──► EXPIRED (requires renewal)
```

#### Client Activation Status
```
REGISTERED (can login, limited dashboard)
   │
   │ [Trainer adds client by email]
   ▼
UNASSIGNED (linked to trainer, awaiting payment)
   │
   │ [Client submits payment to trainer]
   ▼
PENDING_PAYMENT (payment submitted, awaiting trainer approval)
   │
   ├──[Trainer Approves]──► ACTIVE (full access)
   │
   └──[Trainer Rejects]───► UNASSIGNED (can retry)
```

---

## Payment Flow Architecture

### Flow A: Trainer Onboarding (Trainer → Admin)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   TRAINER   │      │   SYSTEM    │      │    ADMIN    │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                    │
       │  1. Register       │                    │
       │───────────────────►│                    │
       │                    │                    │
       │  2. accountStatus  │                    │
       │     = PENDING      │                    │
       │◄───────────────────│                    │
       │                    │                    │
       │  3. Login (limited │                    │
       │     access - only  │                    │
       │     payment page)  │                    │
       │───────────────────►│                    │
       │                    │                    │
       │  4. View Admin QR  │                    │
       │     (from settings)│                    │
       │◄───────────────────│                    │
       │                    │                    │
       │  5. Submit Payment │                    │
       │     (txn ID, proof)│                    │
       │───────────────────►│                    │
       │                    │                    │
       │                    │  6. New pending    │
       │                    │     payment alert  │
       │                    │───────────────────►│
       │                    │                    │
       │                    │  7. Admin reviews  │
       │                    │     & approves     │
       │                    │◄───────────────────│
       │                    │                    │
       │  8. accountStatus  │                    │
       │     = ACTIVE       │                    │
       │◄───────────────────│                    │
       │                    │                    │
       │  9. Full dashboard │                    │
       │     access         │                    │
       │◄──────────────────►│                    │
```

### Flow B: Client Activation (Client → Trainer)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   CLIENT    │      │   SYSTEM    │      │   TRAINER   │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                    │
       │  1. Register       │                    │
       │───────────────────►│                    │
       │                    │                    │
       │  2. Login (limited │                    │
       │     dashboard)     │                    │
       │◄───────────────────│                    │
       │                    │                    │
       │  [OFFLINE: Client  │                    │
       │   shares email     │                    │
       │   with Trainer]    │                    │
       │                    │                    │
       │                    │  3. Trainer adds   │
       │                    │     client email   │
       │                    │◄───────────────────│
       │                    │                    │
       │                    │  4. Validate:      │
       │                    │     - Client exists│
       │                    │     - Is unassigned│
       │                    │     - Not a trainer│
       │                    │                    │
       │  5. activationStatus                    │
       │     = UNASSIGNED   │                    │
       │     trainerId set  │                    │
       │◄───────────────────│                    │
       │                    │                    │
       │  6. Client sees    │                    │
       │     trainer QR code│                    │
       │◄───────────────────│                    │
       │                    │                    │
       │  7. Submit Payment │                    │
       │     to trainer     │                    │
       │───────────────────►│                    │
       │                    │                    │
       │                    │  8. Trainer sees   │
       │                    │     pending payment│
       │                    │───────────────────►│
       │                    │                    │
       │                    │  9. Trainer        │
       │                    │     approves       │
       │                    │◄───────────────────│
       │                    │                    │
       │  10. activationStatus                   │
       │      = ACTIVE      │                    │
       │◄───────────────────│                    │
       │                    │                    │
       │  11. Full coaching │                    │
       │      access        │                    │
       │◄──────────────────►│                    │
```

---

## Frontend Gating Logic

### Enhanced Protected Route Component

```jsx
// ProtectedRoute.jsx
const ProtectedRoute = ({ children, requiredStatus = 'ACTIVE' }) => {
    const { isAuthenticated, user, token } = useAuthStore();

    // Gate 1: Must be authenticated
    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Gate 2: Admin bypass (always has full access)
    if (user?.role === 'ADMIN') {
        return children;
    }

    // Gate 3: Role-specific status checks
    if (user?.role === 'TRAINER') {
        return <TrainerGate user={user} requiredStatus={requiredStatus}>
            {children}
        </TrainerGate>;
    }

    if (user?.role === 'CLIENT') {
        return <ClientGate user={user} requiredStatus={requiredStatus}>
            {children}
        </ClientGate>;
    }

    // Unknown role - deny access
    return <Navigate to="/login" replace />;
};

// TrainerGate.jsx
const TrainerGate = ({ user, children, requiredStatus }) => {
    const status = user.accountStatus;

    // PENDING trainers → Payment/Activation page
    if (status === 'PENDING' || status === 'PAYMENT_SUBMITTED') {
        return <Navigate to="/trainer-activation" replace />;
    }

    // REJECTED trainers → Rejection notice
    if (status === 'REJECTED') {
        return <Navigate to="/trainer-rejected" replace />;
    }

    // SUSPENDED trainers → Suspension notice
    if (status === 'SUSPENDED') {
        return <Navigate to="/account-suspended" replace />;
    }

    // Check subscription expiry
    if (user.subscriptionExpiresAt && 
        new Date(user.subscriptionExpiresAt) < new Date()) {
        return <Navigate to="/renew" replace />;
    }

    // ACTIVE trainers with valid subscription → Full access
    return children;
};

// ClientGate.jsx
const ClientGate = ({ user, children, requiredStatus }) => {
    const profile = user.profile;
    const activationStatus = profile?.activationStatus || 'REGISTERED';

    // REGISTERED clients (no trainer) → Limited dashboard
    if (activationStatus === 'REGISTERED') {
        // Allow access to limited pages only
        const allowedPaths = ['/dashboard', '/profile', '/find-trainer'];
        if (!allowedPaths.includes(window.location.pathname)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // UNASSIGNED clients (trainer added, awaiting payment) → Payment page
    if (activationStatus === 'UNASSIGNED') {
        return <Navigate to="/client-payment" replace />;
    }

    // PENDING_PAYMENT clients → Waiting for approval page
    if (activationStatus === 'PENDING_PAYMENT') {
        return <Navigate to="/payment-pending" replace />;
    }

    // ACTIVE clients → Full access, but check questionnaire
    if (!profile?.isQuestionnaireFilled) {
        if (window.location.pathname !== '/questionnaire') {
            return <Navigate to="/questionnaire" replace />;
        }
    }

    return children;
};
```

### Dashboard Feature Gating

```jsx
// ClientDashboard.jsx
const ClientDashboard = () => {
    const { user } = useAuthStore();
    const isActivated = user?.profile?.activationStatus === 'ACTIVE';
    const hasTrainer = !!user?.profile?.trainerId;

    return (
        <div className="dashboard">
            {/* Always visible */}
            <ProfileSection user={user} />
            
            {/* Conditional: Only if trainer assigned */}
            {hasTrainer && (
                <TrainerInfoCard trainerId={user.profile.trainerId} />
            )}
            
            {/* Gated Features */}
            {isActivated ? (
                <>
                    <PlansSection />
                    <ProgressSection />
                    <DailyLogSection />
                    <FeedbackSection />
                </>
            ) : (
                <ActivationRequiredBanner 
                    status={user?.profile?.activationStatus}
                    trainerAssigned={hasTrainer}
                />
            )}
        </div>
    );
};

// ActivationRequiredBanner.jsx
const ActivationRequiredBanner = ({ status, trainerAssigned }) => {
    const messages = {
        'REGISTERED': {
            title: 'Find Your Trainer',
            message: 'Share your email with a trainer to get started.',
            action: null
        },
        'UNASSIGNED': {
            title: 'Payment Required',
            message: 'Complete payment to your trainer to unlock coaching.',
            action: <Link to="/client-payment">Pay Now</Link>
        },
        'PENDING_PAYMENT': {
            title: 'Awaiting Approval',
            message: 'Your trainer is reviewing your payment.',
            action: null
        }
    };

    const { title, message, action } = messages[status] || messages['REGISTERED'];

    return (
        <div className="activation-banner">
            <h3>{title}</h3>
            <p>{message}</p>
            {action}
        </div>
    );
};
```

---

## Backend Authorization & Workflows

### Enhanced Middleware Stack

```javascript
// middleware/authMiddleware.js

/**
 * Base authentication - verifies JWT + single session
 */
exports.protect = async (req, res, next) => {
    // ... existing JWT verification code ...
    
    // Attach full user with profile
    req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
            clientProfile: true,
            trainerProfile: true
        }
    });
    
    // Verify single-session token
    if (decoded.loginToken !== req.user.loginToken) {
        return res.status(401).json({ 
            message: 'Session expired. Logged in on another device.',
            code: 'SESSION_EXPIRED'
        });
    }
    
    next();
};

/**
 * Trainer status check - ensures trainer is ACTIVE
 */
exports.requireActiveTrainer = (req, res, next) => {
    if (req.user.role !== 'TRAINER') {
        return res.status(403).json({ message: 'Trainer access required' });
    }
    
    if (req.user.accountStatus !== 'ACTIVE') {
        return res.status(403).json({ 
            message: 'Trainer account not active',
            code: 'TRAINER_INACTIVE',
            status: req.user.accountStatus
        });
    }
    
    // Check subscription
    if (req.user.subscriptionExpiresAt && 
        new Date(req.user.subscriptionExpiresAt) < new Date()) {
        return res.status(403).json({ 
            message: 'Trainer subscription expired',
            code: 'SUBSCRIPTION_EXPIRED'
        });
    }
    
    next();
};

/**
 * Client activation check - ensures client is ACTIVE
 */
exports.requireActiveClient = (req, res, next) => {
    if (req.user.role !== 'CLIENT') {
        return res.status(403).json({ message: 'Client access required' });
    }
    
    const activationStatus = req.user.clientProfile?.activationStatus;
    
    if (activationStatus !== 'ACTIVE') {
        return res.status(403).json({ 
            message: 'Client not activated',
            code: 'CLIENT_INACTIVE',
            status: activationStatus
        });
    }
    
    next();
};

/**
 * Trainer-Client ownership verification
 */
exports.verifyClientOwnership = async (req, res, next) => {
    const clientId = req.params.clientId || req.body.clientId;
    const callerRole = req.user.role;
    const callerId = req.user.id;

    if (callerRole === 'ADMIN') {
        return next(); // Admin can access any client
    }

    const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: clientId },
        include: { user: true }
    });

    if (!clientProfile) {
        return res.status(404).json({ message: 'Client not found' });
    }

    // Trainer can only access their assigned clients
    if (callerRole === 'TRAINER') {
        if (clientProfile.trainerId !== callerId) {
            return res.status(403).json({ 
                message: 'This client is not assigned to you' 
            });
        }
        
        // Also verify client is ACTIVE (paid)
        if (clientProfile.activationStatus !== 'ACTIVE') {
            return res.status(403).json({ 
                message: 'Client has not completed payment activation',
                code: 'CLIENT_NOT_ACTIVATED'
            });
        }
    }

    // Client can only access themselves
    if (callerRole === 'CLIENT' && clientProfile.userId !== callerId) {
        return res.status(403).json({ message: 'Access denied' });
    }

    req.clientProfile = clientProfile;
    next();
};
```

### Payment Controller Enhancements

```javascript
// controllers/paymentController.js

/**
 * Submit Trainer Payment (Trainer → Admin)
 * @route POST /api/payments/trainer-subscription
 * @access Private (Trainer with PENDING status)
 */
exports.submitTrainerPayment = async (req, res) => {
    const { transactionId, screenshotUrl } = req.body;
    const userId = req.user.id;

    // Validate user is a pending trainer
    if (req.user.role !== 'TRAINER') {
        return res.status(403).json({ message: 'Trainer access only' });
    }

    if (req.user.accountStatus !== 'PENDING') {
        return res.status(400).json({ 
            message: 'Account already processed',
            status: req.user.accountStatus
        });
    }

    // Get trainer price from settings
    const settings = await prisma.systemSetting.findFirst();
    const amount = settings?.trainerPrice || 659;

    // Create payment record
    const payment = await prisma.payment.create({
        data: {
            payerId: userId,
            receiverId: null, // Admin receives (null = platform)
            paymentType: 'TRAINER_SUBSCRIPTION',
            amount,
            transactionId,
            screenshotUrl,
            status: 'PENDING'
        }
    });

    // Update trainer status
    await prisma.user.update({
        where: { id: userId },
        data: { accountStatus: 'PAYMENT_SUBMITTED' }
    });

    res.status(201).json({ 
        message: 'Payment submitted. Awaiting admin approval.',
        payment 
    });
};

/**
 * Submit Client Payment (Client → Trainer)
 * @route POST /api/payments/client-activation
 * @access Private (Client with assigned trainer)
 */
exports.submitClientPayment = async (req, res) => {
    const { transactionId, screenshotUrl } = req.body;
    const userId = req.user.id;

    const clientProfile = req.user.clientProfile;

    // Validate client state
    if (!clientProfile || !clientProfile.trainerId) {
        return res.status(400).json({ 
            message: 'No trainer assigned. Contact a trainer first.' 
        });
    }

    if (clientProfile.activationStatus === 'ACTIVE') {
        return res.status(400).json({ message: 'Already activated' });
    }

    // Get client price from settings
    const settings = await prisma.systemSetting.findFirst();
    const amount = settings?.clientPrice || 6000;

    // Create payment record
    const payment = await prisma.payment.create({
        data: {
            payerId: userId,
            receiverId: clientProfile.trainerId,
            paymentType: 'CLIENT_ACTIVATION',
            amount,
            transactionId,
            screenshotUrl,
            targetTrainerId: clientProfile.trainerId,
            status: 'PENDING'
        }
    });

    // Update client status
    await prisma.clientProfile.update({
        where: { userId },
        data: { activationStatus: 'PENDING_PAYMENT' }
    });

    res.status(201).json({ 
        message: 'Payment submitted. Awaiting trainer approval.',
        payment 
    });
};

/**
 * Trainer approves client payment
 * @route PUT /api/payments/:id/approve-client
 * @access Private (Trainer - owner of payment)
 */
exports.approveClientPayment = async (req, res) => {
    const { id } = req.params;
    const trainerId = req.user.id;

    const payment = await prisma.payment.findUnique({
        where: { id },
        include: { payer: { include: { clientProfile: true } } }
    });

    if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify trainer owns this payment
    if (payment.receiverId !== trainerId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (payment.status !== 'PENDING') {
        return res.status(400).json({ message: 'Payment already processed' });
    }

    // Get subscription duration
    const settings = await prisma.systemSetting.findFirst();
    const duration = settings?.subscriptionDuration || 30;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    // Transaction: Update payment + client statuses
    await prisma.$transaction([
        prisma.payment.update({
            where: { id },
            data: { status: 'APPROVED' }
        }),
        prisma.user.update({
            where: { id: payment.payerId },
            data: {
                isActive: true,
                subscriptionExpiresAt: expiryDate
            }
        }),
        prisma.clientProfile.update({
            where: { userId: payment.payerId },
            data: { activationStatus: 'ACTIVE' }
        })
    ]);

    res.json({ 
        message: `Client activated for ${duration} days`,
        expiryDate 
    });
};

/**
 * Get pending payments for trainer (their clients)
 * @route GET /api/payments/pending/clients
 * @access Private (Trainer)
 */
exports.getTrainerPendingPayments = async (req, res) => {
    const trainerId = req.user.id;

    const payments = await prisma.payment.findMany({
        where: {
            receiverId: trainerId,
            status: 'PENDING',
            paymentType: 'CLIENT_ACTIVATION'
        },
        include: {
            payer: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
};
```

### Coaching Controller Enhancements

```javascript
// controllers/coachingController.js

/**
 * Enhanced addClientByEmail - Initiates client-trainer link (NO ACTIVATION YET)
 * @route POST /api/coaching/add-client
 * @access Private (Active Trainer only)
 */
const addClientByEmail = async (req, res) => {
    const trainerId = req.user.id;
    const { clientEmail } = req.body;

    // Validate: Must be active trainer
    if (req.user.accountStatus !== 'ACTIVE') {
        return res.status(403).json({ 
            message: 'Your trainer account is not active' 
        });
    }

    // Find client
    const clientUser = await prisma.user.findUnique({
        where: { email: clientEmail.trim().toLowerCase() },
        include: { clientProfile: true }
    });

    if (!clientUser) {
        return res.status(404).json({ 
            message: 'No registered user with that email' 
        });
    }

    if (clientUser.role !== 'CLIENT') {
        return res.status(400).json({ 
            message: 'That user is not a client' 
        });
    }

    // Check if already assigned
    if (clientUser.clientProfile?.trainerId) {
        if (clientUser.clientProfile.trainerId === trainerId) {
            return res.status(400).json({ 
                message: 'Client already linked to you' 
            });
        }
        return res.status(400).json({ 
            message: 'Client is assigned to another trainer' 
        });
    }

    // Check if profile exists
    if (!clientUser.clientProfile) {
        await prisma.clientProfile.create({
            data: {
                userId: clientUser.id,
                trainerId: trainerId,
                activationStatus: 'UNASSIGNED'
            }
        });
    } else {
        await prisma.clientProfile.update({
            where: { userId: clientUser.id },
            data: {
                trainerId: trainerId,
                activationStatus: 'UNASSIGNED'
            }
        });
    }

    res.json({
        message: 'Client linked. They must now complete payment.',
        client: {
            id: clientUser.id,
            name: clientUser.name,
            email: clientUser.email,
            activationStatus: 'UNASSIGNED'
        }
    });
};
```

---

## API Endpoints Specification

### Authentication Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register (CLIENT default) |
| POST | `/api/auth/register-trainer` | Public | Register as TRAINER (PENDING status) |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Protected | Get current user with full status |

### Payment Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/trainer-subscription` | Trainer (PENDING) | Submit trainer payment to admin |
| POST | `/api/payments/client-activation` | Client (UNASSIGNED) | Submit client payment to trainer |
| GET | `/api/payments/pending` | Admin | Get all pending trainer payments |
| GET | `/api/payments/pending/clients` | Trainer (ACTIVE) | Get pending client payments |
| PUT | `/api/payments/:id/approve` | Admin | Approve trainer payment |
| PUT | `/api/payments/:id/approve-client` | Trainer | Approve client payment |
| PUT | `/api/payments/:id/reject` | Admin/Trainer | Reject payment |

### Coaching Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/coaching/add-client` | Trainer (ACTIVE) | Link client by email |
| GET | `/api/coaching/client/:clientId` | Trainer (ACTIVE) + Ownership | Get client details |
| POST | `/api/coaching/progress` | Trainer (ACTIVE) + Ownership | Add progress record |

### User Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/my-trainer` | Client (ACTIVE) | Get assigned trainer info |
| GET | `/api/users/trainer-qr` | Client (UNASSIGNED) | Get trainer's QR code for payment |
| PUT | `/api/users/update-qr` | Trainer (ACTIVE) | Update trainer's payment QR |

---

## Security Implementation

### Access Control Matrix

| Action | Admin | Trainer (PENDING) | Trainer (ACTIVE) | Client (REGISTERED) | Client (ACTIVE) |
|--------|-------|-------------------|------------------|---------------------|-----------------|
| View Dashboard | ✅ Full | ❌ Payment Page | ✅ Full | ⚠️ Limited | ✅ Full |
| Submit Trainer Payment | ❌ | ✅ | ❌ | ❌ | ❌ |
| Submit Client Payment | ❌ | ❌ | ❌ | ✅ (if assigned) | ❌ |
| Add Client | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve Client Payment | ❌ | ❌ | ✅ (own) | ❌ | ❌ |
| Approve Trainer Payment | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Client Details | ✅ | ❌ | ✅ (own) | ❌ | ✅ (self) |
| Create Plans | ❌ | ❌ | ✅ (own clients) | ❌ | ❌ |
| Log Activities | ❌ | ❌ | ❌ | ❌ | ✅ |

### Defense in Depth

```javascript
// 1. Route-level middleware
router.post('/plans', 
    protect,                    // JWT valid
    requireActiveTrainer,       // Trainer status = ACTIVE
    verifyClientOwnership,      // Client belongs to trainer
    createPlan                  // Controller
);

// 2. Controller-level re-validation
const createPlan = async (req, res) => {
    // DEFENSE-IN-DEPTH: Re-check ownership
    const client = req.clientProfile;
    if (client.trainerId !== req.user.id && req.user.role !== 'ADMIN') {
        console.warn(`SECURITY ALERT: Trainer ${req.user.id} bypassed middleware`);
        return res.status(403).json({ message: 'Access denied' });
    }
    
    // ... rest of logic
};

// 3. Database constraints (Prisma schema)
// - Cascade deletes prevent orphaned records
// - Unique constraints prevent duplicates
// - Required relations enforce data integrity
```

---

## Testing & Debugging Guide

### Test Scenarios

#### Scenario 1: Trainer Activation Flow
```
1. Register as trainer → accountStatus = PENDING
2. Try accessing /dashboard → Redirect to /trainer-activation
3. Submit payment → accountStatus = PAYMENT_SUBMITTED
4. Admin approves → accountStatus = ACTIVE
5. Access /dashboard → Full trainer dashboard
```

#### Scenario 2: Client Activation Flow
```
1. Register as client → activationStatus = REGISTERED
2. Access /dashboard → Limited view, no coaching features
3. Trainer adds client by email → activationStatus = UNASSIGNED
4. Client sees trainer QR in dashboard
5. Client submits payment → activationStatus = PENDING_PAYMENT
6. Trainer approves → activationStatus = ACTIVE
7. Access /dashboard → Full coaching features
```

#### Scenario 3: Edge Cases
```
- Trainer tries to add client before own activation → 403
- Client tries to access plans before activation → 403
- Trainer tries to approve payment for another trainer's client → 403
- Client submits payment without assigned trainer → 400
- Admin creates trainer manually → accountStatus = ACTIVE directly
```

### Browser DevTools Debugging

```javascript
// Check JWT payload
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Payload:', payload);

// Check user state
const authStore = useAuthStore.getState();
console.log('User:', authStore.user);
console.log('Account Status:', authStore.user.accountStatus);
console.log('Client Activation:', authStore.user.profile?.activationStatus);
```

### API Testing with curl

```bash
# Test trainer registration
curl -X POST http://localhost:5000/api/auth/register-trainer \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Trainer","email":"trainer@test.com","password":"password123"}'

# Test trainer payment submission
curl -X POST http://localhost:5000/api/payments/trainer-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"TXN123456789"}'

# Test admin approval
curl -X PUT http://localhost:5000/api/payments/$PAYMENT_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Common Pitfalls & Best Practices

### ❌ Pitfalls to Avoid

1. **Frontend-Only Gating**
   ```javascript
   // BAD: Only hiding UI elements
   {isActive && <CoachingFeatures />}
   ```
   
   Fix: Always enforce on backend with middleware.

2. **Trusting Client-Sent Status**
   ```javascript
   // BAD: Using status from request body
   const { status } = req.body;
   await updateUser({ status });
   ```
   
   Fix: Status changes only through verified workflows.

3. **Missing Ownership Checks**
   ```javascript
   // BAD: Trainer can access any client
   const client = await getClient(req.body.clientId);
   ```
   
   Fix: Always verify `client.trainerId === req.user.id`.

4. **Race Conditions**
   ```javascript
   // BAD: Non-atomic status updates
   await updatePayment({ status: 'APPROVED' });
   await updateUser({ isActive: true });
   ```
   
   Fix: Use transactions for multi-model updates.

### ✅ Best Practices

1. **Use Transactions for Critical Updates**
   ```javascript
   await prisma.$transaction([
       prisma.payment.update(...),
       prisma.user.update(...),
       prisma.clientProfile.update(...)
   ]);
   ```

2. **Log Security Events**
   ```javascript
   if (clientProfile.trainerId !== callerId) {
       console.warn(`SECURITY: ${callerId} attempted ${clientId}`);
       return res.status(403).json({ message: 'Access denied' });
   }
   ```

3. **Clear Status Codes in Responses**
   ```javascript
   res.status(403).json({
       message: 'Client not activated',
       code: 'CLIENT_INACTIVE',
       status: activationStatus
   });
   ```

4. **Consistent Status Naming**
   - Trainer: `accountStatus`
   - Client: `activationStatus`
   - Payment: `status`

---

## Migration Strategy

### Phase 1: Schema Migration
1. Add new fields to schema (non-breaking)
2. Run migration with defaults
3. Backfill existing users based on `isActive` flag

### Phase 2: Backend Update
1. Deploy enhanced middleware
2. Deploy new payment endpoints
3. Maintain backward compatibility with existing endpoints

### Phase 3: Frontend Update
1. Deploy new gating components
2. Add new activation flows
3. Update dashboard components

### Phase 4: Cutover
1. Enable strict gating
2. Monitor for edge cases
3. Deprecate legacy endpoints

### Migration Script
```javascript
// Backfill existing users
async function migrateUserStatuses() {
    // Active trainers → ACTIVE
    await prisma.user.updateMany({
        where: { role: 'TRAINER', isActive: true },
        data: { accountStatus: 'ACTIVE' }
    });
    
    // Inactive trainers → PENDING
    await prisma.user.updateMany({
        where: { role: 'TRAINER', isActive: false },
        data: { accountStatus: 'PENDING' }
    });
    
    // Active clients with trainer → ACTIVE
    await prisma.clientProfile.updateMany({
        where: { 
            trainerId: { not: null },
            user: { isActive: true }
        },
        data: { activationStatus: 'ACTIVE' }
    });
    
    // Clients with trainer but inactive → UNASSIGNED
    await prisma.clientProfile.updateMany({
        where: { 
            trainerId: { not: null },
            user: { isActive: false }
        },
        data: { activationStatus: 'UNASSIGNED' }
    });
    
    // Clients without trainer → REGISTERED
    await prisma.clientProfile.updateMany({
        where: { trainerId: null },
        data: { activationStatus: 'REGISTERED' }
    });
}
```

---

## Summary

This architecture ensures:
- ✅ **Strict payment gating** before feature access
- ✅ **Role-based access control** with status awareness
- ✅ **Defense in depth** at route, middleware, and controller levels
- ✅ **Clear separation** of trainer→admin and client→trainer flows
- ✅ **Production-grade security** with audit logging
- ✅ **Scalable design** for many trainers and clients
- ✅ **Backward compatible** migration path
