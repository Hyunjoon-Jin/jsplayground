'use client';

import {
  format,
  startOfWeek,
  isSameDay,
  eachDayOfInterval,
  endOfWeek
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTimeSlots } from '@/utils/dateUtils';
import { useSchedules } from '@/hooks/useSchedules';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

interface WeekViewProps {
  currentDate: Date;
}

export default function WeekView({ currentDate }: WeekViewProps) {
  const searchParams = useSearchParams();
  const isFilterOn = searchParams.get('filter') === 'appointment';

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const { schedules, loading } = useSchedules(currentDate, 'week');
  const timeSlots = getTimeSlots();

  const getPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    // height in pixels (1min = 1.16px to match the hour marker size of 70px)
    const minHeight = 24;
    const calculatedHeight = (endMinutes - startMinutes) * (70 / 60);

    return {
      top: startMinutes * (70 / 60),
      height: Math.max(minHeight, calculatedHeight)
    };
  };

  const getBadgeClass = (schedule: any) => {
    if (schedule.is_meeting) return 'meeting';
    if (schedule.is_appointment) return 'appointment';
    if (schedule.importance === 'high') return 'important';
    return 'default';
  };

  return (
    <div className="week-view-container">
      <div className="week-tab-header">
        <div className="time-spacer" />
        {weekDays.map(day => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className={`day-col-header ${isToday ? 'today' : ''}`}>
              <span className="day-name">{format(day, 'E', { locale: ko })}</span>
              <div className="day-val-circle">
                <span>{format(day, 'd')}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="week-grid-scroll">
        <div className="week-grid">
          <div className="time-labels">
            {timeSlots.filter((_, i) => i % 4 === 0).map(slot => (
              <div key={slot} className="time-label">
                {slot}
              </div>
            ))}
          </div>

          {weekDays.map(day => {
            let daySchedules = schedules.filter(s => isSameDay(new Date(s.start_time), day));
            if (isFilterOn) {
              daySchedules = daySchedules.filter(s => s.is_appointment || s.is_meeting);
            }

            return (
              <div key={day.toISOString()} className="day-column">
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="hour-marker" />
                ))}

                {daySchedules.map(schedule => {
                  const { top, height } = getPosition(schedule.start_time, schedule.end_time);
                  return (
                    <div
                      key={schedule.id}
                      className={`week-schedule-block shadow-sm ${getBadgeClass(schedule)}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="block-title">{schedule.title}</div>
                      <div className="block-time">
                        {format(new Date(schedule.start_time), 'HH:mm')} - {format(new Date(schedule.end_time), 'HH:mm')}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
                .week-view-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--bg-base);
                }

                .week-tab-header {
                    display: grid;
                    grid-template-columns: var(--timeline-label-width) repeat(7, 1fr);
                    background: var(--bg-base);
                    border-bottom: 1px solid var(--border-subtle);
                    padding: 4px 0;
                }

                .day-col-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 8px 0;
                    color: var(--text-muted);
                }

                .day-name {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .day-val-circle {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .day-col-header.today .day-val-circle {
                    background: var(--accent-primary);
                    color: white;
                    border-radius: 50%;
                }

                .day-col-header.today .day-name {
                    color: var(--accent-primary);
                }

                .week-grid-scroll {
                    flex: 1;
                    overflow-y: auto;
                }

                .week-grid {
                    display: grid;
                    grid-template-columns: var(--timeline-label-width) repeat(7, 1fr);
                    position: relative;
                    height: 1680px; /* 24 hours * 70px */
                }

                .time-labels {
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid var(--border-subtle);
                }

                .time-label {
                    height: 70px;
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--text-muted);
                    text-align: right;
                    padding-right: 12px;
                    transform: translateY(-8px);
                }

                .day-column {
                    position: relative;
                    border-right: 1px solid var(--border-subtle);
                }

                .day-column:last-child {
                    border-right: none;
                }

                .hour-marker {
                    height: 70px;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .week-schedule-block {
                    position: absolute;
                    left: 2px;
                    right: 2px;
                    border-radius: 6px;
                    padding: 6px;
                    background: var(--accent-primary);
                    color: white;
                    z-index: 2;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
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
                    opacity: 0.9;
                }

                .week-schedule-block.meeting { background: #3B82F6; }
                .week-schedule-block.appointment { background: #EF4444; }
                .week-schedule-block.important { background: #10B981; }
                .week-schedule-block.default { background: #94A3B8; }
            `}</style>
    </div>
  );
}
