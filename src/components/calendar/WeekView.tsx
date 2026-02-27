'use client';

import {
  format,
  startOfWeek,
  isSameDay,
  eachDayOfInterval,
  endOfWeek,
  endOfDay,
  parseISO,
  addMinutes,
  differenceInMinutes,
  startOfDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTimeSlots } from '@/utils/dateUtils';
import { useSchedules } from '@/hooks/useSchedules';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface WeekViewProps {
  currentDate: Date;
}

export default function WeekView({ currentDate }: WeekViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Dragging/Moving state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [tempTop, setTempTop] = useState<number>(0);
  const [hoverDay, setHoverDay] = useState<Date | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; top: number; schedule: any } | null>(null);

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

  const getPosition = (startTime: string, endTime: string, referenceDate: Date) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const dayStart = startOfDay(referenceDate);
    const dayEnd = endOfDay(referenceDate);

    const effectiveStart = start < dayStart ? dayStart : start;
    const effectiveEnd = end > dayEnd ? dayEnd : end;

    const startMinutes = effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
    const endMinutes = effectiveEnd.getHours() * 60 + effectiveEnd.getMinutes();

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

  const handleScheduleClick = (schedule: any, e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('edit-schedule', { detail: schedule }));
  };

  const handleDayClick = (day: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(day, 'yyyy-MM-dd'));
    router.push(`/calendar/day?${params.toString()}`);
  };

  // --- Real-time Move (Custom Mouse Move) ---
  const handleMoveStart = (e: React.MouseEvent, schedule: any) => {
    e.stopPropagation();
    const { top } = getPosition(schedule.start_time, schedule.end_time, parseISO(schedule.start_time));

    setDraggingId(schedule.id);
    setTempTop(top);
    setHoverDay(parseISO(schedule.start_time));
    dragStartRef.current = { x: e.clientX, y: e.clientY, top, schedule };

    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      setTempTop(dragStartRef.current.top + deltaY);

      // Determine which day column we are over
      const dayElements = document.querySelectorAll('.day-column');
      let foundDay: Date | null = null;
      dayElements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (moveEvent.clientX >= rect.left && moveEvent.clientX <= rect.right) {
          foundDay = weekDays[idx];
        }
      });
      if (foundDay) setHoverDay(foundDay);
    };

    const onMouseUp = async () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';

      if (dragStartRef.current && hoverDay) {
        const { schedule } = dragStartRef.current;
        const finalTop = Math.max(0, tempTop);
        // pixel to minutes (1px = 60/70 min)
        let minutesTotal = finalTop * (60 / 70);
        // Snap to 15 mins
        minutesTotal = Math.round(minutesTotal / 15) * 15;

        const originalDuration = differenceInMinutes(parseISO(schedule.end_time), parseISO(schedule.start_time));
        const newStart = addMinutes(startOfDay(hoverDay), minutesTotal);
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
      }

      setDraggingId(null);
      setHoverDay(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
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
            const dayStart = startOfDay(day);
            const dayEnd = endOfDay(day);
            let daySchedules = schedules.filter(s => {
              const sStart = new Date(s.start_time);
              const sEnd = new Date(s.end_time);
              return (sStart <= dayEnd && sEnd >= dayStart);
            });

            return (
              <div
                key={day.toISOString()}
                className="day-column"
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
                  const { top, height } = getPosition(schedule.start_time, schedule.end_time, day);
                  const isDragging = draggingId === schedule.id;
                  const displayTop = isDragging ? tempTop : top;

                  // Simple logic: if this is THE dragging schedule, hide it from its original day
                  // and show it ONLY on the hoverDay
                  if (draggingId === schedule.id) return null;

                  return (
                    <div
                      key={schedule.id}
                      className={`week-schedule-card shadow-sm clickable ${getBadgeClass(schedule)} ${isDragging ? 'dragging' : ''} ${schedule.is_all_day ? 'all-day' : ''}`}
                      style={{
                        top: `${displayTop}px`,
                        height: `${height}px`
                      }}
                      onClick={(e) => handleScheduleClick(schedule, e)}
                      onMouseDown={(e) => handleMoveStart(e, schedule)}
                    >
                      <div className="card-inner">
                        <div className="card-header">
                          {schedule.is_all_day && <span className="all-day-tag">종일</span>}
                          {schedule.is_time_not_set && <span className="no-time-tag">시간미지정</span>}
                          <span className="card-type">[{schedule.type}]</span>
                        </div>
                        <div className="card-title">{schedule.title}</div>
                        {!schedule.is_all_day && !schedule.is_time_not_set && height > 40 && (
                          <div className="card-time">
                            {format(parseISO(schedule.start_time), 'HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Show dragging preview on hover day */}
                {draggingId && hoverDay && isSameDay(day, hoverDay) && (
                  <div
                    className={`week-schedule-block shadow-lg dragging ${getBadgeClass(schedules.find(s => s.id === draggingId))}`}
                    style={{
                      top: `${tempTop}px`,
                      height: `${getPosition(schedules.find(s => s.id === draggingId)!.start_time, schedules.find(s => s.id === draggingId)!.end_time, day).height}px`,
                      opacity: 0.8,
                      zIndex: 100
                    }}
                  >
                    <div className="block-title">{schedules.find(s => s.id === draggingId)?.title}</div>
                  </div>
                )}
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
                    font-size: var(--text-xs);
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
                    font-size: var(--text-base);
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .day-col-header.today .day-val-circle {
                    background: var(--accent-primary);
                    color: var(--text-inverse);
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
                    font-size: var(--text-xs);
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
                    background: var(--accent-primary);
                    z-index: 10;
                    pointer-events: none;
                }

                .time-dot {
                    position: absolute;
                    left: -4px;
                    top: -4px;
                    width: 10px;
                    height: 10px;
                    background: var(--accent-primary);
                    border-radius: 50%;
                    border: 2px solid var(--bg-elevated);
                    box-shadow: 0 0 4px rgba(0,0,0,0.2);
                }

                .week-schedule-block {
                    position: absolute;
                    left: 2px;
                    right: 2px;
                    border-radius: 6px;
                    padding: 6px;
                    background: var(--accent-primary);
                    color: var(--text-inverse);
                    z-index: 2;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    cursor: pointer;
                    transition: transform 0.1s;
                    user-select: none; /* Prevent flickering during drag */
                }

                .week-schedule-block:active {
                    transform: scale(0.98);
                }

                .block-title {
                    font-size: var(--text-xs);
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .block-time {
                    font-size: var(--text-xs);
                    font-weight: 500;
                    opacity: 0.9;
                }

                .week-schedule-block.meeting { background: var(--schedule-blue); }
                .week-schedule-block.appointment { background: var(--schedule-red); }
                .week-schedule-block.important { background: var(--schedule-green); }
                .week-schedule-block.default { background: var(--schedule-gray); }
            `}</style>
    </div>
  );
}
