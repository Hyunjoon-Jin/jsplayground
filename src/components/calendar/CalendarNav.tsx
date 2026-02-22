'use client';

import { Suspense, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-react';
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
    const [isFilterOn, setIsFilterOn] = useState(filterParam);
    const [editingData, setEditingData] = useState<any>(null);
    const [initialTimes, setInitialTimes] = useState<{ start: string; end: string } | null>(null);

    useEffect(() => {
        setIsFilterOn(searchParams.get('filter') === 'appointment');
    }, [searchParams]);

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

    const updateParams = (newDate?: Date, filter?: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newDate) params.set('date', format(newDate, 'yyyy-MM-dd'));
        if (filter !== undefined) {
            if (filter) params.set('filter', 'appointment');
            else params.delete('filter');
        }
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

    const toggleFilter = () => {
        const nextFilter = !isFilterOn;
        setIsFilterOn(nextFilter);
        updateParams(undefined, nextFilter);
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
                        <button onClick={handlePrev} className="nav-arrow-btn">
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
                        <button onClick={handleNext} className="nav-arrow-btn">
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

                    <div className="filter-toggle">
                        <span className="filter-label">약속/회의만 보기</span>
                        <button
                            className={`toggle-switch ${isFilterOn ? 'on' : ''}`}
                            onClick={toggleFilter}
                        >
                            <span className="toggle-thumb" />
                        </button>
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
                    font-size: 20px;
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
                    display: flex;
                    background: #F8FAFC;
                    padding: 4px;
                    border-radius: 16px;
                    border: 1px solid #F1F5F9;
                    width: 100%;
                    max-width: 280px;
                }

                 .segment-highlighter {
                     position: absolute;
                     top: 4px;
                     left: 4px;
                     width: calc((100% - 8px) / 3);
                     height: calc(100% - 8px);
                     background: white;
                     border-radius: 12px;
                     box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
                     transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                     z-index: 1;
                     pointer-events: none;
                 }

                 .segment-btn {
                     flex: 1;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     height: 32px;
                     font-size: 14px;
                     font-weight: 600;
                     color: #94A3B8;
                     text-align: center;
                     border-radius: 12px;
                     transition: all 0.3s;
                     text-decoration: none !important;
                     position: relative;
                     z-index: 2;
                 }

                .segment-btn.active {
                    color: #1A1A1A;
                    font-weight: 700;
                }

                .filter-toggle {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .filter-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .toggle-switch {
                    width: 44px;
                    height: 24px;
                    background: #E2E8F0;
                    border-radius: 12px;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }

                .toggle-switch.on {
                    background: var(--accent-primary);
                }

                .toggle-thumb {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .toggle-switch.on .toggle-thumb {
                    left: calc(100% - 22px);
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
                    background: #25405E; /* Reference image dark blue FAB */
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
