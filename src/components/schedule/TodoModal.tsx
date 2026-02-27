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
                    <button onClick={onClose} className="close-btn" aria-label="닫기"><X size={24} /></button>
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
                    background: var(--bg-overlay);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    z-index: 300;
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

                .modal-header h2 { font-size: var(--text-md); font-weight: 800; color: var(--text-primary); }
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
                    font-weight: 600;
                    color: var(--text-primary);
                    outline: none;
                }

                .status-progress-section {
                    background: var(--bg-surface);
                    padding: 16px;
                    border-radius: var(--radius-lg);
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
                    border-radius: var(--radius-sm);
                    font-size: var(--text-sm);
                    font-weight: 700;
                    background: var(--bg-elevated);
                    color: var(--text-muted);
                    border: 1px solid var(--border-default);
                    transition: all 0.2s;
                }

                .status-btn.active {
                    background: var(--accent-primary);
                    color: var(--text-inverse);
                    border-color: var(--accent-primary);
                    box-shadow: var(--shadow-glow);
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
                    background: var(--border-default);
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
                    border: 3px solid var(--bg-elevated);
                    box-shadow: var(--shadow-sm);
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
                    background: var(--bg-surface);
                    border-radius: var(--radius-md);
                    font-size: var(--text-sm);
                    font-weight: 600;
                    color: var(--text-secondary);
                    border: 1px solid transparent;
                    position: relative;
                }

                .date-picker-trigger.selected {
                    background: var(--bg-elevated);
                    border-color: var(--border-default);
                    color: var(--text-primary);
                }

                .date-picker-trigger.d-day-active {
                    border-color: var(--error);
                    background: var(--error-bg);
                    color: var(--error);
                }

                .clear-date {
                    margin-left: auto;
                    color: var(--text-muted);
                }

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
