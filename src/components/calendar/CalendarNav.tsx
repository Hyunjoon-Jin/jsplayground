'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import ScheduleModal from '@/components/schedule/ScheduleModal';
import { useState } from 'react';

function NavContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const dateParam = searchParams.get('date');
    const currentDate = dateParam ? parseISO(dateParam) : new Date();
    const view = pathname.split('/').pop() || 'month';
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateDate = (newDate: Date) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', format(newDate, 'yyyy-MM-dd'));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePrev = () => {
        if (view === 'month') updateDate(subMonths(currentDate, 1));
        else if (view === 'week') updateDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
        else updateDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    };

    const handleNext = () => {
        if (view === 'month') updateDate(addMonths(currentDate, 1));
        else if (view === 'week') updateDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
        else updateDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    };

    const handleToday = () => updateDate(new Date());

    const handleSave = async (data: any) => {
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

        if (!response.ok) throw new Error('Failed to save');
        router.refresh();
    };

    return (
        <div className="calendar-container">
            <header className="calendar-header glass">
                <div className="header-left">
                    <button onClick={handlePrev} className="nav-btn"><ChevronLeft size={24} /></button>
                    <span className="current-title">
                        {format(currentDate, 'yyyy년 M월', { locale: ko })}
                    </span>
                    <button onClick={handleNext} className="nav-btn"><ChevronRight size={24} /></button>
                </div>
                <div className="header-right">
                    <button onClick={handleToday} className="today-btn">오늘</button>
                    <button onClick={() => setIsModalOpen(true)} className="icon-btn"><Plus size={24} /></button>
                </div>
            </header>

            <nav className="view-switcher-nav">
                <div className="switcher-group glass">
                    <Link href={`/calendar/month?date=${format(currentDate, 'yyyy-MM-dd')}`} className={`switch-item ${view === 'month' ? 'active' : ''}`}>월간</Link>
                    <Link href={`/calendar/week?date=${format(currentDate, 'yyyy-MM-dd')}`} className={`switch-item ${view === 'week' ? 'active' : ''}`}>주간</Link>
                    <Link href={`/calendar/day?date=${format(currentDate, 'yyyy-MM-dd')}`} className={`switch-item ${view === 'day' ? 'active' : ''}`}>일간</Link>
                </div>
            </nav>

            <main className="calendar-content">
                {children}
            </main>

            <button className="fab shadow-glow clickable" onClick={() => setIsModalOpen(true)}>
                <Plus size={32} />
            </button>

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialDate={currentDate}
            />
        </div>
    );
}

export default function CalendarNav({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="calendar-container"><div className="calendar-header glass">Loading...</div></div>}>
            <NavContent>{children}</NavContent>
        </Suspense>
    );
}
