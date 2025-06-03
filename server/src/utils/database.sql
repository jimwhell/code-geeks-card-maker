CREATE DATABASE codegeeks;




CREATE TABLE admin(
    admin_id bool PRIMARY KEY DEFAULT true,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    CONSTRAINT admin_id CHECK (admin_id)
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN 
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = NOW();
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE INSERT OR UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();



CREATE TABLE sessions(
    session_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id bool REFERENCES admin(admin_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sessions
ADD COLUMN is_valid bool DEFAULT true;

CREATE TABLE cards(
    card_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    member_id INT NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members (member_id)
);

CREATE SEQUENCE membership_code_seq START 1;

CREATE TABLE members(
    member_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    student_no VARCHAR(8) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    hau_email VARCHAR(255) NOT NULL,
    program VARCHAR(255) NOT NULL,
    membership_code VARCHAR(5) NOT NULL UNIQUE
);

CREATE OR REPLACE FUNCTION generate_membership_code()
RETURNS TRIGGER AS $$
BEGIN 
    IF NEW.membership_code IS NULL OR NEW.membership_code = '' THEN
        NEW.membership_code := 'CG' || LPAD(nextval('membership_code_seq')::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER membership_code_trigger
    BEFORE INSERT
    ON members
    FOR EACH ROW 
    EXECUTE PROCEDURE generate_membership_code();


SELECT
    *,
    CASE
        WHEN m.card_id IS NULL THEN FALSE
        ELSE TRUE
    END AS has_card
FROM 
    members m
    LEFT JOIN cards c ON c.card_id = m.card_id;
