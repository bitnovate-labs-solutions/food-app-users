-- Temporarily modify the trigger function to set expiry to 1 minute from now
CREATE OR REPLACE FUNCTION set_purchase_item_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiry_date to 1 minute from created_at for testing
    NEW.expiry_date := NEW.created_at + INTERVAL '1 minute';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert a test purchase item that will expire in 1 minute
INSERT INTO purchases (user_id, total_amount, status)
VALUES ('YOUR_USER_ID', 99.99, 'completed')
RETURNING id;

-- Note: After testing, run the following to revert back to 6 months:
-- CREATE OR REPLACE FUNCTION set_purchase_item_expiry_date()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.expiry_date := NEW.created_at + INTERVAL '6 months';
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql; 