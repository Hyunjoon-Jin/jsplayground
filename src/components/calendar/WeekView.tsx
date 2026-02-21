'use client';

import {
  format,
  startOfWeek,
  isSameDay,
  eachDayOfInterval,
  endOfWeek,
  parseISO,
  addMinutes,
  differenceInMinutes,
  startOfDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTimeSlots } from '@/utils/dateUtils';
import { useSchedules } from '@/hooks/useSchedules';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface WeekViewProps {
  currentDate: Date;
}

export default function WeekView({ currentDate }: WeekViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFilterOn = searchParams.get('filter') === 'appointment';

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Real-time current time for indicator
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

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

  const handleScheduleClick = (schedule: any, e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('edit-schedule', { detail: schedule }));
  };

  const handleDayClick = (day: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(day, 'yyyy-MM-dd'));
    router.push(`/calendar/day?${params.toString()}`);
  };

  const handleDragStart = (e: React.DragEvent, schedule: any) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    e.dataTransfer.setData('scheduleId', schedule.id);
    e.dataTransfer.setData('dragOffsetY', offsetY.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropDay: Date) => {
    e.preventDefault();
    const scheduleId = e.dataTransfer.getData('scheduleId');
    const dragOffsetY = parseFloat(e.dataTransfer.getData('dragOffsetY'));

    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dropY = e.clientY - rect.top - dragOffsetY;

    // 70px per hour => 1min = 70/60 px => 1px = 60/70 min
    let minutesTotal = Math.max(0, dropY * (60 / 70));
    // Snap to 15 mins
    minutesTotal = Math.round(minutesTotal / 15) * 15;

    const originalDuration = differenceInMinutes(parseISO(schedule.end_time), parseISO(schedule.start_time));

    const newStart = addMinutes(startOfDay(dropDay), minutesTotal);
    const newEnd = addMinutes(newStart, originalDuration);

    try {
      const response = await fetch(`/api/schedules?id=${schedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...schedule,
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to update schedule');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('일정 이동 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="week-view-container">
      <div className="week-tab-header">
        <div className="time-spacer" />
        {weekDays.map(day => {
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={`day-col-header clickable ${isToday ? 'today' : ''}`}
              onClick={() => handleDayClick(day)}
            >
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
              <div
                key={day.toISOString()}
                className="day-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="hour-marker" />
                ))}

                {isSameDay(day, new Date()) && (
                  <div
                    className="current-time-line"
                    style={{ top: `${(now.getHours() * 60 + now.getMinutes()) * (70 / 60)}px` }}
                  >
                    <div className="time-dot" />
                  </div>
                )}

                {daySchedules.map(schedule => {
                  const { top, height } = getPosition(schedule.start_time, schedule.end_time);
                  return (
                    <div
                      key={schedule.id}
                      className={`week-schedule-block shadow-sm clickable ${getBadgeClass(schedule)}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      onClick={(e) => handleScheduleClick(schedule, e)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, schedule)}
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
                    cursor: pointer;
                    transition: all 0.2s;
                    border-radius: 8px;
                }

                .day-col-header:hover {
                    background: var(--bg-surface);
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

                .current-time-line {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #EF4444;
                    z-index: 10;
                    pointer-events: none;
                }

                .time-dot {
                    position: absolute;
                    left: -4px;
                    top: -4px;
                    width: 10px;
                    height: 10px;
                    background: #EF4444;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 4px rgba(0,0,0,0.2);
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
                    cursor: pointer;
                    transition: transform 0.1s;
                }

                .week-schedule-block:active {
                    transform: scale(0.98);
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
