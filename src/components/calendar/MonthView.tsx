'use client';

import {
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getMonthGrid } from '@/utils/dateUtils';
import { useSchedules } from '@/hooks/useSchedules';
import { Handshake, Star, Calendar as CalIcon } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface MonthViewProps {
  currentDate: Date;
}

export default function MonthView({ currentDate }: MonthViewProps) {
  const router = useRouter();
  const days = getMonthGrid(currentDate);
  const searchParams = useSearchParams();
  const isFilterOn = searchParams.get('filter') === 'appointment';

  const { schedules, loading } = useSchedules(currentDate, 'month');

  const getIcon = (schedule: any) => {
    const workTypes = ['미팅', '회의', '업무보고'];
    if (schedule.is_meeting || workTypes.includes(schedule.type)) return <Handshake size={14} />;
    if (schedule.importance === 'high') return <Star size={14} />;
    return <CalIcon size={14} />;
  };

  const getBadgeClass = (schedule: any) => {
    const workTypes = ['미팅', '회의', '업무보고'];
    if (schedule.is_meeting || workTypes.includes(schedule.type)) return 'meeting';
    if (schedule.is_appointment || schedule.type === '약속') return 'appointment';
    if (schedule.importance === 'high') return 'important';
    return 'default';
  };

  const handleScheduleClick = (schedule: any, e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('edit-schedule', { detail: schedule }));
  };

  const handleDayClick = (day: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(day, 'yyyy-MM-dd'));
    router.push(`/calendar/day?${params.toString()}`);
  };

  const renderSchedules = (day: Date) => {
    let daySchedules = schedules.filter(s => isSameDay(new Date(s.start_time), day));

    // Sort: Meetings/Appointments first, then others
    daySchedules.sort((a, b) => {
      const aPri = (a.is_meeting || a.is_appointment) ? 0 : 1;
      const bPri = (b.is_meeting || b.is_appointment) ? 0 : 1;
      if (aPri !== bPri) return aPri - bPri;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });

    if (isFilterOn) {
      daySchedules = daySchedules.filter(s => s.is_appointment || s.is_meeting);
    }

    return (
      <div className="day-schedules">
        {daySchedules.slice(0, 3).map(schedule => (
          <div
            key={schedule.id}
            className={`schedule-chip ${getBadgeClass(schedule)}`}
            title={schedule.title}
            onClick={(e) => handleScheduleClick(schedule, e)}
          >
            <span className="chip-title">{schedule.title}</span>
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
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
          <div key={d} className="weekday-label">{d}</div>
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
              onClick={() => handleDayClick(day)}
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
                    background: white;
                }

                .weekdays-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    padding: 12px 0;
                    border-bottom: 1px solid #F1F5F9;
                }

                .weekday-label {
                    text-align: center;
                    font-size: 13px;
                    color: #94A3B8;
                    font-weight: 500;
                }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    grid-auto-rows: minmax(110px, 1fr);
                    flex: 1;
                }

                .calendar-cell {
                    border-right: 1px solid #F1F5F9;
                    border-bottom: 1px solid #F1F5F9;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    cursor: pointer;
                    transition: background 0.1s;
                }

                .calendar-cell:hover {
                    background: #F8FAFC;
                }
                
                .calendar-cell:nth-child(7n) {
                    border-right: none;
                }

                .calendar-cell.other-month {
                    background: #FAFAFA;
                }
                
                .calendar-cell.other-month .day-number {
                    color: #CBD5E1;
                }

                .day-number {
                    font-size: 15px;
                    font-weight: 500;
                    color: #1A1A1A;
                    margin-bottom: 4px;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .calendar-cell.today .day-number {
                    background: #1C1C1E;
                    color: white;
                    border-radius: 8px;
                    font-weight: 600;
                }

                .day-schedules {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    margin-top: 4px;
                }

                .schedule-chip {
                    display: flex;
                    align-items: center;
                    padding: 2px 6px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    transition: all 0.2s;
                    color: white;
                }

                .schedule-chip:hover {
                    opacity: 0.9;
                    transform: translateX(1px);
                }

                .chip-title {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* Blocks Colors */
                .schedule-chip.meeting { background: #1C1C1E; }
                .schedule-chip.appointment { background: #EF4444; }
                .schedule-chip.important { background: #10B981; }
                .schedule-chip.default { background: #94A3B8; }

                .more-count {
                    font-size: 10px;
                    font-weight: 700;
                    color: #94A3B8;
                    padding-left: 4px;
                }
            `}</style>
    </div>
  );
}
