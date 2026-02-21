'use client';

import { useState } from 'react';
import { X, Clock, Calendar as CalendarIcon, RotateCcw, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getTimeSlots, getTimeSlotDate } from '@/utils/dateUtils';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialDate?: Date;
}

export default function ScheduleModal({ isOpen, onClose, onSave, initialDate }: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<any>('업무');
  const [importance, setImportance] = useState<any>('medium');
  const [isAppointment, setIsAppointment] = useState(false);
  const [isMeeting, setIsMeeting] = useState(false);
  const [date, setDate] = useState(format(initialDate || new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringConfig, setRecurringConfig] = useState<any>({ type: 'weekly', days: [1] });
  const [loading, setLoading] = useState(false);

  const timeSlots = getTimeSlots();

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title) return alert('제목을 입력해주세요.');

    setLoading(true);
    try {
      const start = getTimeSlotDate(parseISO(date), startTime);
      const end = getTimeSlotDate(parseISO(date), endTime);

      const scheduleData = {
        title,
        description,
        type,
        importance,
        is_appointment: isAppointment,
        is_meeting: isMeeting,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_recurring: isRecurring,
      };

      if (isRecurring) {
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

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up">
        <header className="modal-header">
          <h2>새 일정 등록</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
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
            <div className="time-row">
              <CalendarIcon size={18} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="time-row">
              <Clock size={18} />
              <div className="time-selects">
                <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                  {timeSlots.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                </select>
                <span>~</span>
                <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                  {timeSlots.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

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
        </div>

        <footer className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button className="save-btn shadow-md" onClick={handleSave} disabled={loading}>
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </footer>
      </div>

      <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    z-index: 200;
                }

                .modal-content {
                    width: 100%;
                    max-width: 500px;
                    background: white;
                    border-radius: 24px 24px 0 0;
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
                    font-size: 19px;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .close-btn { color: var(--text-muted); padding: 4px; }

                .title-input {
                    width: 100%;
                    border: none;
                    background: #F8FAFC;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 18px;
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
                    background: #F8FAFC;
                    border: none;
                    border-radius: 12px;
                    resize: none;
                    font-size: 14px;
                    color: var(--text-primary);
                    outline: none;
                }

                label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                    margin-left: 4px;
                }

                select {
                    width: 100%;
                    padding: 12px;
                    background: #F8FAFC;
                    border: none;
                    border-radius: 12px;
                    font-size: 14px;
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
                    background: #F1F5F9;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid transparent;
                }

                .toggle-card.active {
                    background: white;
                    border-color: var(--accent-primary);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
                }

                .toggle-card input { display: none; }
                .toggle-card .emoji { font-size: 20px; }
                .toggle-card .label { font-size: 13px; font-weight: 700; color: var(--text-primary); }

                .time-config {
                    background: #F8FAFC;
                    padding: 16px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .time-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--accent-primary);
                }

                .time-row input[type="date"] {
                    background: none;
                    border: none;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .time-selects {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-muted);
                }

                .time-selects select {
                    background: none;
                    padding: 0;
                    width: auto;
                    font-weight: 600;
                }

                .recurring-section {
                    padding: 16px;
                    background: #F8FAFC;
                    border-radius: 16px;
                }

                .toggle-item-simple {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .recurring-picker {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #E2E8F0;
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
                    border-radius: 14px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    background: #F1F5F9;
                }

                .save-btn {
                    padding: 16px;
                    border-radius: 14px;
                    background: var(--accent-primary);
                    color: white;
                    font-weight: 800;
                    font-size: 16px;
                }

                .save-btn:disabled { opacity: 0.5; }
            `}</style>
    </div>
  );
}
