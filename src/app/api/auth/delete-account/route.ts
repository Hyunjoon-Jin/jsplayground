import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const supabaseServer = createServerClient();

    // 1. 현재 사용자 확인
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 서비스 롤 클라이언트 생성 (Admin 권한)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return NextResponse.json({ error: 'Server configuration error: Service Role Key is missing.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // 3. 사용자 삭제 (auth.users에서 삭제하면 user_profiles는 CASCADE 설정에 의해 자동 삭제되거나, 
    // 혹은 직접 삭제해 줘야 함. 현재 schema.sql상 user_profiles의 id는 auth.users를 참조 중)

    // 먼저 프로필 삭제 시도 (선택 사항, RLS 정책에 따라 가능할 수도 있음)
    // 하지만 Admin 권한으로 auth.users를 삭제하는 것이 가장 확실함.

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. 세션 로그아웃 (서버 측에서도 세션 무효화 시도 - 사실 삭제되었으므로 의미는 적지만 안전을 위해)
    await supabaseServer.auth.signOut();

    return NextResponse.json({ success: true, message: 'Account deleted successfully.' });
}
