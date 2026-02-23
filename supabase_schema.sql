-- 1. Table des PROFILES (établit le lien avec auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des ACCOUNTS (comptes bancaires)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('checking', 'savings', 'investment')),
  name TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'EUR',
  iban TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT CHECK (type IN ('transfer', 'payment', 'deposit')),
  description TEXT,
  category TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed'))
);

-- 4. Table des CARDS (cartes bancaires)
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  spending_limit DECIMAL(15,2) DEFAULT 2000.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table des LOANS (prêts)
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  remaining_balance DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid', 'pending_approval')),
  type TEXT,
  monthly_income DECIMAL(15,2),
  professional_situation TEXT,
  housing_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policies for loans
DROP POLICY IF EXISTS "Users can view own loans" ON loans;
CREATE POLICY "Users can view own loans" ON loans FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own loans" ON loans;
CREATE POLICY "Users can insert own loans" ON loans FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own loans" ON loans;
CREATE POLICY "Users can update own loans" ON loans FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own loans" ON loans;
CREATE POLICY "Users can delete own loans" ON loans FOR DELETE USING (auth.uid() = user_id);

-- 6. Table des BENEFICIARIES (bénéficiaires pour virements)
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  iban TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVATION DE RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- POLITIQUES RLS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (
  account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (
  account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view own cards" ON cards;
CREATE POLICY "Users can view own cards" ON cards FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own cards" ON cards;
CREATE POLICY "Users can insert own cards" ON cards FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own cards" ON cards;
CREATE POLICY "Users can update own cards" ON cards FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own loans" ON loans;
CREATE POLICY "Users can view own loans" ON loans FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own loans" ON loans;
CREATE POLICY "Users can insert own loans" ON loans FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own loans" ON loans;
CREATE POLICY "Users can update own loans" ON loans FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own loans" ON loans;
CREATE POLICY "Users can delete own loans" ON loans FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own beneficiaries" ON beneficiaries;
CREATE POLICY "Users can view own beneficiaries" ON beneficiaries FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own beneficiaries" ON beneficiaries;
CREATE POLICY "Users can insert own beneficiaries" ON beneficiaries FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own beneficiaries" ON beneficiaries;
CREATE POLICY "Users can delete own beneficiaries" ON beneficiaries FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own beneficiaries" ON beneficiaries;
CREATE POLICY "Users can manage own beneficiaries" ON beneficiaries FOR ALL USING (auth.uid() = user_id);

-- TRIGGER : Créer automatiquement un profil lors de l'inscription (Sign Up)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. FONCTION DE VIREMENT SÉCURISÉ (RPC)
CREATE OR REPLACE FUNCTION transfer_funds(
    sender_account_id UUID,
    receiver_account_id UUID,
    amount_to_transfer DECIMAL,
    description_text TEXT
)
RETURNS VOID AS $$
DECLARE
    sender_balance DECIMAL;
BEGIN
    -- 1. Vérifier le solde de l'émetteur (Lock row for update)
    SELECT balance INTO sender_balance 
    FROM accounts 
    WHERE id = sender_account_id 
    FOR UPDATE;

    IF sender_balance < amount_to_transfer THEN
        RAISE EXCEPTION 'Solde insuffisant pour effectuer ce virement.';
    END IF;

    -- 2. Débiter l'émetteur
    UPDATE accounts 
    SET balance = balance - amount_to_transfer 
    WHERE id = sender_account_id;

    -- 3. Créditer le destinataire
    UPDATE accounts 
    SET balance = balance + amount_to_transfer 
    WHERE id = receiver_account_id;

    -- 4. Journaliser la transaction (Débit)
    INSERT INTO transactions (account_id, amount, type, description, category, status)
    VALUES (sender_account_id, -amount_to_transfer, 'transfer', description_text, 'Virement Sortant', 'completed');

    -- 5. Journaliser la transaction (Crédit)
    INSERT INTO transactions (account_id, amount, type, description, category, status)
    VALUES (receiver_account_id, amount_to_transfer, 'transfer', description_text, 'Virement Entrant', 'completed');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
