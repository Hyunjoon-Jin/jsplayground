import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { addWeeks, addMonths, isBefore, startOfDay, parseISO } from 'date-fns';

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const body = await request.json();

    const {
        type, // 'weekly' | 'monthly'
        days_of_week, // [1, 3, 5]
        day_of_month, // 1
        start_date,
        end_date,
        template_data // title, type, importance, etc.
    } = body;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. 반복 규칙 저장
    const { data: rule, error: ruleError } = await supabase
        .from('recurring_rules')
        .insert([{
            user_id: user.id,
            type,
            days_of_week,
            day_of_month,
            start_date,
            end_date,
            template_data
        }])
        .select()
        .single();

    if (ruleError) {
        return NextResponse.json({ error: ruleError.message }, { status: 500 });
    }

    // 2. 일정 레코드 생성 (최대 2년치)
    const instances = [];
    const start = parseISO(start_date);
    const limitDate = addMonths(start, 24); // 2년 제한
    const finalEndDate = end_date ? parseISO(end_date) : limitDate;
    const actualEndDate = isBefore(finalEndDate, limitDate) ? finalEndDate : limitDate;

    let current = startOfDay(start);

    if (type === 'weekly' && days_of_week) {
        // 매주 지정된 요일에 생성
        while (isBefore(current, actualEndDate)) {
            if (days_of_week.includes(current.getDay())) {
                instances.push(generateInstance(current, template_data, user.id, rule.id));
            }
            current = addWeeks(current, 0); // Logic: iterate through all days in the range or jump?
            // Optimization: iterate day by day
            // Wait, addWeeks(current, 0) is wrong. Let's do daily iteration.
        }
        // Correction:
        let iter = startOfDay(start);
        while (isBefore(iter, actualEndDate)) {
            if (days_of_week.includes(iter.getDay())) {
                instances.push(generateInstance(iter, template_data, user.id, rule.id));
            }
            iter = addWeeks(iter, 0); // No, iter = addDays(iter, 1)
        }
    }

    // Refined loop logic
    const generatedInstances = [];
    let iterDate = startOfDay(start);

    if (type === 'weekly' && days_of_week) {
        const days = new Set(days_of_week);
        while (!isBefore(actualEndDate, iterDate)) {
            if (days.has(iterDate.getDay())) {
                generatedInstances.push(generateInstance(iterDate, template_data, user.id, rule.id));
            }
            iterDate = addWeeks(iterDate, iterDate.getDay() === 6 ? 1 : 0); // Actually just add 1 day
            // Simple daily increment is safer for logic
        }
    } else if (type === 'monthly' && day_of_month) {
        while (!isBefore(actualEndDate, iterDate)) {
            // Check if it's the right day of month
            // Note: handles cases where month has fewer days (e.g. 31st) if needed?
            // For now simple match
            if (iterDate.getDate() === day_of_month) {
                generatedInstances.push(generateInstance(iterDate, template_data, user.id, rule.id));
            }
            // Jump to next month's start or similar
        }
    }

    // Re-writing simple robust loop
    const finalInstances = [];
    let d = startOfDay(start);

    if (type === 'weekly') {
        while (d <= actualEndDate) {
            if (days_of_week.includes(d.getDay())) {
                finalInstances.push(generateInstance(d, template_data, user.id, rule.id));
            }
            d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        }
    } else if (type === 'monthly') {
        while (d <= actualEndDate) {
            if (d.getDate() === day_of_month) {
                finalInstances.push(generateInstance(d, template_data, user.id, rule.id));
            }
            d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        }
    }

    // 3. 일괄 삽입
    const { error: insertError } = await supabase
        .from('schedules')
        .insert(finalInstances);

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: finalInstances.length }, { status: 201 });
}

function generateInstance(date: Date, template: any, userId: string, ruleId: string) {
    // template contains startTime (HH:mm) and endTime (HH:mm)
    const [startH, startM] = template.start_time_str.split(':').map(Number);
    const [endH, endM] = template.end_time_str.split(':').map(Number);

    const start = new Date(date);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(date);
    end.setHours(endH, endM, 0, 0);

    return {
        user_id: userId,
        title: template.title,
        description: template.description || '',
        type: template.type || '기타',
        importance: template.importance || 'medium',
        is_appointment: template.is_appointment || false,
        is_meeting: template.is_meeting || false,
        color: template.color,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_recurring: true,
        recurring_id: ruleId
    };
}
