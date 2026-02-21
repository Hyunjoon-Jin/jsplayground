'use client';

import {
    format,
    isSameMonth,
    isSameDay,
    startOfMonth
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getMonthGrid } from '@/utils/dateUtils';
import { useSchedules, Schedule } from '@/hooks/useSchedules';
import { Video, User as UserIcon } from 'lucide-react';

interface MonthViewProps {
    currentDate: Date;
}

export default function MonthView({ currentDate }: MonthViewProps) {
    const days = getMonthGrid(currentDate);
    const { schedules, loading } = useSchedules(currentDate, 'month');

    const renderSchedules = (day: Date) => {
        // Filter schedules for this day
        const daySchedules = schedules.filter(s => isSameDay(new Date(s.start_time), day));

        return (
            <div className="day-schedules">
                {daySchedules.slice(0, 3).map(schedule => (
                    <div
                        key={schedule.id}
                        className={`schedule-badge ${schedule.is_meeting ? 'meeting' : 'appointment'}`}
                        title={schedule.title}
                    >
                        {schedule.is_meeting ? <Video size={10} /> : <UserIcon size={10} />}
                        <span className="badge-text">{schedule.title}</span>
                    </div>
                ))}
                {daySchedules.length > 3 && (
                    <div className="more-count">+{daySchedules.length - 3}</div>
                )}
            </div>
        );
    };

    return (
        <div className="month-view-container">
            <div className="weekdays-row">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <div key={d} className="weekday-label">{d}</div>
                ))}
            </div>

            <div className="calendar-grid">
                {days.map((day, i) => (
                    <div
                        key={i}
                        className={`calendar-cell ${!isSameMonth(day, currentDate) ? 'other-month' : ''} ${isSameDay(day, new Date()) ? 'today' : ''}`}
                    >
                        <span className="day-number">{format(day, 'd')}</span>
                        {renderSchedules(day)}
                    </div>
                ))}
            </div>

            <style jsx>{`
        .month-view-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-base);
        }

        .weekdays-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-subtle);
        }

        .weekday-label {
          padding: 8px 0;
          text-align: center;
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-weight: var(--weight-medium);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(6, 1fr);
          flex: 1;
        }

        .calendar-cell {
          border-right: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          padding: 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-height: 80px;
          transition: background 0.2s ease;
        }

        .calendar-cell:nth-child(7n) {
          border-right: none;
        }

        .calendar-cell.other-month {
          opacity: 0.3;
        }

        .calendar-cell.today .day-number {
          background: var(--accent-primary);
          color: white;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .day-number {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          align-self: flex-end;
          margin-bottom: 2px;
        }

        .day-schedules {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .schedule-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .schedule-badge.meeting {
          background: rgba(74, 158, 255, 0.15);
          color: var(--schedule-work);
          border-left: 2px solid var(--schedule-work);
        }

        .schedule-badge.appointment {
          background: rgba(167, 139, 250, 0.15);
          color: var(--accent-secondary);
          border-left: 2px solid var(--accent-secondary);
        }

        .badge-text {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .more-count {
          font-size: 9px;
          color: var(--text-muted);
          padding-left: 4px;
        }
      `}</style>
        </div>
    );
}
