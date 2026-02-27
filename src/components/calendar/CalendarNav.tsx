'use client';

import { Suspense, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, ChevronDown, SlidersHorizontal, Check } from 'lucide-react';
import Link from 'next/link';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import ScheduleModal from '@/components/schedule/ScheduleModal';
import DatePickerModal from './DatePickerModal';

function NavContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const dateParam = searchParams.get('date');
    const filterParam = searchParams.get('filter') === 'appointment';
    const currentDate = dateParam ? parseISO(dateParam) : new Date();

    // Robust view detection
    const view = pathname.includes('/week') ? 'week'
        : pathname.includes('/day') ? 'day'
            : 'month';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);
    const [initialTimes, setInitialTimes] = useState<{ start: string; end: string } | null>(null);

    useEffect(() => {
        const handleEditSchedule = (e: any) => {
            setInitialTimes(null);
            setEditingData(e.detail);
            setIsModalOpen(true);
        };

        const handleCreateSchedule = (e: any) => {
            setEditingData(null);
            setInitialTimes(e.detail);
            setIsModalOpen(true);
        };

        window.addEventListener('edit-schedule', handleEditSchedule);
        window.addEventListener('create-schedule', handleCreateSchedule);
        return () => {
            window.removeEventListener('edit-schedule', handleEditSchedule);
            window.removeEventListener('create-schedule', handleCreateSchedule);
        };
    }, []);

    const updateFilterParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === 'all') params.delete(key);
            else params.set(key, value);
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    const updateParams = (newDate?: Date) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newDate) params.set('date', format(newDate, 'yyyy-MM-dd'));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePrev = () => {
        if (view === 'month') updateParams(subMonths(currentDate, 1));
        else if (view === 'week') updateParams(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
        else updateParams(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    };

    const handleNext = () => {
        if (view === 'month') updateParams(addMonths(currentDate, 1));
        else if (view === 'week') updateParams(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
        else updateParams(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    };


    const handleSave = async (data: any) => {
        if (data.id) {
            await handleUpdate(data);
            return;
        }

        const endpoint = data.is_recurring ? '/api/recurring' : '/api/schedules';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data.is_recurring ? {
                type: data.recurringConfig.type,
                days_of_week: data.recurringConfig.days || [1],
                day_of_month: parseInt(format(parseISO(data.start_time), 'd')),
                start_date: format(parseISO(data.start_time), 'yyyy-MM-dd'),
                template_data: {
                    title: data.title,
                    description: data.description,
                    type: data.type,
                    importance: data.importance,
                    is_appointment: data.is_appointment,
                    is_meeting: data.is_meeting,
                    start_time_str: format(parseISO(data.start_time), 'HH:mm'),
                    end_time_str: format(parseISO(data.end_time), 'HH:mm'),
                }
            } : data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save');
        }
        router.refresh();
    };

    const handleUpdate = async (data: any) => {
        const response = await fetch(`/api/schedules?id=${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update');
        }
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        const response = await fetch(`/api/schedules?id=${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete');
        }
        router.refresh();
    };

    const viewLabels: Record<string, string> = {
        month: '월간 보기',
        week: '주간 보기',
        day: '일간 보기'
    };

    const getDateLabel = () => {
        if (view === 'month') {
            return format(currentDate, 'yyyy년 M월', { locale: ko });
        } else if (view === 'week') {
            const start = new Date(currentDate.getTime() - currentDate.getDay() * 24 * 60 * 60 * 1000);
            const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
            return `${format(start, 'M월 d일')} - ${format(end, 'M월 d일')}`;
        } else {
            return format(currentDate, 'yyyy년 M월 d일 (E)', { locale: ko });
        }
    };

    const isFullPage = pathname === '/calendar/profile' || pathname === '/calendar/tasks';
    const viewOptions = ['month', 'week', 'day'] as const;
    const viewIndex = viewOptions.indexOf(view as any);

    return (
        <div className="calendar-root">
            {!isFullPage && (
                <header className="new-header">
                    <div className="header-top-centered">
                        <button onClick={handlePrev} className="nav-arrow-btn" aria-label="이전 날짜로 이동">
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            className="display-date-btn"
                            onClick={() => setIsDatePickerOpen(true)}
                        >
                            <h1 className="display-date">
                                {getDateLabel()}
                            </h1>
                        </button>
                        <button onClick={handleNext} className="nav-arrow-btn" aria-label="다음 날짜로 이동">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="header-bottom-centered">
                        <div className="view-toggle-segment">
                            <div
                                className="segment-highlighter"
                                style={{ transform: `translateX(${viewIndex * 100}%)` }}
                            />
                            {viewOptions.map((v) => {
                                return (
                                    <Link
                                        key={v}
                                        href={`/calendar/${v}?date=${format(currentDate, 'yyyy-MM-dd')}`}
                                        className={`segment-btn ${view === v ? 'active' : ''}`}
                                    >
                                        {viewLabels[v].replace(' 보기', '')}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="header-actions">
                        <div className="filter-system">
                            <button
                                className={`filter-trigger-btn ${isFilterPanelOpen ? 'active' : ''}`}
                                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                            >
                                <SlidersHorizontal size={18} />
                                <span>필터링</span>
                                <ChevronDown size={14} className={`arrow ${isFilterPanelOpen ? 'rotated' : ''}`} />
                            </button>

                            {isFilterPanelOpen && (
                                <>
                                    <div className="filter-overlay" onClick={() => setIsFilterPanelOpen(false)} />
                                    <div className="filter-dropdown-panel shadow-premium">
                                        <div className="filter-group">
                                            <label>일정 유형</label>
                                            <div className="filter-options-grid">
                                                {['all', '미팅', '회의', '업무보고', '운동', '식사', '약속', '자기개발', '기타'].map(t => (
                                                    <button
                                                        key={t}
                                                        className={`option-chip ${(searchParams.get('f_type') || 'all') === t ? 'selected' : ''}`}
                                                        onClick={() => updateFilterParams({ f_type: t })}
                                                    >
                                                        {t === 'all' ? '전체' : t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="filter-group">
                                            <label>중요도</label>
                                            <div className="filter-options-row">
                                                {['all', 'high', 'medium', 'low'].map(v => (
                                                    <button
                                                        key={v}
                                                        className={`option-chip ${(searchParams.get('f_importance') || 'all') === v ? 'selected' : ''}`}
                                                        onClick={() => updateFilterParams({ f_importance: v })}
                                                    >
                                                        {v === 'all' ? '전체' : v === 'high' ? '높음' : v === 'medium' ? '보통' : '낮음'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="filter-group no-border">
                                            <label>상태 필터</label>
                                            <div className="status-filter-row">
                                                <button
                                                    className={`status-btn ${searchParams.get('f_appt') === 'true' ? 'on' : ''}`}
                                                    onClick={() => updateFilterParams({ f_appt: searchParams.get('f_appt') === 'true' ? null : 'true' })}
                                                >
                                                    <div className="check-box">{searchParams.get('f_appt') === 'true' && <Check size={12} />}</div>
                                                    <span>약속만</span>
                                                </button>
                                                <button
                                                    className={`status-btn ${searchParams.get('f_meet') === 'true' ? 'on' : ''}`}
                                                    onClick={() => updateFilterParams({ f_meet: searchParams.get('f_meet') === 'true' ? null : 'true' })}
                                                >
                                                    <div className="check-box">{searchParams.get('f_meet') === 'true' && <Check size={12} />}</div>
                                                    <span>회의만</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="filter-footer">
                                            <button className="reset-btn" onClick={() => updateFilterParams({ f_type: null, f_importance: null, f_appt: null, f_meet: null })}>초기화</button>
                                            <button className="apply-btn" onClick={() => setIsFilterPanelOpen(false)}>확인</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>
            )}

            <main className="calendar-main-content">
                {children}
            </main>

            {!isFullPage && (
                <button className="fab-premium shadow-glow clickable" onClick={() => {
                    setEditingData(null);
                    setInitialTimes(null);
                    setIsModalOpen(true);
                }}>
                    <Plus size={28} color="white" />
                </button>
            )}

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingData(null);
                    setInitialTimes(null);
                }}
                onSave={handleSave}
                onDelete={handleDelete}
                initialDate={currentDate}
                initialData={editingData}
                initialStartTime={initialTimes?.start}
                initialEndTime={initialTimes?.end}
            />

            <DatePickerModal
                isOpen={isDatePickerOpen}
                currentDate={currentDate}
                onClose={() => setIsDatePickerOpen(false)}
                onSelect={(date) => updateParams(date)}
            />

            <style jsx>{`
                .calendar-root {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background: var(--bg-base);
                }

                .new-header {
                    padding: 24px 20px 16px;
                    background: var(--bg-base);
                    border-bottom: 1px solid var(--border-subtle);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }

                .header-top-centered {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .display-date-btn {
                    background: transparent;
                    border: none;
                    padding: 4px 12px;
                    border-radius: 12px;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .display-date-btn:hover {
                    background: var(--bg-surface);
                    transform: translateY(-1px);
                }

                .display-date-btn:active {
                    transform: translateY(0);
                    opacity: 0.7;
                }

                .display-date {
                    font-size: var(--text-md);
                    font-weight: 800;
                    color: var(--text-primary);
                    min-width: 140px;
                    text-align: center;
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                .nav-arrow-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    color: var(--text-secondary);
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .nav-arrow-btn:hover {
                    background: var(--bg-base);
                    border-color: var(--accent-primary);
                    color: var(--accent-primary);
                    transform: translateY(-1px);
                }

                .nav-arrow-btn:active {
                    transform: translateY(1px);
                    background: var(--bg-surface);
                }

                .header-bottom-centered {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 4px;
                }

                .view-toggle-segment {
                    position: relative;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    background: var(--bg-surface);
                    padding: 4px;
                    border-radius: 16px;
                    border: 1px solid var(--border-subtle);
                    width: 100%;
                    max-width: 280px;
                    margin: 0 auto;
                }

                .segment-highlighter {
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    width: calc((100% - 8px) / 3);
                    height: calc(100% - 8px);
                    background: var(--bg-elevated);
                    border-radius: 12px;
                    box-shadow: var(--shadow-md);
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 1;
                    pointer-events: none;
                }

                .segment-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 32px;
                    font-size: var(--text-sm);
                    font-weight: 600;
                    color: var(--text-muted);
                    text-align: center;
                    border-radius: 12px;
                    transition: all 0.3s;
                    text-decoration: none !important;
                    position: relative;
                    z-index: 2;
                }

                .segment-btn.active {
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .header-actions {
                    position: absolute;
                    top: 24px;
                    right: 20px;
                    z-index: 60;
                }

                .filter-system {
                    position: relative;
                }

                .filter-trigger-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .filter-trigger-btn:hover, .filter-trigger-btn.active {
                    background: var(--border-subtle);
                    border-color: var(--border-default);
                    color: var(--text-primary);
                }

                .filter-trigger-btn .arrow {
                    transition: transform 0.3s;
                }

                .filter-trigger-btn .arrow.rotated {
                    transform: rotate(180deg);
                }

                .filter-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 55;
                }

                .filter-dropdown-panel {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: 0;
                    width: 320px;
                    background: var(--bg-elevated);
                    border-radius: var(--radius-xl);
                    padding: 24px;
                    z-index: 60;
                    border: 1px solid var(--border-subtle);
                    box-shadow: var(--shadow-lg);
                    animation: slideInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideInDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .filter-group {
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .filter-group.no-border {
                    border-bottom: none;
                    margin-bottom: 0;
                }

                .filter-group label {
                    display: block;
                    font-size: var(--text-xs);
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 12px;
                }

                .filter-options-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .filter-options-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .option-chip {
                    padding: 6px 10px;
                    border-radius: 10px;
                    font-size: var(--text-xs);
                    font-weight: 600;
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    border: 1px solid var(--border-subtle);
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }

                .option-chip:hover {
                    background: var(--border-subtle);
                }

                .option-chip.selected {
                    background: var(--text-primary);
                    color: var(--text-inverse);
                    border-color: var(--text-primary);
                }

                .status-filter-row {
                    display: flex;
                    gap: 16px;
                }

                .status-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    font-size: var(--text-sm);
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .status-btn.on {
                    color: var(--text-primary);
                }

                .check-box {
                    width: 20px;
                    height: 20px;
                    border-radius: 6px;
                    border: 2px solid var(--border-default);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .status-btn.on .check-box {
                    background: var(--text-primary);
                    border-color: var(--text-primary);
                    color: var(--text-inverse);
                }

                .filter-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 24px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border-subtle);
                }

                .reset-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: var(--text-sm);
                    font-weight: 600;
                    cursor: pointer;
                }

                .apply-btn {
                    background: var(--text-primary);
                    color: var(--text-inverse);
                    border: none;
                    padding: 8px 20px;
                    border-radius: var(--radius-md);
                    font-size: var(--text-sm);
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: var(--shadow-sm);
                }

                .calendar-main-content {
                    flex: 1;
                    padding-bottom: var(--tab-bar-height);
                }

                .fab-premium {
                    position: fixed;
                    bottom: calc(var(--tab-bar-height) + 20px);
                    right: 20px;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: var(--accent-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 90;
                    border: none;
                }
            `}</style>
        </div >
    );
}

export default function CalendarNav({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="calendar-root">Loading...</div>}>
            <NavContent>{children}</NavContent>
        </Suspense>
    );
}
