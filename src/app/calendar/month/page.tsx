'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseISO } from 'date-fns';
import MonthView from '@/components/calendar/MonthView';

export default function MonthPage() {
    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');
    const currentDate = dateParam ? parseISO(dateParam) : new Date();

    return (
        <Suspense fallback={<div className="loading-state">Loading Month View...</div>}>
            <MonthView currentDate={currentDate} />

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
