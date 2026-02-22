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
    todo_id?: string;
    is_all_day: boolean;
    is_time_not_set: boolean;
}

export const useSchedules = (currentDate: Date, view: 'month' | 'week' | 'day') => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Get filter params
        const fType = searchParams.get('f_type');
        const fImportance = searchParams.get('f_importance');
        const fAppt = searchParams.get('f_appt') === 'true';
        const fMeet = searchParams.get('f_meet') === 'true';

        let start: Date;
        let end: Date;

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

            // Apply Filters
            if (fType && fType !== 'all') {
                query = query.eq('type', fType);
            }
            if (fImportance && fImportance !== 'all') {
                query = query.eq('importance', fImportance);
            }
            if (fAppt) {
                query = query.eq('is_appointment', true);
            }
            if (fMeet) {
                query = query.eq('is_meeting', true);
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
    }, [currentDate, view, searchParams.toString()]);

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
