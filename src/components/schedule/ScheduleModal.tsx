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
                // Handle recurring logic via separate API endpoint if needed
                await onSave({ ...scheduleData, recurringConfig });
            } else {
                await onSave(scheduleData);
            }
            onClose();
        } catch (err) {
            console.error(err);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay glass">
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
                                <option value="업무">업무</option>
                                <option value="개인">개인</option>
                                <option value="학습">학습</option>
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

                    <div className="toggle-row">
                        <label className="toggle-item">
                            <input type="checkbox" checked={isAppointment} onChange={(e) => setIsAppointment(e.target.checked)} />
                            <span>🤝 약속</span>
                        </label>
                        <label className="toggle-item">
                            <input type="checkbox" checked={isMeeting} onChange={(e) => setIsMeeting(e.target.checked)} />
                            <span>📹 회의</span>
                        </label>
                    </div>

                    <div className="time-config">
                        <div className="time-row">
                            <CalendarIcon size={18} />
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div className="time-row">
                            <Clock size={18} />
                            <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                                {timeSlots.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                            </select>
                            <span>~</span>
                            <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                                {timeSlots.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="recurring-section">
                        <label className="toggle-item">
                            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                            <span>🔁 반복 설정</span>
                        </label>
                        {isRecurring && (
                            <div className="recurring-picker">
                                <select value={recurringConfig.type} onChange={(e) => setRecurringConfig({ ...recurringConfig, type: e.target.value })}>
                                    <option value="weekly">요일별 (매주)</option>
                                    <option value="monthly">날짜별 (매월)</option>
                                </select>
                                {/* Simplified day picker for brevity */}
                                <p className="hint">※ 설정한 규칙에 따라 2년치 일정이 생성됩니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                    <button className="save-btn" onClick={handleSave} disabled={loading}>
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
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 100;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          background: var(--bg-elevated);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          padding: 24px;
          box-shadow: var(--shadow-lg);
        }

        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
          font-size: var(--text-lg);
          font-weight: var(--weight-bold);
        }

        .close-btn { color: var(--text-muted); }

        .title-input {
          width: 100%;
          background: none;
          border: none;
          border-bottom: 2px solid var(--border-subtle);
          padding: 12px 0;
          font-size: var(--text-xl);
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          margin-bottom: 20px;
          border-radius: 0;
        }

        .title-input:focus {
          border-color: var(--accent-primary);
        }

        .field-group { margin-bottom: 20px; }
        .field-group.row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        textarea {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          border-radius: var(--radius-md);
          resize: none;
        }

        label {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        select {
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-md);
        }

        .toggle-row {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .toggle-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: var(--text-sm);
        }

        .time-config {
          background: rgba(255, 255, 255, 0.03);
          padding: 16px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .time-row {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
        }

        .time-row input, .time-row select {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: var(--text-base);
          padding: 0;
        }

        .recurring-section {
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .recurring-picker {
          margin-top: 12px;
          padding-left: 24px;
        }

        .hint { font-size: 10px; color: var(--text-muted); margin-top: 4px; }

        .modal-footer {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 12px;
          margin-top: 32px;
        }

        .cancel-btn {
          padding: 14px;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
        }

        .save-btn {
          padding: 14px;
          border-radius: var(--radius-md);
          background: var(--accent-primary);
          color: white;
          font-weight: var(--weight-bold);
          box-shadow: var(--shadow-glow);
        }

        .save-btn:disabled { opacity: 0.5; }
      `}</style>
        </div>
    );
}
