'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Calendar as CalendarIcon, RotateCcw, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getTimeSlots, getTimeSlotDate } from '@/utils/dateUtils';
import DatePickerModal from '@/components/calendar/DatePickerModal';
import { useTodos } from '@/hooks/useTodos';
import { Target } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialDate?: Date;
  initialData?: any;
  initialStartTime?: string;
  initialEndTime?: string;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  initialData,
  initialStartTime,
  initialEndTime
}: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<any>('미팅');
  const [importance, setImportance] = useState<any>('medium');
  const [isAppointment, setIsAppointment] = useState(false);
  const [isMeeting, setIsMeeting] = useState(false);
  const [startDate, setStartDate] = useState(format(initialDate || new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(initialDate || new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [isTimeNotSet, setIsTimeNotSet] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringConfig, setRecurringConfig] = useState<any>({ type: 'weekly', days: [1] });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [todoId, setTodoId] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  const { todos } = useTodos();

  useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setType(initialData.type || '미팅');
      setImportance(initialData.importance || 'medium');
      setIsAppointment(initialData.is_appointment || false);
      setIsMeeting(initialData.is_meeting || false);

      const start = parseISO(initialData.start_time);
      const end = parseISO(initialData.end_time);
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndTime(format(end, 'HH:mm'));
      setIsAllDay(initialData.is_all_day || false);
      setIsTimeNotSet(initialData.is_time_not_set || false);
      setIsRecurring(initialData.is_recurring || false);
      setTodoId(initialData.todo_id || '');
    } else if (!initialData && isOpen) {
      // Clear for new
      setTitle('');
      setDescription('');
      setType('미팅');
      setImportance('medium');
      setIsAppointment(false);
      setIsMeeting(false);
      const defaultDate = format(initialDate || new Date(), 'yyyy-MM-dd');
      setStartDate(defaultDate);
      setEndDate(defaultDate);
      setStartTime(initialStartTime || '09:00');
      setEndTime(initialEndTime || '10:00');
      setIsAllDay(false);
      setIsTimeNotSet(false);
      setIsRecurring(false);
      setTodoId('');
    }
  }, [initialData, isOpen, initialDate, initialStartTime, initialEndTime]);

  const timeSlots = getTimeSlots();

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);

    const startMins = timeToMinutes(newStart);
    const endMins = timeToMinutes(endTime);

    if (endMins <= startMins) {
      // Automatically set end time to start + 30 mins
      const nextEndMins = Math.min(23 * 60 + 45, startMins + 30);
      const h = Math.floor(nextEndMins / 60);
      const m = nextEndMins % 60;
      setEndTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title) return alert('제목을 입력해주세요.');

    setLoading(true);
    try {
      let finalStartTime = startTime;
      let finalEndTime = endTime;

      if (isAllDay || isTimeNotSet) {
        finalStartTime = '00:00';
        finalEndTime = '23:59';
      }

      const start = getTimeSlotDate(parseISO(startDate), finalStartTime);
      const end = getTimeSlotDate(parseISO(endDate), finalEndTime);

      const scheduleData: any = {
        title,
        description,
        type,
        importance,
        is_appointment: isAppointment,
        is_meeting: isMeeting,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_all_day: isAllDay,
        is_time_not_set: isTimeNotSet,
        is_recurring: isRecurring,
        todo_id: todoId || null,
      };

      if (initialData?.id) {
        scheduleData.id = initialData.id;
      }

      if (isRecurring && !initialData?.id) {
        await onSave({ ...scheduleData, recurringConfig });
      } else {
        await onSave(scheduleData);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !onDelete) return;
    if (!confirm('일정을 삭제하시겠습니까?')) return;

    setDeleting(true);
    try {
      await onDelete(initialData.id);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up">
        <header className="modal-header">
          <h2>{initialData ? '일정 수정' : '새 일정 등록'}</h2>
          <button onClick={onClose} className="close-btn" aria-label="닫기"><X size={24} /></button>
        </header>

        <div className="modal-body">
          <input
            className="title-input"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="field-group">
            <textarea
              placeholder="설명 (선택 사항)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field-group row">
            <div className="select-container">
              <label>유형</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <optgroup label="업무/비즈니스">
                  <option value="미팅">미팅</option>
                  <option value="회의">회의</option>
                  <option value="업무보고">업무보고</option>
                </optgroup>
                <optgroup label="개인/라이프">
                  <option value="운동">운동</option>
                  <option value="식사">식사</option>
                  <option value="명상">명상</option>
                  <option value="약속">약속</option>
                  <option value="병원">병원</option>
                  <option value="쇼핑">쇼핑</option>
                </optgroup>
                <optgroup label="학습/성장">
                  <option value="자기개발">자기개발</option>
                  <option value="강의">강의</option>
                  <option value="독서">독서</option>
                </optgroup>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className="select-container">
              <label>중요도</label>
              <select value={importance} onChange={(e) => setImportance(e.target.value)}>
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>
          </div>

          <div className="field-group">
            <div className="select-container todo-link">
              <label><Target size={14} style={{ marginRight: 4 }} /> 연동할 할 일 (선택)</label>
              <select value={todoId} onChange={(e) => setTodoId(e.target.value)}>
                <option value="">연동 안 함</option>
                <optgroup label="진행 중인 할 일">
                  {todos.filter(t => t.status !== 'completed').map(todo => (
                    <option key={todo.id} value={todo.id}>{todo.title}</option>
                  ))}
                </optgroup>
                <optgroup label="완료된 할 일">
                  {todos.filter(t => t.status === 'completed').map(todo => (
                    <option key={todo.id} value={todo.id}>{todo.title}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="toggle-grid">
            <label className={`toggle-card ${isAppointment ? 'active' : ''}`}>
              <input type="checkbox" checked={isAppointment} onChange={(e) => setIsAppointment(e.target.checked)} />
              <span className="emoji">🤝</span>
              <span className="label">약속</span>
            </label>
            <label className={`toggle-card ${isMeeting ? 'active' : ''}`}>
              <input type="checkbox" checked={isMeeting} onChange={(e) => setIsMeeting(e.target.checked)} />
              <span className="emoji">📹</span>
              <span className="label">회의</span>
            </label>
          </div>

          <div className="time-config">
            <div className="time-row-stack">
              <div className="time-label-group">
                <CalendarIcon size={16} />
                <span className="group-label">기간 설정</span>
              </div>

              <div className="date-range-picker">
                <button
                  className="custom-date-picker-btn"
                  onClick={() => setIsDatePickerOpen(true)}
                >
                  {format(parseISO(startDate), 'yyyy. MM. dd')}
                </button>
                <span className="arrow">→</span>
                <button
                  className="custom-date-picker-btn"
                  onClick={() => setIsEndDatePickerOpen(true)}
                >
                  {format(parseISO(endDate), 'yyyy. MM. dd')}
                </button>
              </div>
            </div>

            <div className="options-row">
              <label className="checkbox-label">
                <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
                <span className="custom-checkbox"></span>
                <span>종일</span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={isTimeNotSet} onChange={(e) => setIsTimeNotSet(e.target.checked)} />
                <span className="custom-checkbox"></span>
                <span>시간 미지정</span>
              </label>
            </div>

            {(!isAllDay && !isTimeNotSet) && (
              <div className="time-row">
                <Clock size={16} />
                <div className="time-selects">
                  <select value={startTime} onChange={(e) => handleStartTimeChange(e.target.value)}>
                    {timeSlots.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                  </select>
                  <span className="sep">~</span>
                  <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                    {timeSlots
                      .filter(t => startDate !== endDate || timeToMinutes(t) > timeToMinutes(startTime))
                      .map(t => <option key={`end-${t}`} value={t}>{t}</option>)
                    }
                  </select>
                </div>
              </div>
            )}
          </div>

          {!initialData && (
            <div className="recurring-section">
              <label className="toggle-item-simple">
                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                <span>🔁 반복 일정으로 설정</span>
              </label>
              {isRecurring && (
                <div className="recurring-picker">
                  <select value={recurringConfig.type} onChange={(e) => setRecurringConfig({ ...recurringConfig, type: e.target.value })}>
                    <option value="weekly">요일별 (매주)</option>
                    <option value="monthly">날짜별 (매월)</option>
                  </select>
                  <p className="hint">※ 설정한 규칙에 따라 2년치 일정이 생성됩니다.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="modal-footer">
          {initialData ? (
            <button className="delete-btn" onClick={handleDelete} disabled={deleting}>
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          ) : (
            <button className="cancel-btn" onClick={onClose}>취소</button>
          )}
          <button className="save-btn shadow-md" onClick={handleSave} disabled={loading}>
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </footer>

        <DatePickerModal
          isOpen={isDatePickerOpen}
          currentDate={parseISO(startDate)}
          onClose={() => setIsDatePickerOpen(false)}
          onSelect={(d) => {
            const newStart = format(d, 'yyyy-MM-dd');
            setStartDate(newStart);
            if (parseISO(endDate) < d) {
              setEndDate(newStart);
            }
          }}
        />

        <DatePickerModal
          isOpen={isEndDatePickerOpen}
          currentDate={parseISO(endDate)}
          onClose={() => setIsEndDatePickerOpen(false)}
          onSelect={(d) => {
            const newEnd = format(d, 'yyyy-MM-dd');
            if (d < parseISO(startDate)) {
              alert('종료일은 시작일보다 빠를 수 없습니다.');
              return;
            }
            setEndDate(newEnd);
          }}
        />
      </div>

      <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--bg-overlay);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    z-index: 200;
                }

                .modal-content {
                    width: 100%;
                    max-width: 500px;
                    background: var(--bg-elevated);
                    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
                    padding: 24px 20px;
                    padding-bottom: calc(24px + var(--safe-area-bottom));
                }

                .animate-slide-up {
                    animation: slideUp 0.35s cubic-bezier(0.19, 1, 0.22, 1);
                }

                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                }

                .modal-header h2 {
                    font-size: var(--text-md);
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .close-btn { color: var(--text-muted); padding: 4px; }

                .title-input {
                    width: 100%;
                    border: none;
                    background: var(--bg-surface);
                    padding: 16px;
                    border-radius: var(--radius-md);
                    font-size: var(--text-md);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 20px;
                    outline: none;
                }

                .field-group { margin-bottom: 16px; }
                .field-group.row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

                textarea {
                    width: 100%;
                    min-height: 80px;
                    padding: 14px;
                    background: var(--bg-surface);
                    border: none;
                    border-radius: var(--radius-md);
                    resize: none;
                    font-size: var(--text-sm);
                    color: var(--text-primary);
                    outline: none;
                }

                label {
                    display: block;
                    font-size: var(--text-xs);
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                    margin-left: 4px;
                }

                select {
                    width: 100%;
                    padding: 12px;
                    background: var(--bg-surface);
                    border: none;
                    border-radius: var(--radius-md);
                    font-size: var(--text-sm);
                    color: var(--text-primary);
                    outline: none;
                }

                .toggle-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .toggle-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    background: var(--bg-surface);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid transparent;
                }

                .toggle-card.active {
                    background: var(--bg-elevated);
                    border-color: var(--accent-primary);
                    box-shadow: var(--shadow-md);
                }

                .toggle-card input { display: none; }
                .toggle-card .emoji { font-size: 20px; }
                .toggle-card .label { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }

                .time-config {
                    background: var(--bg-surface);
                    padding: 16px;
                    border-radius: var(--radius-lg);
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .time-row-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .time-label-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--accent-primary);
                }

                .group-label {
                    font-size: var(--text-sm);
                    font-weight: 700;
                }

                .date-range-picker {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-elevated);
                    padding: 8px 12px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-default);
                }

                .date-range-picker .arrow {
                    color: var(--text-muted);
                    font-size: var(--text-sm);
                }

                .options-row {
                    display: flex;
                    gap: 20px;
                    margin-top: 4px;
                    padding-left: 4px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .custom-checkbox {
                    width: 18px;
                    height: 18px;
                    border: 2px solid var(--border-default);
                    border-radius: 6px;
                    display: inline-block;
                    position: relative;
                    transition: all 0.2s;
                }

                .checkbox-label input { display: none; }
                .checkbox-label input:checked + .custom-checkbox {
                    background: var(--accent-primary);
                    border-color: var(--accent-primary);
                }

                .checkbox-label input:checked + .custom-checkbox::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: var(--text-inverse);
                    font-size: var(--text-xs);
                }

                .time-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--accent-primary);
                    margin-top: 4px;
                    background: var(--bg-elevated);
                    padding: 8px 12px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-default);
                }

                .custom-date-picker-btn {
                    background: none;
                    border: none;
                    font-size: var(--text-sm);
                    font-weight: 600;
                    color: var(--text-primary);
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: background 0.2s;
                    text-align: left;
                }

                .custom-date-picker-btn:hover {
                    background: var(--bg-surface);
                }

                .time-selects {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-primary);
                }

                .time-selects select {
                    background: none;
                    border-radius: 0;
                    padding: 0;
                    font-weight: 700;
                    font-size: 15px;
                }

                .time-selects .sep {
                    color: var(--text-muted);
                    font-weight: 400;
                }

                .recurring-section {
                    padding: 16px;
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                }

                .toggle-item-simple {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: var(--text-sm);
                    font-weight: 600;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .recurring-picker {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid var(--border-default);
                }

                .hint { font-size: 11px; color: var(--text-muted); margin-top: 8px; }

                .modal-footer {
                    display: grid;
                    grid-template-columns: 100px 1fr;
                    gap: 12px;
                    margin-top: 32px;
                }

                .cancel-btn {
                    padding: 16px;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    color: var(--text-secondary);
                    background: var(--bg-surface);
                }

                .delete-btn {
                    padding: 16px;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    color: var(--error);
                    background: var(--error-bg);
                }

                .save-btn {
                    padding: 16px;
                    border-radius: var(--radius-md);
                    background: var(--accent-primary);
                    color: var(--text-inverse);
                    font-weight: 800;
                    font-size: var(--text-base);
                }

                .save-btn:disabled { opacity: 0.5; }
            `}</style>
    </div>
  );
}
