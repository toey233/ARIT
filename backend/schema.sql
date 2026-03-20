-- ARIT Training Management System - PostgreSQL Schema
-- Run: psql -U postgres -d arit_training -f schema.sql

-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
    phone VARCHAR(50) DEFAULT '',
    "studentId" VARCHAR(100) DEFAULT '',
    department VARCHAR(255) DEFAULT '',
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ========== COURSES ==========
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT DEFAULT '',
    instructor VARCHAR(255) DEFAULT '',
    "startDate" VARCHAR(50),
    "endDate" VARCHAR(50),
    location VARCHAR(500) DEFAULT '',
    "maxParticipants" INTEGER DEFAULT 30,
    category VARCHAR(255) DEFAULT 'ทั่วไป',
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
    image TEXT DEFAULT '',
    materials TEXT DEFAULT '',
    topics TEXT DEFAULT '',
    "trainingDate" VARCHAR(255) DEFAULT '',
    duration VARCHAR(255) DEFAULT '',
    "createdBy" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ========== REGISTRATIONS ==========
CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    "registeredAt" TIMESTAMPTZ DEFAULT NOW(),
    "approvedBy" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "approvedAt" TIMESTAMPTZ,
    UNIQUE("userId", "courseId")
);

-- ========== EVALUATIONS ==========
CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "contentRating" INTEGER CHECK ("contentRating" >= 1 AND "contentRating" <= 5),
    "instructorRating" INTEGER CHECK ("instructorRating" >= 1 AND "instructorRating" <= 5),
    "facilityRating" INTEGER CHECK ("facilityRating" >= 1 AND "facilityRating" <= 5),
    comment TEXT DEFAULT '',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("userId", "courseId")
);

-- ========== CERTIFICATES ==========
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "certificateNumber" VARCHAR(100) UNIQUE NOT NULL,
    "issuedAt" TIMESTAMPTZ DEFAULT NOW(),
    "issuedBy" TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- ========== NEWS ==========
CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(255) DEFAULT 'ทั่วไป',
    "isPinned" BOOLEAN DEFAULT FALSE,
    image TEXT DEFAULT '',
    "createdBy" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations("userId");
CREATE INDEX IF NOT EXISTS idx_registrations_course ON registrations("courseId");
CREATE INDEX IF NOT EXISTS idx_evaluations_course ON evaluations("courseId");
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates("userId");
CREATE INDEX IF NOT EXISTS idx_news_pinned ON news("isPinned");
