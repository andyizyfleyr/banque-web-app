-- 1. Mettre à jour la table des cartes avec les nouvelles colonnes si elles manquent
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS last_4 TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS expiry TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS holder_name TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS is_physical BOOLEAN DEFAULT false;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS delivery_address JSONB;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS controls JSONB DEFAULT '{"contactless": true, "international": true, "online": true, "atm": true}'::jsonb;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{"daily": 5000, "weekly": 15000, "monthly": 30000}'::jsonb;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;

-- Adapter ou remplacer card_number / expiry_date si on utilise last_4 et expiry
-- Adapter ou remplacer card_number / expiry_date (Uniquement si elles existent)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cards' AND column_name='card_number') THEN
        ALTER TABLE public.cards ALTER COLUMN card_number DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cards' AND column_name='expiry_date') THEN
        ALTER TABLE public.cards ALTER COLUMN expiry_date DROP NOT NULL;
    END IF;
END $$;

-- 2. Créer la fonction (RPC) pour commander une carte
CREATE OR REPLACE FUNCTION public.order_new_card(
    p_user_id UUID,
    p_card_type TEXT,
    p_last_4 TEXT,
    p_expiry TEXT,
    p_holder_name TEXT,
    p_is_physical BOOLEAN,
    p_delivery_address JSONB,
    p_price DECIMAL,
    p_currency TEXT
)
RETURNS VOID AS $$
DECLARE
    v_account_id UUID;
    v_balance DECIMAL;
BEGIN
    -- 1. Trouver un compte avec un solde suffisant pour payer
    SELECT id, balance INTO v_account_id, v_balance
    FROM public.accounts
    WHERE user_id = p_user_id AND balance >= p_price
    ORDER BY balance DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solde insuffisant dans vos comptes pour commander cette carte.';
    END IF;

    -- 2. Débiter le compte si le prix est > 0
    IF p_price > 0 THEN
        UPDATE public.accounts
        SET balance = balance - p_price
        WHERE id = v_account_id;

        -- Ajouter la transaction
        INSERT INTO public.transactions (account_id, amount, type, description, category, status)
        VALUES (v_account_id, -p_price, 'payment', 'Frais d''émission carte ' || p_card_type, 'Frais bancaires', 'completed');
    END IF;

    -- 3. Insérer la nouvelle carte
    INSERT INTO public.cards (
        user_id,
        type,
        last_4,
        expiry,
        holder_name,
        is_physical,
        delivery_address,
        currency,
        status,
        controls,
        limits,
        linked_account_id
    ) VALUES (
        p_user_id,
        p_card_type,
        p_last_4,
        p_expiry,
        p_holder_name,
        p_is_physical,
        p_delivery_address,
        p_currency,
        'active',
        '{"contactless": true, "international": true, "online": true, "atm": true}'::jsonb,
        '{"daily": 5000, "weekly": 15000, "monthly": 30000}'::jsonb,
        v_account_id -- Link default account to the new card
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
