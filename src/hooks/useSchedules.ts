import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    startOfDay,
    endOfDay
} from 'date-fns';

export interface Schedule {
    id: string;
    title: string;
    description?: string;
    type: '미팅' | '회의' | '업무보고' | '운동' | '식사' | '명상' | '약속' | '병원' | '쇼핑' | '자기개발' | '강의' | '독서' | '기타';
    importance: 'high' | 'medium' | 'low';
    is_appointment: boolean;
    is_meeting: boolean;
    start_time: string;
    end_time: string;
    color?: string;
    is_recurring: boolean;
    recurring_id?: string;
}

export const useSchedules = (currentDate: Date, view: 'month' | 'week' | 'day') => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        setError(null);

        let start: Date;
        let end: Date;

        // 뷰 타입에 따라 조회 범위 설정 (Padded for safety)
        if (view === 'month') {
            start = startOfWeek(startOfMonth(currentDate));
            end = endOfWeek(endOfMonth(currentDate));
        } else if (view === 'week') {
            start = startOfWeek(currentDate);
            end = endOfWeek(currentDate);
        } else {
            start = startOfDay(currentDate);
            end = endOfDay(currentDate);
        }

        try {
            let query = supabase
                .from('schedules')
                .select('*')
                .gte('start_time', start.toISOString())
                .lte('start_time', end.toISOString())
                .order('start_time', { ascending: true });

            // 월간 뷰에서는 약속/회의만 필터링 (요구사항)
            if (view === 'month') {
                query = query.or('is_appointment.eq.true,is_meeting.eq.true');
            }

            const { data, error: supabaseError } = await query;

            if (supabaseError) throw supabaseError;
            setSchedules(data || []);
        } catch (err: any) {
            console.error('Error fetching schedules:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentDate, view]);

    useEffect(() => {
        fetchSchedules();

        // 리얼타임 구독 (선택 사항)
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'schedules' },
                () => fetchSchedules()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchSchedules]);

    return { schedules, loading, error, refresh: fetchSchedules };
};
