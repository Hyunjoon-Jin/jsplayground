'use client';

import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    Search as SearchIcon,
    Filter,
    Plus,
    Target,
    Flag,
    CheckCircle2,
    Circle,
    Clock,
    ChevronRight,
    LayoutGrid,
    ListFilter
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTodos, Todo } from '@/hooks/useTodos';
import TodoModal from '@/components/schedule/TodoModal';

export default function TasksPage() {
    const { todos, loading, refresh } = useTodos();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [importanceFilter, setImportanceFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

    const filteredTodos = useMemo(() => {
        return todos.filter(todo => {
            const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || todo.status === statusFilter;
            const matchesImportance = importanceFilter === 'all' || todo.importance === importanceFilter;

            return matchesSearch && matchesStatus && matchesImportance;
        });
    }, [todos, searchQuery, statusFilter, importanceFilter]);

    const handleSave = async (data: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (data.id) {
            const { error } = await supabase
                .from('todos')
                .update(data)
                .eq('id', data.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('todos')
                .insert({ ...data, user_id: user.id });
            if (error) throw error;
        }
        refresh();
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);
        if (error) throw error;
        refresh();
    };

    const getDDay = (dateStr: string) => {
        const diff = differenceInDays(parseISO(dateStr), new Date());
        if (diff === 0) return 'D-Day';
        return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
    };

    const importanceLabel: any = {
        high: { text: '높음', color: 'var(--error)' },
        medium: { text: '보통', color: 'var(--warning)' },
        low: { text: '낮음', color: 'var(--success)' }
    };

    if (loading) return <div className="loading-container flex-center">데이터를 불러오는 중...</div>;

    return (
        <div className="tasks-page">
            <header className="tasks-header">
                <div className="header-top">
                    <h1 className="page-title">할 일 관리</h1>
                    <button className="add-task-btn shadow-glow" onClick={() => { setSelectedTodo(null); setIsModalOpen(true); }}>
                        <Plus size={20} />
                        <span>새 할 일</span>
                    </button>
                </div>

                <div className="search-row">
                    <div className="search-bar shadow-sm">
                        <SearchIcon size={18} className="search-icon" />
                        <input
                            placeholder="할 일을 검색해보세요"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-scroll">
                    <div className="filter-chips">
                        {['all', 'pending', 'in_progress', 'completed'].map(s => (
                            <button
                                key={s}
                                className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
                                onClick={() => setStatusFilter(s)}
                            >
                                {s === 'all' ? '전체' : s === 'pending' ? '대기' : s === 'in_progress' ? '진행 중' : '완료'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="tasks-content">
                <div className="stats-cards">
                    <div className="stat-card glass shadow-sm">
                        <span className="stat-label">진행 중</span>
                        <span className="stat-value">{todos.filter(t => t.status === 'in_progress').length}</span>
                    </div>
                    <div className="stat-card glass shadow-sm">
                        <span className="stat-label">오늘 마감</span>
                        <span className="stat-value">{todos.filter(t => t.deadline === format(new Date(), 'yyyy-MM-dd')).length}</span>
                    </div>
                    <div className="stat-card glass shadow-sm">
                        <span className="stat-label">완료됨</span>
                        <span className="stat-value">{todos.filter(t => t.status === 'completed').length}</span>
                    </div>
                </div>

                <div className="todo-list">
                    {filteredTodos.length > 0 ? (
                        filteredTodos.map(todo => (
                            <div key={todo.id} className="todo-item glass shadow-sm clickable" onClick={() => { setSelectedTodo(todo); setIsModalOpen(true); }}>
                                <div className="todo-header">
                                    <div className="todo-type-tag">[{todo.type}]</div>
                                    <div className={`todo-importance ${todo.importance}`} style={{ color: importanceLabel[todo.importance].color }}>
                                        <Flag size={12} fill="currentColor" />
                                        {importanceLabel[todo.importance].text}
                                    </div>
                                    {todo.deadline && (
                                        <div className="todo-d-day">{getDDay(todo.deadline)}</div>
                                    )}
                                </div>

                                <h3 className="todo-title">{todo.title}</h3>
                                {todo.description && <p className="todo-desc">{todo.description}</p>}

                                <div className="todo-progress-section">
                                    <div className="progress-info">
                                        <span className="progress-label">진행률</span>
                                        <span className="progress-percent">{todo.progress}%</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" style={{ width: `${todo.progress}%` }} />
                                    </div>
                                </div>

                                <div className="todo-footer">
                                    <div className="todo-dates">
                                        {todo.target_date && (
                                            <div className="date-item">
                                                <Target size={12} />
                                                {format(parseISO(todo.target_date), 'MM.dd(eee)', { locale: ko })}
                                            </div>
                                        )}
                                        {todo.deadline && (
                                            <div className="date-item deadline">
                                                <Clock size={12} />
                                                ~{format(parseISO(todo.deadline), 'MM.dd(eee)', { locale: ko })}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`status-badge ${todo.status}`}>
                                        {todo.status === 'completed' ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                        {todo.status === 'pending' ? '대기' : todo.status === 'in_progress' ? '진행 중' : '완료'}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <LayoutGrid size={48} />
                            <p>관리할 할 일이 없습니다.</p>
                        </div>
                    )}
                </div>
            </main>

            <TodoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                initialData={selectedTodo}
            />

            <style jsx>{`
                .tasks-page {
                    padding: 24px 20px;
                    padding-bottom: 120px;
                    background: var(--bg-base);
                    min-height: 100vh;
                }

                .tasks-header { margin-bottom: 24px; }
                
                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .page-title { font-size: var(--text-lg); font-weight: 800; }

                .add-task-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: var(--accent-primary);
                    color: var(--text-inverse);
                    padding: 10px 16px;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    font-size: var(--text-sm);
                }

                .search-bar {
                    background: var(--bg-elevated);
                    border-radius: var(--radius-lg);
                    padding: 14px 18px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    border: 1px solid var(--border-subtle);
                }

                .search-bar input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: var(--text-sm);
                }

                .filter-scroll {
                    overflow-x: auto;
                    padding-bottom: 4px;
                    margin: 0 -20px;
                    padding-left: 20px;
                    scrollbar-width: none;
                }
                .filter-scroll::-webkit-scrollbar { display: none; }

                .filter-chips { display: flex; gap: 8px; }

                .filter-chip {
                    padding: 8px 16px;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-default);
                    border-radius: var(--radius-md);
                    font-size: var(--text-xs);
                    font-weight: 700;
                    color: var(--text-muted);
                    white-space: nowrap;
                    transition: all 0.2s;
                }

                .filter-chip.active {
                    background: var(--text-primary);
                    color: var(--text-inverse);
                    border-color: var(--text-primary);
                }

                .stats-cards {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    padding: 16px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    text-align: center;
                }

                .stat-label { font-size: var(--text-xs); font-weight: 700; color: var(--text-muted); }
                .stat-value { font-size: var(--text-md); font-weight: 800; color: var(--accent-primary); }

                .todo-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .todo-item {
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    text-align: left;
                }

                .todo-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .todo-type-tag { font-size: var(--text-xs); font-weight: 700; opacity: 0.6; }

                .todo-importance {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: var(--text-xs);
                    font-weight: 800;
                    padding: 2px 8px;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 6px;
                }

                .todo-d-day {
                    margin-left: auto;
                    font-size: var(--text-xs);
                    font-weight: 900;
                    color: var(--error);
                    background: var(--error-bg);
                    padding: 2px 8px;
                    border-radius: 6px;
                }

                .todo-title { font-size: var(--text-md); font-weight: 800; color: var(--text-primary); margin-bottom: 6px; }
                .todo-desc { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: 16px; line-height: 1.5; }

                .todo-progress-section { margin-bottom: 16px; }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                }
                .progress-label { font-size: var(--text-xs); font-weight: 700; color: var(--text-muted); }
                .progress-percent { font-size: var(--text-xs); font-weight: 800; color: var(--accent-primary); }

                .progress-bar-bg {
                    height: 8px;
                    background: var(--border-subtle);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: var(--accent-primary);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .todo-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 14px;
                    border-top: 1px dashed var(--border-default);
                }

                .todo-dates { display: flex; gap: 12px; }
                .date-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: var(--text-xs);
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .date-item.deadline { color: var(--text-secondary); }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: var(--text-xs);
                    font-weight: 800;
                }
                .status-badge.pending { color: var(--text-muted); }
                .status-badge.in_progress { color: var(--accent-primary); }
                .status-badge.completed { color: var(--success); }

                .empty-state {
                    padding: 60px 0;
                    text-align: center;
                    color: var(--border-default);
                }

                .loading-container { min-height: 100vh; color: var(--text-muted); }
            `}</style>
        </div>
    );
}
