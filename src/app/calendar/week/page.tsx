'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseISO } from 'date-fns';
import WeekView from '@/components/calendar/WeekView';

export default function WeekPage() {
    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');
    const currentDate = dateParam ? parseISO(dateParam) : new Date();

    return (
        <Suspense fallback={<div className="loading-state">Loading Week View...</div>}>
            <WeekView currentDate={currentDate} />

            <style jsx>{`
        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          font-size: var(--text-sm);
        }
      `}</style>
        </Suspense>
    );
}
