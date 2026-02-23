-- TRIGGER ADDITIONNEL : Créer des comptes par défaut pour chaque nouveau profil
CREATE OR REPLACE FUNCTION public.create_default_accounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer le Compte Courant avec un solde de départ pour la démo
  INSERT INTO public.accounts (user_id, type, name, balance, currency, iban)
  VALUES (
    new.id, 
    'checking', 
    'Compte Courant', 
    5000.00, 
    'EUR', 
    'FR76' || floor(random() * 1000000000000000000)::text
  );

  -- Créer le Livret A par défaut
  INSERT INTO public.accounts (user_id, type, name, balance, currency, iban)
  VALUES (
    new.id, 
    'savings', 
    'Livret A', 
    12000.00, 
    'EUR', 
    'FR76' || floor(random() * 1000000000000000000)::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà pour éviter les doublons au ré-exécution
DROP TRIGGER IF EXISTS on_profile_created_create_accounts ON public.profiles;

CREATE TRIGGER on_profile_created_create_accounts
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_accounts();
