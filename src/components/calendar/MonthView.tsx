'use client';

import {
  format,
  isSameMonth,
  isSameDay,
  startOfDay,
  endOfDay,
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
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    let daySchedules = schedules.filter(s => {
      const sStart = new Date(s.start_time);
      const sEnd = new Date(s.end_time);
      return (sStart <= dayEnd && sEnd >= dayStart);
    });

    // Sort: Meetings/Appointments first, then others
    daySchedules.sort((a, b) => {
      const aPri = (a.is_meeting || a.is_appointment) ? 0 : 1;
      const bPri = (b.is_meeting || b.is_appointment) ? 0 : 1;
      if (aPri !== bPri) return aPri - bPri;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });


    return (
      <div className="day-schedules">
        {daySchedules.slice(0, 3).map(schedule => {
          const isAppt = schedule.is_appointment;
          const isMeet = schedule.is_meeting;
          const statusText = isMeet ? '회의' : isAppt ? '약속' : '';

          return (
            <div
              key={schedule.id}
              className={`schedule-chip-premium ${getBadgeClass(schedule)}`}
              onClick={(e) => handleScheduleClick(schedule, e)}
            >
              <div className="chip-main-row">
                <div className="chip-tags">
                  {schedule.is_all_day && <span className="chip-tag all-day">종일</span>}
                  {schedule.is_time_not_set && <span className="chip-tag no-time">미지정</span>}
                </div>
                <span className="type-prefix">[{schedule.type}]</span>
                <span className="chip-title-text">{schedule.title}</span>
                {statusText && <span className="status-tag">{statusText}</span>}
              </div>
            </div>
          );
        })}
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

                 .schedule-chip-premium {
                    display: flex;
                    flex-direction: column;
                    padding: 3px 6px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 600;
                    margin-bottom: 2px;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    color: white;
                    border: 1px solid transparent;
                }

                .schedule-chip-premium:hover {
                    opacity: 0.95;
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .chip-main-row {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                }

                .chip-tags {
                    display: flex;
                    gap: 2px;
                }

                .chip-tag {
                    font-size: 8px;
                    padding: 0 3px;
                    border-radius: 3px;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                .chip-tag.all-day { background: #1E293B; color: white; }
                .chip-tag.no-time { background: #CBD5E1; color: #1E293B; }

                .type-prefix {
                    opacity: 0.85;
                    font-weight: 800;
                    font-size: 9px;
                    flex-shrink: 0;
                }

                .chip-title-text {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .status-tag {
                    font-size: 8px;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 1px 4px;
                    border-radius: 4px;
                    flex-shrink: 0;
                    font-weight: 800;
                }

                /* Blocks Colors */
                .schedule-chip-premium.meeting { background: #1C1C1E; }
                .schedule-chip-premium.appointment { background: #EF4444; }
                .schedule-chip-premium.important { background: #10B981; }
                .schedule-chip-premium.default { background: #94A3B8; }

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
