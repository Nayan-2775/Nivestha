-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE kyc_status_type AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'investment',
    'rental_income'
);

CREATE TYPE property_status AS ENUM ('open', 'closed', 'sold');

-- ============================================================
-- USERS, ROLES, AUTH SYSTEM
-- ============================================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone_number VARCHAR(20),
    kyc_status kyc_status_type DEFAULT 'pending',
    kyc_document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE user_roles (
    user_role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

-- ============================================================
-- WALLETS & TRANSACTIONS
-- ============================================================
CREATE TABLE wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    balance NUMERIC(12,2) DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(property_id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PROPERTIES & IMAGES
-- ============================================================
CREATE TABLE properties (
    property_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    total_value NUMERIC(14,2) NOT NULL,
    total_shares INT NOT NULL CHECK (total_shares > 0),
    available_shares INT NOT NULL CHECK (available_shares >= 0),
    status property_status DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (available_shares <= total_shares)
);

CREATE TABLE property_images (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(property_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INVESTMENTS
-- ============================================================
CREATE TABLE investments (
    investment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(property_id) ON DELETE CASCADE,
    shares INT NOT NULL CHECK (shares > 0),
    amount_invested NUMERIC(14,2) NOT NULL CHECK (amount_invested > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- ============================================================
-- RENTAL INCOME & DISTRIBUTIONS
-- ============================================================
CREATE TABLE rental_income (
    rental_income_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(property_id) ON DELETE CASCADE,
    period_month DATE NOT NULL,
    total_rent NUMERIC(14,2) NOT NULL CHECK (total_rent >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, period_month)
);

CREATE TABLE rental_distributions (
    distribution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_income_id UUID REFERENCES rental_income(rental_income_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AI PREDICTIONS
-- ============================================================
CREATE TABLE ai_predictions (
    prediction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(property_id) ON DELETE CASCADE,
    model_version VARCHAR(50),
    predicted_price NUMERIC(14,2),
    predicted_rental_yield NUMERIC(10,2),
    risk_score NUMERIC(10,2),
    input_features JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(200) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INITIAL ROLE SEEDING
-- ============================================================
INSERT INTO roles(role_id, role_name) VALUES
    (uuid_generate_v4(), 'ADMIN'),
    (uuid_generate_v4(), 'INVESTOR');
