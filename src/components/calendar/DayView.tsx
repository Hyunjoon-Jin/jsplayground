'use client';

import {
  format,
  isSameDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTimeSlots } from '@/utils/dateUtils';
import { useSchedules } from '@/hooks/useSchedules';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface DayViewProps {
  currentDate: Date;
}

export default function DayView({ currentDate }: DayViewProps) {
  const searchParams = useSearchParams();
  const isFilterOn = searchParams.get('filter') === 'appointment';

  const { schedules, loading } = useSchedules(currentDate, 'day');
  const timeSlots = getTimeSlots();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isSameDay(currentDate, new Date())) {
      const now = new Date();
      const minutes = (now.getHours() * 60 + now.getMinutes()) * (70 / 60);
      scrollRef.current.scrollTop = minutes - 100;
    }
  }, [currentDate]);

  const getPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    return {
      top: startMinutes * (70 / 60),
      height: Math.max(30, (endMinutes - startMinutes) * (70 / 60))
    };
  };

  const getBadgeClass = (schedule: any) => {
    if (schedule.is_meeting) return 'meeting';
    if (schedule.is_appointment) return 'appointment';
    if (schedule.importance === 'high') return 'important';
    return 'default';
  };

  let daySchedules = schedules;
  if (isFilterOn) {
    daySchedules = daySchedules.filter(s => s.is_appointment || s.is_meeting);
  }

  return (
    <div className="day-view-container">
      <div className="day-view-header">
        <span className="date-main">{format(currentDate, 'M월 d일')}</span>
        <span className="date-sub">{format(currentDate, 'EEEE', { locale: ko })}</span>
      </div>

      <div className="day-grid-scroll" ref={scrollRef}>
        <div className="day-grid">
          <div className="time-labels">
            {timeSlots.filter((_, i) => i % 4 === 0).map(slot => (
              <div key={slot} className="time-label">
                {slot}
              </div>
            ))}
          </div>

          <div className="timeline-column">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="hour-marker" />
            ))}

            {isSameDay(currentDate, new Date()) && (
              <div
                className="current-time-line"
                style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * (70 / 60)}px` }}
              >
                <div className="time-dot" />
              </div>
            )}

            {daySchedules.map(schedule => {
              const { top, height } = getPosition(schedule.start_time, schedule.end_time);
              return (
                <div
                  key={schedule.id}
                  className={`day-schedule-card shadow-md ${getBadgeClass(schedule)}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <div className="card-top">
                    <span className="card-title">{schedule.title}</span>
                    <span className="card-time">
                      {format(new Date(schedule.start_time), 'HH:mm')}
                    </span>
                  </div>
                  {height > 50 && (
                    <div className="card-body">
                      <p className="card-desc">{schedule.description || '상세 일정 정보가 없습니다.'}</p>
                    </div>
                  )}
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

                .day-view-header {
                    padding: 20px;
                    background: var(--bg-base);
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }

                .date-main {
                    font-size: 22px;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .date-sub {
                    font-size: 15px;
                    font-weight: 600;
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
                    height: 1680px;
                }

                .time-labels {
                    border-right: 1px solid var(--border-subtle);
                }

                .time-label {
                    height: 70px;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-muted);
                    text-align: right;
                    padding-right: 12px;
                    transform: translateY(-8px);
                }

                .timeline-column {
                    position: relative;
                    padding-right: 16px;
                }

                .hour-marker {
                    height: 70px;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .current-time-line {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #EF4444;
                    z-index: 10;
                }

                .time-dot {
                    position: absolute;
                    left: -5px;
                    top: -4px;
                    width: 10px;
                    height: 10px;
                    background: #EF4444;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 4px rgba(0,0,0,0.2);
                }

                .day-schedule-card {
                    position: absolute;
                    left: 12px;
                    right: 12px;
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: white;
                    z-index: 5;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    overflow: hidden;
                    transition: transform 0.2s;
                }

                .day-schedule-card:active {
                    transform: scale(0.98);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-title {
                    font-size: 15px;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .card-time {
                    font-size: 11px;
                    font-weight: 600;
                    opacity: 0.9;
                }

                .card-desc {
                    font-size: 13px;
                    opacity: 0.8;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .day-schedule-card.meeting { background: #3B82F6; }
                .day-schedule-card.appointment { background: #EF4444; }
                .day-schedule-card.important { background: #10B981; }
                .day-schedule-card.default { background: #94A3B8; }
            `}</style>
    </div>
  );
}
