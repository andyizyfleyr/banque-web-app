import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const userId = formData.get('userId');
        const documentType = formData.get('documentType');

        if (!file || !userId) {
            return NextResponse.json({ error: 'Fichier ou utilisateur manquant' }, { status: 400 });
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `kyc_${userId}_${documentType}_${Date.now()}.${fileExt}`;

        // On utilise le bucket 'avatars' puisque c'est celui qui existe, 
        // avec la clé root (service_role) qui ignore de force RLS.
        const filePath = `kyc_documents/${fileName}`;

        const { data, error } = await supabaseAdmin.storage
            .from('avatars')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error("Admin upload error:", error);
            throw error;
        }

        // Mettre à jour virtuellement l'utilisateur dans 'profiles' (exemple)
        // await supabaseAdmin.from('profiles').update({ kyc_status: 'pending' }).eq('id', userId);

        return NextResponse.json({ success: true, path: filePath });
    } catch (error) {
        console.error("API Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
