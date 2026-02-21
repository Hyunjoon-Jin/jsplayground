'use client';

import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    eachDayOfInterval,
    endOfWeek
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTimeSlots, timeToPixel } from '@/utils/dateUtils';
import { useSchedules, Schedule } from '@/hooks/useSchedules';
import { useMemo } from 'react';

interface WeekViewProps {
    currentDate: Date;
}

export default function WeekView({ currentDate }: WeekViewProps) {
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

        return {
            top: startMinutes, // 1 min = 1 px
            height: endMinutes - startMinutes
        };
    };

    return (
        <div className="week-view-container">
            <div className="week-header">
                <div className="time-spacer" />
                {weekDays.map(day => (
                    <div key={day.toISOString()} className={`day-header ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                        <span className="day-name">{format(day, 'E', { locale: ko })}</span>
                        <span className="day-val">{format(day, 'd')}</span>
                    </div>
                ))}
            </div>

            <div className="week-grid-scroll">
                <div className="week-grid">
                    {/* Time Labels */}
                    <div className="time-labels">
                        {timeSlots.filter((_, i) => i % 4 === 0).map(slot => (
                            <div key={slot} className="time-label">
                                {slot}
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className="day-column">
                            {/* Hour Grid Lines */}
                            {Array.from({ length: 24 }).map((_, h) => (
                                <div key={h} className="hour-marker" />
                            ))}

                            {/* Schedules */}
                            {schedules
                                .filter(s => isSameDay(new Date(s.start_time), day))
                                .map(schedule => {
                                    const { top, height } = getPosition(schedule.start_time, schedule.end_time);
                                    return (
                                        <div
                                            key={schedule.id}
                                            className={`week-schedule-block type-${schedule.type}`}
                                            style={{
                                                top: `${top}px`,
                                                height: `${height}px`,
                                                backgroundColor: schedule.color ? `${schedule.color}22` : undefined,
                                                borderLeftColor: schedule.color || undefined
                                            }}
                                        >
                                            <div className="block-title">{schedule.title}</div>
                                            <div className="block-time">
                                                {format(new Date(schedule.start_time), 'HH:mm')}
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .week-view-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-base);
        }

        .week-header {
          display: grid;
          grid-template-columns: var(--timeline-label-width) repeat(7, 1fr);
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-subtle);
        }

        .time-spacer {
          border-right: 1px solid var(--border-subtle);
        }

        .day-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 0;
          color: var(--text-secondary);
        }

        .day-header.today {
          color: var(--accent-primary);
        }

        .day-name {
          font-size: 11px;
          margin-bottom: 2px;
        }

        .day-val {
          font-size: 16px;
          font-weight: var(--weight-semibold);
        }

        .week-grid-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .week-grid {
          display: grid;
          grid-template-columns: var(--timeline-label-width) repeat(7, 1fr);
          position: relative;
          height: 1440px; /* 24 hours * 60px */
        }

        .time-labels {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-subtle);
        }

        .time-label {
          height: 60px;
          font-size: 10px;
          color: var(--text-muted);
          text-align: right;
          padding-right: 8px;
          transform: translateY(-5px);
        }

        .day-column {
          position: relative;
          border-right: 1px solid var(--border-subtle);
        }

        .day-column:last-child {
          border-right: none;
        }

        .hour-marker {
          height: 60px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .week-schedule-block {
          position: absolute;
          left: 4px;
          right: 4px;
          border-radius: 4px;
          padding: 4px;
          font-size: 10px;
          border-left: 3px solid var(--accent-primary);
          background: rgba(108, 99, 255, 0.15);
          overflow: hidden;
          z-index: 2;
        }

        .block-title {
          font-weight: var(--weight-medium);
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .block-time {
          font-size: 9px;
          color: var(--text-muted);
        }

        .type-업무 { border-left-color: var(--schedule-work); background: rgba(74, 158, 255, 0.15); }
        .type-개인 { border-left-color: var(--schedule-personal); background: rgba(52, 211, 153, 0.15); }
        .type-학습 { border-left-color: var(--schedule-study); background: rgba(245, 158, 11, 0.15); }
      `}</style>
        </div>
    );
}
