import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'Financer2026!';

export async function POST(request) {
    const origin = request.nextUrl.origin;
    try {
        const { password, action, payload } = await request.json();

        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        switch (action) {
            case 'fetchAll': {
                const [authUsersRes, profilesRes, loansRes, cardsRes, txRes, accRes] = await Promise.all([
                    supabaseAdmin.auth.admin.listUsers(),
                    supabaseAdmin.from('profiles').select('*'),
                    supabaseAdmin.from('loans').select('*').order('created_at', { ascending: false }),
                    supabaseAdmin.from('cards').select('*').order('created_at', { ascending: false }),
                    supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false }).limit(200),
                    supabaseAdmin.from('accounts').select('*')
                ]);

                // Merge auth users with profiles
                const profileMap = (profilesRes.data || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
                const mergedUsers = (authUsersRes.data?.users || []).map(au => ({
                    id: au.id,
                    email: au.email,
                    created_at: au.created_at,
                    full_name: profileMap[au.id]?.full_name || au.user_metadata?.full_name || 'Utilisateur',
                    account_status: profileMap[au.id]?.account_status || 'active',
                    ...profileMap[au.id]
                }));

                return NextResponse.json({
                    users: mergedUsers,
                    loans: loansRes.data || [],
                    cards: cardsRes.data || [],
                    transactions: txRes.data || [],
                    accounts: accRes.data || []
                });
            }

            case 'createUser': {
                const { email, password, fullName, initialBalance, country: countryCode } = payload;
                const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true,
                    user_metadata: { full_name: fullName, country: countryCode || 'FR' }
                });
                if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 });

                const userId = authData.user.id;

                // Create profile with country
                await supabaseAdmin.from('profiles').insert([{
                    id: userId,
                    full_name: fullName,
                    country: countryCode || 'FR'
                }]);

                // Determine IBAN/Account prefix based on country
                const { countries } = require('@/config/countries');
                const c = countries.find(x => x.code === (countryCode || 'FR'));
                let finalIban = 'FR76 3000 6000 0102 1234 5678 901'; // Default fallback

                if (c && c.bankingConfig && c.bankingConfig.accountIdFormat) {
                    finalIban = c.bankingConfig.accountIdFormat.replace(/X/g, () => Math.floor(Math.random() * 10));
                }

                // Create primary account
                const { data: accData, error: accErr } = await supabaseAdmin.from('accounts').insert([{
                    user_id: userId,
                    name: (c && c.bankingConfig && c.bankingConfig.accountTypes) ? c.bankingConfig.accountTypes.checking : 'Compte Courant',
                    type: 'checking',
                    balance: initialBalance || 0,
                    currency: c?.currency || 'EUR',
                    iban: finalIban
                }]).select().single();

                if (initialBalance > 0 && accData) {
                    await supabaseAdmin.from('transactions').insert([{
                        account_id: accData.id,
                        user_id: userId,
                        amount: initialBalance,
                        type: 'deposit',
                        description: 'Solde initial (Admin)',
                        date: new Date().toISOString().split('T')[0],
                        status: 'completed',
                        created_at: new Date().toISOString()
                    }]);
                }

                return NextResponse.json({ success: true });
            }

            case 'resetPassword': {
                const { userId, newPassword } = payload;
                const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
                if (error) return NextResponse.json({ error: error.message }, { status: 500 });
                return NextResponse.json({ success: true });
            }

            case 'updateLoan': {
                const { id, status } = payload;

                // Get current loan status and details
                const { data: loan, error: loanErr } = await supabaseAdmin
                    .from('loans')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (loanErr) return NextResponse.json({ error: loanErr.message }, { status: 500 });

                // If approving a pending loan
                if (status === 'active' && loan.status === 'pending_approval') {
                    // 1. Find user's account to credit (primary or first)
                    const { data: accounts, error: accErr } = await supabaseAdmin
                        .from('accounts')
                        .select('*')
                        .eq('user_id', loan.user_id)
                        .order('created_at', { ascending: true });

                    if (accErr || !accounts || accounts.length === 0) {
                        return NextResponse.json({ error: 'Aucun compte trouvé pour cet utilisateur' }, { status: 404 });
                    }

                    const targetAccount = accounts[0]; // Credit the first account

                    // 2. Update balance
                    const newBalance = Number(targetAccount.balance) + Number(loan.amount);
                    const { error: updAccErr } = await supabaseAdmin
                        .from('accounts')
                        .update({ balance: newBalance })
                        .eq('id', targetAccount.id);

                    if (updAccErr) return NextResponse.json({ error: updAccErr.message }, { status: 500 });

                    // 3. Create transaction
                    await supabaseAdmin.from('transactions').insert([{
                        account_id: targetAccount.id,
                        user_id: loan.user_id,
                        amount: loan.amount,
                        type: 'deposit',
                        description: `Déblocage Prêt #${String(loan.id).slice(0, 8)} - ${loan.type}`,
                        date: new Date().toISOString().split('T')[0],
                        status: 'completed',
                        created_at: new Date().toISOString()
                    }]);
                }

                const { error } = await supabaseAdmin.from('loans').update({ status }).eq('id', id);
                if (error) return NextResponse.json({ error: error.message }, { status: 500 });
                return NextResponse.json({ success: true });
            }

            case 'updateCard': {
                const { id, status } = payload;
                const { error } = await supabaseAdmin.from('cards').update({ status }).eq('id', id);
                if (error) return NextResponse.json({ error: error.message }, { status: 500 });
                return NextResponse.json({ success: true });
            }

            case 'deleteCard': {
                const { id } = payload;
                const { error } = await supabaseAdmin.from('cards').delete().eq('id', id);
                if (error) return NextResponse.json({ error: error.message }, { status: 500 });
                return NextResponse.json({ success: true });
            }

            // ═══════════ NEW FEATURES ═══════════

            case 'updateBalance': {
                const { accountId, amount, operation, description } = payload;
                const { data: acc, error: accErr } = await supabaseAdmin.from('accounts').select('*').eq('id', accountId).single();
                if (accErr) return NextResponse.json({ error: accErr.message }, { status: 500 });

                const newBalance = operation === 'credit'
                    ? Number(acc.balance) + Number(amount)
                    : Number(acc.balance) - Number(amount);

                const { error: updErr } = await supabaseAdmin.from('accounts').update({ balance: newBalance }).eq('id', accountId);
                if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

                const { error: txInsErr } = await supabaseAdmin.from('transactions').insert([{
                    account_id: accountId,
                    user_id: acc.user_id,
                    amount: operation === 'credit' ? Number(amount) : -Number(amount),
                    type: operation === 'credit' ? 'deposit' : 'withdrawal',
                    description: description || `Admin ${operation} - ${new Date().toLocaleDateString('fr-FR')}`,
                    date: new Date().toISOString().split('T')[0],
                    status: 'completed',
                    created_at: new Date().toISOString()
                }]);
                if (txInsErr) console.error("Transaction insert error:", txInsErr);

                return NextResponse.json({ success: true, newBalance });
            }


            case 'getUserDetails': {
                const { userId } = payload;
                const [profile, accs, userLoans, userCards, userTx] = await Promise.all([
                    supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
                    supabaseAdmin.from('accounts').select('*').eq('user_id', userId),
                    supabaseAdmin.from('loans').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                    supabaseAdmin.from('cards').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                    supabaseAdmin.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
                ]);
                return NextResponse.json({
                    profile: profile.data,
                    accounts: accs.data || [],
                    loans: userLoans.data || [],
                    cards: userCards.data || [],
                    transactions: userTx.data || []
                });
            }

            case 'deleteUser': {
                const { userId } = payload;
                await Promise.all([
                    supabaseAdmin.from('transactions').delete().eq('user_id', userId),
                    supabaseAdmin.from('loans').delete().eq('user_id', userId),
                    supabaseAdmin.from('cards').delete().eq('user_id', userId),
                    supabaseAdmin.from('notifications').delete().eq('user_id', userId),
                    supabaseAdmin.from('goals').delete().eq('user_id', userId),
                    supabaseAdmin.from('investments').delete().eq('user_id', userId),
                    supabaseAdmin.from('beneficiaries').delete().eq('user_id', userId),
                ]);
                await supabaseAdmin.from('accounts').delete().eq('user_id', userId);
                await supabaseAdmin.from('profiles').delete().eq('id', userId);
                await supabaseAdmin.auth.admin.deleteUser(userId);
                return NextResponse.json({ success: true });
            }

            case 'updateTransfer': {
                const { id, status } = payload;
                const { data: tx, error: txErr } = await supabaseAdmin.from('transactions').select('*').eq('id', id).single();
                if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });

                if (status === 'completed') {
                    // Effective deduction from balance
                    const { data: acc, error: accErr } = await supabaseAdmin.from('accounts').select('balance').eq('id', tx.account_id).single();
                    if (accErr) return NextResponse.json({ error: accErr.message }, { status: 500 });

                    const newBalance = Number(acc.balance) + Number(tx.amount); // tx.amount is already negative for outgoing
                    if (newBalance < 0) return NextResponse.json({ error: 'Fonds insuffisants sur le compte' }, { status: 500 });

                    const { error: updAccErr } = await supabaseAdmin.from('accounts').update({ balance: newBalance }).eq('id', tx.account_id);
                    if (updAccErr) return NextResponse.json({ error: updAccErr.message }, { status: 500 });
                }

                const { error: updTxErr } = await supabaseAdmin.from('transactions').update({ status }).eq('id', id);
                if (updTxErr) return NextResponse.json({ error: updTxErr.message }, { status: 500 });

                return NextResponse.json({ success: true });
            }

            case 'updateProfile': {
                const { userId, updates } = payload;
                const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId);
                if (error) return NextResponse.json({ error: error.message }, { status: 500 });
                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (err) {
        console.error('Admin API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
