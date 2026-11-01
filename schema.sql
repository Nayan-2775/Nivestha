
-- ============================================================
-- NIVESTHA - CLOUD DATABASE SCHEMA
-- PostgreSQL
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 2. ENUM TYPES
-- ============================================================

CREATE TYPE kyc_status_type AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'investment',
    'rental_income'
);

CREATE TYPE property_status AS ENUM (
    'open',
    'closed',
    'sold'
);


-- ============================================================
-- 3. USERS & ROLE MANAGEMENT
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
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);


-- ============================================================
-- 4. WALLETS
-- ============================================================

CREATE TABLE wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 5. PROPERTIES
-- ============================================================

CREATE TABLE properties (
    property_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    total_value NUMERIC(14,2) NOT NULL CHECK (total_value > 0),
    total_shares INT NOT NULL CHECK (total_shares > 0),
    available_shares INT NOT NULL CHECK (available_shares >= 0),
    status property_status DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (available_shares <= total_shares)
);


-- ============================================================
-- 6. TRANSACTIONS
-- Created AFTER properties because of its foreign key.
-- ============================================================

CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(property_id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 7. PROPERTY IMAGES
-- ============================================================

CREATE TABLE property_images (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 8. INVESTMENTS
-- ============================================================

CREATE TABLE investments (
    investment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    shares INT NOT NULL CHECK (shares > 0),
    amount_invested NUMERIC(14,2) NOT NULL CHECK (amount_invested > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, property_id)
);


-- ============================================================
-- 9. RENTAL INCOME
-- ============================================================

CREATE TABLE rental_income (
    rental_income_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    period_month DATE NOT NULL,
    total_rent NUMERIC(14,2) NOT NULL CHECK (total_rent >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(property_id, period_month)
);


-- ============================================================
-- 10. RENTAL DISTRIBUTIONS
-- ============================================================

CREATE TABLE rental_distributions (
    distribution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_income_id UUID NOT NULL REFERENCES rental_income(rental_income_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 11. AI PREDICTIONS
-- ============================================================

CREATE TABLE ai_predictions (
    prediction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    model_version VARCHAR(50),
    predicted_price NUMERIC(14,2),
    predicted_rental_yield NUMERIC(10,2),
    risk_score NUMERIC(10,2) CHECK (
        risk_score IS NULL OR risk_score BETWEEN 1 AND 10
    ),
    input_features JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 12. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 13. AUDIT LOGS
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
-- 14. INITIAL ROLE SEEDING
-- ============================================================

INSERT INTO roles (role_name)
VALUES
    ('ADMIN'),
    ('INVESTOR')
ON CONFLICT (role_name) DO NOTHING;


-- ============================================================
-- 15. FOREIGN KEY INDEXES
-- ============================================================

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_property ON transactions(property_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);

CREATE INDEX idx_property_images_property ON property_images(property_id);

CREATE INDEX idx_investments_user ON investments(user_id);
CREATE INDEX idx_investments_property ON investments(property_id);

CREATE INDEX idx_rental_income_property ON rental_income(property_id);

CREATE INDEX idx_rental_distributions_income ON rental_distributions(rental_income_id);
CREATE INDEX idx_rental_distributions_user ON rental_distributions(user_id);
CREATE INDEX idx_rental_distributions_wallet ON rental_distributions(wallet_id);

CREATE INDEX idx_ai_predictions_property ON ai_predictions(property_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);


-- ============================================================
-- END OF NIVESTHA DATABASE SCHEMA
-- ============================================================
