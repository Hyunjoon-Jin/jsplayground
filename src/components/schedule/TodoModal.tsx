'use client';

import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Flag, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import DatePickerModal from '@/components/calendar/DatePickerModal';

interface TodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    initialData?: any;
}

export default function TodoModal({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialData
}: TodoModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('기타');
    const [importance, setImportance] = useState<any>('medium');
    const [status, setStatus] = useState<any>('pending');
    const [progress, setProgress] = useState(0);
    const [targetDate, setTargetDate] = useState<string | null>(null);
    const [deadline, setDeadline] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isTargetDatePickerOpen, setIsTargetDatePickerOpen] = useState(false);
    const [isDeadlinePickerOpen, setIsDeadlinePickerOpen] = useState(false);

    useEffect(() => {
        if (initialData && isOpen) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setType(initialData.type || '기타');
            setImportance(initialData.importance || 'medium');
            setStatus(initialData.status || 'pending');
            setProgress(initialData.progress || 0);
            setTargetDate(initialData.target_date || null);
            setDeadline(initialData.deadline || null);
        } else if (!initialData && isOpen) {
            setTitle('');
            setDescription('');
            setType('기타');
            setImportance('medium');
            setStatus('pending');
            setProgress(0);
            setTargetDate(null);
            setDeadline(null);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title) return alert('제목을 입력해주세요.');

        setLoading(true);
        try {
            const todoData = {
                title,
                description,
                type,
                importance,
                status,
                progress,
                target_date: targetDate,
                deadline: deadline,
            };

            if (initialData?.id) {
                await onSave({ ...todoData, id: initialData.id });
            } else {
                await onSave(todoData);
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
        if (!confirm('할 일을 삭제하시겠습니까?')) return;

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

    const getDDay = (dateStr: string) => {
        const diff = differenceInDays(parseISO(dateStr), new Date());
        if (diff === 0) return 'D-Day';
        return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-slide-up">
                <header className="modal-header">
                    <h2>{initialData ? '할 일 수정' : '새 할 일 등록'}</h2>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </header>

                <div className="modal-body">
                    <input
                        className="title-input"
                        placeholder="어떤 일을 해야 하나요?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div className="field-group">
                        <textarea
                            placeholder="상세 내용을 입력하세요 (선택 사항)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="field-group row">
                        <div className="select-container">
                            <label>유형</label>
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="미팅">미팅</option>
                                <option value="회의">회의</option>
                                <option value="업무보고">업무보고</option>
                                <option value="운동">운동</option>
                                <option value="식사">식사</option>
                                <option value="명상">명상</option>
                                <option value="약속">약속</option>
                                <option value="병원">병원</option>
                                <option value="쇼핑">쇼핑</option>
                                <option value="자기개발">자기개발</option>
                                <option value="강의">강의</option>
                                <option value="독서">독서</option>
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

                    <div className="status-progress-section">
                        <div className="status-row">
                            <label>상태</label>
                            <div className="status-btns">
                                {['pending', 'in_progress', 'completed'].map(s => (
                                    <button
                                        key={s}
                                        className={`status-btn ${status === s ? 'active' : ''}`}
                                        onClick={() => {
                                            setStatus(s);
                                            if (s === 'completed') setProgress(100);
                                            else if (s === 'pending' && progress === 100) setProgress(0);
                                        }}
                                    >
                                        {s === 'pending' && '대기'}
                                        {s === 'in_progress' && '진행 중'}
                                        {s === 'completed' && '완료'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="progress-row">
                            <div className="progress-header">
                                <label>진행률</label>
                                <span className="progress-value">{progress}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={progress}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setProgress(val);
                                    if (val === 100) setStatus('completed');
                                    else if (val > 0) setStatus('in_progress');
                                    else setStatus('pending');
                                }}
                            />
                        </div>
                    </div>

                    <div className="dates-section">
                        <div className="date-field">
                            <label>수행 날짜</label>
                            <button
                                className={`date-picker-trigger ${targetDate ? 'selected' : ''}`}
                                onClick={() => setIsTargetDatePickerOpen(true)}
                            >
                                <CalendarIcon size={16} />
                                <span>{targetDate ? format(parseISO(targetDate), 'yyyy. MM. dd') : '날짜 선택'}</span>
                                {targetDate && <X size={14} className="clear-date" onClick={(e) => { e.stopPropagation(); setTargetDate(null); }} />}
                            </button>
                        </div>
                        <div className="date-field">
                            <label>마감일 (D-Day)</label>
                            <button
                                className={`date-picker-trigger ${deadline ? 'selected d-day-active' : ''}`}
                                onClick={() => setIsDeadlinePickerOpen(true)}
                            >
                                <Flag size={16} />
                                <span>{deadline ? `${format(parseISO(deadline), 'yyyy. MM. dd')} (${getDDay(deadline)})` : '마감일 설정'}</span>
                                {deadline && <X size={14} className="clear-date" onClick={(e) => { e.stopPropagation(); setDeadline(null); }} />}
                            </button>
                        </div>
                    </div>
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
                    isOpen={isTargetDatePickerOpen}
                    currentDate={targetDate ? parseISO(targetDate) : new Date()}
                    onClose={() => setIsTargetDatePickerOpen(false)}
                    onSelect={(d) => setTargetDate(format(d, 'yyyy-MM-dd'))}
                />

                <DatePickerModal
                    isOpen={isDeadlinePickerOpen}
                    currentDate={deadline ? parseISO(deadline) : new Date()}
                    onClose={() => setIsDeadlinePickerOpen(false)}
                    onSelect={(d) => setDeadline(format(d, 'yyyy-MM-dd'))}
                />
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    z-index: 300;
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

                .modal-header h2 { font-size: 19px; font-weight: 800; color: var(--text-primary); }
                .close-btn { color: var(--text-muted); padding: 4px; }

                .title-input {
                    width: 100%;
                    border: none;
                    background: #F8FAFC;
                    padding: 18px;
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
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                    margin-left: 2px;
                }

                select {
                    width: 100%;
                    padding: 12px;
                    background: #F8FAFC;
                    border: none;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                    outline: none;
                }

                .status-progress-section {
                    background: #F8FAFC;
                    padding: 16px;
                    border-radius: 16px;
                    margin-bottom: 20px;
                }

                .status-row { margin-bottom: 20px; }
                .status-btns {
                    display: flex;
                    gap: 8px;
                }

                .status-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 700;
                    background: white;
                    color: var(--text-muted);
                    border: 1px solid #E2E8F0;
                    transition: all 0.2s;
                }

                .status-btn.active {
                    background: var(--accent-primary);
                    color: white;
                    border-color: var(--accent-primary);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }

                .progress-row { }
                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .progress-value {
                    font-size: 14px;
                    font-weight: 800;
                    color: var(--accent-primary);
                }

                input[type="range"] {
                    width: 100%;
                    height: 6px;
                    background: #E2E8F0;
                    border-radius: 3px;
                    appearance: none;
                    outline: none;
                }

                input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    background: var(--accent-primary);
                    border-radius: 50%;
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                }

                .dates-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .date-picker-trigger {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: #F8FAFC;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748B;
                    border: 1px solid transparent;
                    position: relative;
                }

                .date-picker-trigger.selected {
                    background: white;
                    border-color: #E2E8F0;
                    color: var(--text-primary);
                }

                .date-picker-trigger.d-day-active {
                    border-color: #EF444430;
                    background: #FEF2F2;
                    color: #EF4444;
                }

                .clear-date {
                    margin-left: auto;
                    color: #94A3B8;
                }

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

                .delete-btn {
                    padding: 16px;
                    border-radius: 14px;
                    font-weight: 700;
                    color: #EF4444;
                    background: #FEF2F2;
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
