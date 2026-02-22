'use client';

import {
  format,
  isSameDay,
  parseISO,
  addMinutes,
  differenceInMinutes,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getTimeSlots } from '@/utils/dateUtils';
import { useSchedules } from '@/hooks/useSchedules';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface DayViewProps {
  currentDate: Date;
}

export default function DayView({ currentDate }: DayViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { schedules, loading } = useSchedules(currentDate, 'day');
  const timeSlots = getTimeSlots();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dragging/Moving state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [tempTop, setTempTop] = useState<number>(0);
  const dragStartRef = useRef<{ y: number; top: number; schedule: any } | null>(null);

  // Resizing state
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [tempHeight, setTempHeight] = useState<number>(0);
  const resizeStartRef = useRef<{ y: number; height: number; schedule: any } | null>(null);

  // Real-time current time for indicator
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current && isSameDay(currentDate, new Date())) {
      const minutes = (now.getHours() * 60 + now.getMinutes()) * (70 / 60);
      scrollRef.current.scrollTop = minutes - 100;
    }
  }, [currentDate]);

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

  // --- Real-time Move (Custom Mouse Move) ---
  const handleMoveStart = (e: React.MouseEvent, schedule: any) => {
    e.stopPropagation();
    const { top } = getPosition(schedule.start_time, schedule.end_time, currentDate);

    setDraggingId(schedule.id);
    setTempTop(top);
    dragStartRef.current = { y: e.clientY, top, schedule };

    // Disable selection globally
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;

      // Real-time top position (no snap for visual smoothness, or maybe light snap)
      let nextTop = dragStartRef.current.top + deltaY;
      setTempTop(nextTop);
    };

    const onMouseUp = async () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';

      if (dragStartRef.current) {
        const { schedule } = dragStartRef.current;
        const finalTop = Math.max(0, tempTop);
        // pixel to minutes (1px = 60/70 min)
        let minutesTotal = finalTop * (60 / 70);
        // Snap to 15 mins
        minutesTotal = Math.round(minutesTotal / 15) * 15;

        const originalDuration = differenceInMinutes(parseISO(schedule.end_time), parseISO(schedule.start_time));
        const newStart = addMinutes(startOfDay(currentDate), minutesTotal);
        const newEnd = addMinutes(newStart, originalDuration);

        await updateSchedule(schedule, newStart, newEnd);
      }

      setDraggingId(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // --- Drag to Resize ---
  const handleResizeStart = (e: React.MouseEvent, schedule: any) => {
    e.stopPropagation();
    const { height } = getPosition(schedule.start_time, schedule.end_time, currentDate);

    setResizingId(schedule.id);
    setTempHeight(height);
    resizeStartRef.current = { y: e.clientY, height, schedule };

    // Disable selection globally during resize
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const deltaY = moveEvent.clientY - resizeStartRef.current.y;

      // Calculate new height with 15-min snap (15 min = 17.5px)
      let nextHeight = Math.max(17.5, resizeStartRef.current.height + deltaY);
      nextHeight = Math.round(nextHeight / 17.5) * 17.5;

      setTempHeight(nextHeight);
    };

    const onMouseUp = async () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';

      if (resizeStartRef.current) {
        const { schedule } = resizeStartRef.current;
        // pixel to minutes (1px = 60/70 min)
        const newDuration = tempHeight * (60 / 70);
        const newEnd = addMinutes(parseISO(schedule.start_time), Math.round(newDuration));

        await updateSchedule(schedule, parseISO(schedule.start_time), newEnd);
      }

      setResizingId(null);
      resizeStartRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    // If we're clicking on a card, handleScheduleClick already stopped propagation.
    // Also ignore if we are currently resizing or dragging
    if (resizingId || draggingId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    // 1hr = 70px => 1min = 70/60 px => 1px = 60/70 min
    let minutesTotal = Math.max(0, clickY * (60 / 70));
    // Snap to 15 mins
    minutesTotal = Math.round(minutesTotal / 15) * 15;

    const hours = Math.floor(minutesTotal / 60);
    const mins = Math.floor(minutesTotal % 60);

    const startTimeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    // Default 30 min duration
    const endMinutesTotal = minutesTotal + 30;
    const endHours = Math.floor(endMinutesTotal / 60);
    const endMins = Math.floor(endMinutesTotal % 60);
    const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    window.dispatchEvent(new CustomEvent('create-schedule', {
      detail: { start: startTimeStr, end: endTimeStr }
    }));
  };

  const updateSchedule = async (schedule: any, newStart: Date, newEnd: Date) => {
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
      alert('일정 업데이트 중 오류가 발생했습니다.');
    }
  };

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

          <div
            className="timeline-column"
            onClick={handleTimelineClick}
          >
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="hour-marker" />
            ))}

            {isSameDay(currentDate, new Date()) && (
              <div
                className="current-time-line"
                style={{ top: `${(now.getHours() * 60 + now.getMinutes()) * (70 / 60)}px` }}
              >
                <div className="time-dot" />
              </div>
            )}

            {schedules.filter(s => {
              const dayStart = startOfDay(currentDate);
              const dayEnd = endOfDay(currentDate);
              const sStart = new Date(s.start_time);
              const sEnd = new Date(s.end_time);
              return (sStart <= dayEnd && sEnd >= dayStart);
            }).map(schedule => {
              const { top, height } = getPosition(schedule.start_time, schedule.end_time, currentDate);
              const isResizing = resizingId === schedule.id;
              const isDragging = draggingId === schedule.id;

              const displayTop = isDragging ? tempTop : top;
              const displayHeight = isResizing ? tempHeight : height;

              return (
                <div
                  key={schedule.id}
                  className={`day-schedule-card shadow-md clickable ${getBadgeClass(schedule)} ${isResizing ? 'resizing' : ''} ${isDragging ? 'dragging' : ''} ${schedule.is_all_day ? 'all-day' : ''}`}
                  style={{ top: `${displayTop}px`, height: `${displayHeight}px` }}
                  onClick={(e) => handleScheduleClick(schedule, e)}
                  onMouseDown={(e) => handleMoveStart(e, schedule)}
                >
                  <div className="card-content-premium">
                    <div className="card-header-mini">
                      {schedule.is_all_day && <span className="all-day-tag">종일</span>}
                      {schedule.is_time_not_set && <span className="no-time-tag">시간미지정</span>}
                      <span className="card-type">[{schedule.type}]</span>
                    </div>
                    <div className="card-title-main">{schedule.title}</div>
                    {!schedule.is_all_day && !schedule.is_time_not_set && (
                      <div className="card-time-range">
                        {format(parseISO(schedule.start_time), 'HH:mm')} - {format(parseISO(schedule.end_time), 'HH:mm')}
                      </div>
                    )}
                  </div>
                  {displayHeight > 50 && (
                    <div className="card-body">
                      <p className="card-desc">{schedule.description || '상세 일정 정보가 없습니다.'}</p>
                    </div>
                  )}

                  {/* Resize Handle */}
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => handleResizeStart(e, schedule)}
                  />
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
                    cursor: pointer;
                    user-select: none; /* Prevent text selection during drag/resize */
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

                .day-schedule-card.resizing {
                    z-index: 100 !important;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                    opacity: 0.9;
                }

                .resize-handle {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 10px;
                    cursor: ns-resize;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .resize-handle::after {
                    content: '';
                    width: 30px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                    transition: background 0.2s;
                }

                .resize-handle:hover::after {
                    background: rgba(255, 255, 255, 0.6);
                }
            `}</style>
    </div>
  );
}
