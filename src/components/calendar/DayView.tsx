'use client';

import {
    format,
    isSameDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTimeSlots } from '@/utils/dateUtils';
import { useSchedules } from '@/hooks/useSchedules';
import { useEffect, useRef } from 'react';

interface DayViewProps {
    currentDate: Date;
}

export default function DayView({ currentDate }: DayViewProps) {
    const { schedules, loading } = useSchedules(currentDate, 'day');
    const timeSlots = getTimeSlots();
    const scrollRef = useRef<HTMLDivElement>(null);

    // 현재 시간으로 자동 스크롤
    useEffect(() => {
        if (scrollRef.current && isSameDay(currentDate, new Date())) {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            scrollRef.current.scrollTop = minutes - 100; // 여유 있게 상단 노출
        }
    }, [currentDate]);

    const getPosition = (startTime: string, endTime: string) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();
        return {
            top: startMinutes,
            height: endMinutes - startMinutes
        };
    };

    return (
        <div className="day-view-container">
            <div className="day-header glass">
                <h2 className="current-day-text">
                    {format(currentDate, 'M월 d일 (E)', { locale: ko })}
                </h2>
            </div>

            <div className="day-grid-scroll" ref={scrollRef}>
                <div className="day-grid">
                    {/* Time Labels */}
                    <div className="time-labels">
                        {timeSlots.filter((_, i) => i % 4 === 0).map(slot => (
                            <div key={slot} className="time-label">
                                {slot}
                            </div>
                        ))}
                    </div>

                    {/* Timeline Column */}
                    <div className="timeline-column">
                        {/* Grid Line */}
                        {Array.from({ length: 24 }).map((_, h) => (
                            <div key={h} className="hour-marker" />
                        ))}

                        {/* Current Time Indicator */}
                        {isSameDay(currentDate, new Date()) && (
                            <div
                                className="current-time-marker"
                                style={{ top: `${new Date().getHours() * 60 + new Date().getMinutes()}px` }}
                            />
                        )}

                        {/* Schedules */}
                        {schedules.map(schedule => {
                            const { top, height } = getPosition(schedule.start_time, schedule.end_time);
                            return (
                                <div
                                    key={schedule.id}
                                    className={`day-schedule-block type-${schedule.type} importance-${schedule.importance}`}
                                    style={{
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        backgroundColor: schedule.color ? `${schedule.color}22` : undefined,
                                        borderLeftColor: schedule.color || undefined
                                    }}
                                >
                                    <div className="block-title">{schedule.title}</div>
                                    <div className="block-meta">
                                        {format(new Date(schedule.start_time), 'HH:mm')} - {format(new Date(schedule.end_time), 'HH:mm')}
                                        {schedule.is_meeting && ' | 📹 회의'}
                                        {schedule.is_appointment && ' | 🤝 약속'}
                                    </div>
                                    {schedule.description && <div className="block-desc">{schedule.description}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .day-view-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-base);
        }

        .day-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-surface);
        }

        .current-day-text {
          font-size: var(--text-md);
          font-weight: var(--weight-bold);
          color: var(--accent-primary);
        }

        .day-grid-scroll {
          flex: 1;
          overflow-y: auto;
        }

        .day-grid {
          display: grid;
          grid-template-columns: var(--timeline-label-width) 1fr;
          position: relative;
          height: 1440px;
        }

        .time-labels {
          border-right: 1px solid var(--border-subtle);
          background: var(--bg-base);
          z-index: 5;
        }

        .time-label {
          height: 60px;
          font-size: 11px;
          color: var(--text-muted);
          text-align: right;
          padding-right: 10px;
          transform: translateY(-6px);
        }

        .timeline-column {
          position: relative;
          padding-right: 16px;
        }

        .hour-marker {
          height: 60px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .current-time-marker {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: #EF4444;
          z-index: 10;
        }

        .current-time-marker::before {
          content: '';
          position: absolute;
          left: -4px;
          top: -3px;
          width: 8px;
          height: 8px;
          background: #EF4444;
          border-radius: 50%;
        }

        .day-schedule-block {
          position: absolute;
          left: 8px;
          right: 8px;
          border-radius: var(--radius-md);
          padding: 8px 12px;
          border-left: 4px solid var(--accent-primary);
          background: rgba(108, 99, 255, 0.1);
          backdrop-filter: blur(4px);
          overflow: hidden;
          z-index: 2;
          box-shadow: var(--shadow-sm);
        }

        .block-title {
          font-weight: var(--weight-semibold);
          font-size: var(--text-base);
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .block-meta {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .block-desc {
          font-size: var(--text-sm);
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .importance-high { border-left-width: 8px; }

        .type-업무 { border-left-color: var(--schedule-work); background: rgba(74, 158, 255, 0.1); }
        .type-개인 { border-left-color: var(--schedule-personal); background: rgba(52, 211, 153, 0.1); }
        .type-학습 { border-left-color: var(--schedule-study); background: rgba(245, 158, 11, 0.1); }
      `}</style>
        </div>
    );
}
