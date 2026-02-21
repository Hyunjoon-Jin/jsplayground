import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const view = searchParams.get('view'); // 'month' | 'week' | 'day'

    if (!start || !end) {
        return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', start)
        .lte('start_time', end)
        .order('start_time', { ascending: true });

    // 월간 뷰 필터링: 회의나 약속인 것만 (요구사항)
    if (view === 'month') {
        query = query.or('is_appointment.eq.true,is_meeting.eq.true');
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const body = await request.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('schedules')
        .insert([{ ...body, user_id: user.id }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('schedules')
        .update(body)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
}
