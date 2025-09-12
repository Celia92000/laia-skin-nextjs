-- COPIEZ TOUT CE SQL DANS SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/zsxweurvtsrdgehtadwa/sql/new

-- 1. Créer les tables principales
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'client',
    "loyaltyPoints" INTEGER DEFAULT 0,
    "totalSpent" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "adminNotes" TEXT,
    allergies TEXT,
    "birthDate" TIMESTAMPTZ,
    "lastVisit" TIMESTAMPTZ,
    "medicalNotes" TEXT,
    preferences TEXT,
    "skinType" TEXT
);

CREATE TABLE IF NOT EXISTS "Service" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT UNIQUE DEFAULT '',
    name TEXT NOT NULL,
    "shortDescription" TEXT DEFAULT '',
    description TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    keywords TEXT,
    price DOUBLE PRECISION NOT NULL,
    "launchPrice" DOUBLE PRECISION,
    "promoPrice" DOUBLE PRECISION,
    "forfaitPrice" DOUBLE PRECISION,
    "forfaitPromo" DOUBLE PRECISION,
    duration INTEGER NOT NULL,
    benefits TEXT,
    process TEXT,
    recommendations TEXT,
    contraindications TEXT,
    "mainImage" TEXT,
    gallery TEXT,
    "videoUrl" TEXT,
    "canBeOption" BOOLEAN DEFAULT false,
    category TEXT,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Reservation" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "serviceId" TEXT REFERENCES "Service"(id),
    date TIMESTAMPTZ NOT NULL,
    time TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'pending',
    source TEXT DEFAULT 'site',
    notes TEXT,
    "paymentStatus" TEXT DEFAULT 'unpaid',
    "paymentDate" TIMESTAMPTZ,
    "paymentAmount" DOUBLE PRECISION,
    "paymentMethod" TEXT,
    "invoiceNumber" TEXT,
    "paymentNotes" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "LoyaltyProfile" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"(id),
    points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'BRONZE',
    "individualServicesCount" INTEGER DEFAULT 0,
    "packagesCount" INTEGER DEFAULT 0,
    "totalSpent" DOUBLE PRECISION DEFAULT 0,
    "availableDiscounts" TEXT DEFAULT '[]',
    "lastVisit" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "LoyaltyHistory" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "profileId" TEXT REFERENCES "LoyaltyProfile"(id),
    action TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    description TEXT NOT NULL,
    "reservationId" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "BlogPost" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author TEXT DEFAULT 'LAIA SKIN Institut',
    "readTime" TEXT DEFAULT '5 min',
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    "mainImage" TEXT,
    gallery TEXT,
    tags TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "publishedAt" TIMESTAMPTZ DEFAULT NOW(),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ClientEvolution" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "sessionNumber" INTEGER NOT NULL,
    "serviceName" TEXT NOT NULL,
    "sessionDate" TIMESTAMPTZ NOT NULL,
    "beforePhoto" TEXT,
    "afterPhoto" TEXT,
    "videoUrl" TEXT,
    improvements TEXT,
    "clientFeedback" TEXT,
    "adminNotes" TEXT,
    "skinAnalysis" TEXT,
    "treatedAreas" TEXT,
    "productsUsed" TEXT,
    "hydrationLevel" INTEGER,
    elasticity INTEGER,
    pigmentation INTEGER,
    "wrinkleDepth" INTEGER,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Review" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "reservationId" TEXT,
    "serviceName" TEXT,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    response TEXT,
    approved BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Notification" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Setting" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "BlockedSlot" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date TIMESTAMPTZ NOT NULL,
    time TEXT NOT NULL,
    reason TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Package" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    services TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    "validDays" INTEGER DEFAULT 90,
    "maxUses" INTEGER,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_reservation_user ON "Reservation"("userId");
CREATE INDEX IF NOT EXISTS idx_reservation_date ON "Reservation"(date);
CREATE INDEX IF NOT EXISTS idx_service_slug ON "Service"(slug);
CREATE INDEX IF NOT EXISTS idx_blogpost_slug ON "BlogPost"(slug);

-- 3. Créer les triggers pour updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_updated_at BEFORE UPDATE ON "Service" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservation_updated_at BEFORE UPDATE ON "Reservation" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyaltyprofile_updated_at BEFORE UPDATE ON "LoyaltyProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blogpost_updated_at BEFORE UPDATE ON "BlogPost" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientevolution_updated_at BEFORE UPDATE ON "ClientEvolution" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON "Review" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_setting_updated_at BEFORE UPDATE ON "Setting" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blockedslot_updated_at BEFORE UPDATE ON "BlockedSlot" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_package_updated_at BEFORE UPDATE ON "Package" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Insérer un admin par défaut
INSERT INTO "User" (email, password, name, role) 
VALUES ('admin@laiaskin.com', '$2a$10$EixZsZY3Xzjm4JmRVJdoOe.5AY3s9D0pHE2VzUx0.VnXw8VqJVq0W', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Mot de passe admin par défaut : admin123