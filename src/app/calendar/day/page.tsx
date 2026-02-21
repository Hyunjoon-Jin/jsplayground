'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseISO } from 'date-fns';
import DayView from '@/components/calendar/DayView';

export default function DayPage() {
    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');
    const currentDate = dateParam ? parseISO(dateParam) : new Date();

    return (
        <Suspense fallback={<div className="loading-state">Loading Day View...</div>}>
            <DayView currentDate={currentDate} />

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
