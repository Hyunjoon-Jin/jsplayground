'use client';

import {
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getMonthGrid } from '@/utils/dateUtils';
import { useSchedules } from '@/hooks/useSchedules';
import { Handshake, Megaphone, Star, Bell, Calendar as CalIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface MonthViewProps {
  currentDate: Date;
}

export default function MonthView({ currentDate }: MonthViewProps) {
  const days = getMonthGrid(currentDate);
  const searchParams = useSearchParams();
  const isFilterOn = searchParams.get('filter') === 'appointment';

  const { schedules, loading } = useSchedules(currentDate, 'month');

  const getIcon = (schedule: any) => {
    if (schedule.is_meeting) return <Handshake size={14} />;
    if (schedule.importance === 'high') return <Star size={14} />;
    if (schedule.type === '업무') return <Megaphone size={14} />;
    return <CalIcon size={14} />;
  };

  const getBadgeClass = (schedule: any) => {
    if (schedule.is_meeting) return 'meeting';
    if (schedule.is_appointment) return 'appointment';
    if (schedule.importance === 'high') return 'important';
    return 'default';
  };

  const renderSchedules = (day: Date) => {
    let daySchedules = schedules.filter(s => isSameDay(new Date(s.start_time), day));

    if (isFilterOn) {
      daySchedules = daySchedules.filter(s => s.is_appointment || s.is_meeting);
    }

    return (
      <div className="day-schedules">
        {daySchedules.slice(0, 3).map(schedule => (
          <div
            key={schedule.id}
            className={`schedule-block ${getBadgeClass(schedule)}`}
            title={schedule.title}
          >
            <div className="block-icon">{getIcon(schedule)}</div>
            <div className="block-content">
              <span className="block-title">{schedule.title}</span>
              <span className="block-time">{format(new Date(schedule.start_time), 'h:mm a')}</span>
            </div>
          </div>
        ))}
        {daySchedules.length > 3 && (
          <div className="more-count">외 {daySchedules.length - 3}개 더보기</div>
        )}
      </div>
    );
  };

  return (
    <div className="month-view-container">
      <div className="weekdays-row">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div key={d} className={`weekday-label ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}`}>{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          return (
            <div
              key={i}
              className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
            >
              <span className="day-number">{format(day, 'd')}</span>
              {renderSchedules(day)}
            </div>
          );
        })}
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
                    padding: 8px 0;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .weekday-label {
                    text-align: center;
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .weekday-label.sun { color: #EF4444; }
                .weekday-label.sat { color: #3B82F6; }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    grid-auto-rows: minmax(100px, 1fr);
                    flex: 1;
                }

                .calendar-cell {
                    border-right: 1px solid var(--border-subtle);
                    border-bottom: 1px solid var(--border-subtle);
                    padding: 6px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .calendar-cell:nth-child(7n) {
                    border-right: none;
                }

                .calendar-cell.other-month {
                    background: #F8FAFC;
                }
                
                .calendar-cell.other-month .day-number,
                .calendar-cell.other-month .day-schedules {
                    opacity: 0.4;
                }

                .day-number {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }

                .calendar-cell.today .day-number {
                    background: var(--accent-primary);
                    color: white;
                    width: 22px;
                    height: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .day-schedules {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .schedule-block {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    border-radius: 8px;
                    transition: transform 0.1s;
                }

                .schedule-block:active {
                    transform: scale(0.95);
                }

                .block-icon {
                    flex-shrink: 0;
                }

                .block-content {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .block-title {
                    font-size: 11px;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .block-time {
                    font-size: 9px;
                    font-weight: 500;
                    opacity: 0.8;
                }

                /* Blocks Colors (Reference Image Style) */
                .schedule-block.meeting {
                    background: #3B82F6;
                    color: white;
                }
                .schedule-block.appointment {
                    background: #EF4444;
                    color: white;
                }
                .schedule-block.important {
                    background: #10B981;
                    color: white;
                }
                .schedule-block.default {
                    background: #94A3B8;
                    color: white;
                }

                .more-count {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-muted);
                    padding: 2px 4px;
                    background: var(--bg-surface);
                    border-radius: 4px;
                    width: fit-content;
                }
            `}</style>
    </div>
  );
}
