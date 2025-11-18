-- VERSION SIMPLIFIÉE - COPIEZ TOUT DANS SUPABASE

-- Table 1: Utilisateurs
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'client',
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: Services
CREATE TABLE "Service" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    duration INTEGER DEFAULT 60,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: Réservations
CREATE TABLE "Reservation" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    "totalPrice" REAL DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: Profils de fidélité
CREATE TABLE "LoyaltyProfile" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL,
    points INTEGER DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: Avis
CREATE TABLE "Review" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Table 6: Créneaux bloqués
CREATE TABLE "BlockedSlot" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    reason TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un admin par défaut (mot de passe: admin123)
INSERT INTO "User" (email, password, name, role) 
VALUES ('admin@laiaskin.com', '$2a$10$EixZsZY3Xzjm4JmRVJdoOe.5AY3s9D0pHE2VzUx0.VnXw8VqJVq0W', 'Admin', 'admin');