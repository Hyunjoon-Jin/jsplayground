import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Todo {
    id: string;
    title: string;
    description?: string;
    type: string;
    importance: 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed';
    progress: number;
    target_date?: string;
    deadline?: string;
    created_at: string;
    updated_at: string;
}

export const useTodos = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTodos = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: supabaseError } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            if (supabaseError) throw supabaseError;
            setTodos(data || []);
        } catch (err: any) {
            console.error('Error fetching todos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTodos();

        const channel = supabase
            .channel('schema-db-changes-todos')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'todos' },
                () => fetchTodos()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchTodos]);

    return { todos, loading, error, refresh: fetchTodos };
};
