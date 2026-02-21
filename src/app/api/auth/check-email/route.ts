import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    // Check if email exists in user_profiles
    const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Email check error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ exists: !!data });
}
