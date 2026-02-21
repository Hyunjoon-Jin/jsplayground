'use client';

import { Suspense, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import ScheduleModal from '@/components/schedule/ScheduleModal';

function NavContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const dateParam = searchParams.get('date');
    const filterParam = searchParams.get('filter') === 'appointment';
    const currentDate = dateParam ? parseISO(dateParam) : new Date();
    const view = pathname.split('/').pop() || 'month';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
    const [isFilterOn, setIsFilterOn] = useState(filterParam);
    const [editingData, setEditingData] = useState<any>(null);

    useEffect(() => {
        setIsFilterOn(searchParams.get('filter') === 'appointment');
    }, [searchParams]);

    useEffect(() => {
        const handleEditSchedule = (e: any) => {
            setEditingData(e.detail);
            setIsModalOpen(true);
        };

        window.addEventListener('edit-schedule', handleEditSchedule);
        return () => window.removeEventListener('edit-schedule', handleEditSchedule);
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

    const isFullPage = pathname === '/calendar/profile' || pathname === '/calendar/tasks';

    return (
        <div className="calendar-root">
            {!isFullPage && (
                <header className="new-header">
                    <div className="header-top">
                        <h1 className="title-month">
                            {format(currentDate, 'MMMM yyyy', { locale: ko })}
                        </h1>
                        <div className="nav-controls">
                            <button onClick={handlePrev} className="icon-btn-subtle"><ChevronLeft size={20} /></button>
                            <button onClick={handleNext} className="icon-btn-subtle"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="header-bottom">
                        <div className="view-selector-container">
                            <button
                                className="view-selector-btn"
                                onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                            >
                                {viewLabels[view]} <ChevronDown size={14} />
                            </button>
                            {isViewDropdownOpen && (
                                <div className="view-dropdown shadow-lg">
                                    <Link onClick={() => setIsViewDropdownOpen(false)} href={`/calendar/month?date=${format(currentDate, 'yyyy-MM-dd')}`}>월간</Link>
                                    <Link onClick={() => setIsViewDropdownOpen(false)} href={`/calendar/week?date=${format(currentDate, 'yyyy-MM-dd')}`}>주간</Link>
                                    <Link onClick={() => setIsViewDropdownOpen(false)} href={`/calendar/day?date=${format(currentDate, 'yyyy-MM-dd')}`}>일간</Link>
                                </div>
                            )}
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
                    </div>
                </header>
            )}

            <main className="calendar-main-content">
                {children}
            </main>

            {!isFullPage && (
                <button className="fab-premium shadow-glow clickable" onClick={() => {
                    setEditingData(null);
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
                }}
                onSave={handleSave}
                onDelete={handleDelete}
                initialDate={currentDate}
                initialData={editingData}
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

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .title-month {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .nav-controls {
                    display: flex;
                    gap: 12px;
                }

                .icon-btn-subtle {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }

                .icon-btn-subtle:active {
                    background: var(--bg-surface);
                    transform: scale(0.9);
                }

                .header-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .view-selector-container {
                    position: relative;
                }

                .view-selector-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text-primary);
                    padding: 4px 0;
                }

                .view-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    padding: 8px;
                    min-width: 120px;
                    margin-top: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .view-dropdown :global(a) {
                    padding: 10px 12px;
                    font-size: 14px;
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                    transition: background 0.2s;
                }

                .view-dropdown :global(a:hover) {
                    background: var(--bg-surface);
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
        </div>
    );
}

export default function CalendarNav({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="calendar-root">Loading...</div>}>
            <NavContent>{children}</NavContent>
        </Suspense>
    );
}
