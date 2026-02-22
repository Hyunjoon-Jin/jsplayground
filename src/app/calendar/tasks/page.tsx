'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    Search as SearchIcon,
    Filter,
    ArrowUpDown,
    Calendar as CalendarIcon,
    Tag,
    AlertCircle,
    Clock,
    ChevronRight,
    CalendarCheck,
    History,
    Target,
    Zap
} from 'lucide-react';
import { format, parseISO, isYesterday, isToday, isTomorrow, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function TasksPage() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterImportance, setFilterImportance] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, importance-high
    const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'yesterday' | 'today' | 'tomorrow'>('all');

    useEffect(() => {
        const fetchAllSchedules = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('schedules')
                .select('*')
                .order('start_time', { ascending: false });

            if (data) setSchedules(data);
            setLoading(false);
        };

        fetchAllSchedules();
    }, []);

    const dateTiers = useMemo(() => {
        const now = new Date();
        return {
            yesterday: schedules.filter(s => isYesterday(parseISO(s.start_time))),
            today: schedules.filter(s => isToday(parseISO(s.start_time))),
            tomorrow: schedules.filter(s => isTomorrow(parseISO(s.start_time))),
        };
    }, [schedules]);

    const filteredAndSortedSchedules = useMemo(() => {
        const now = new Date();
        let result = schedules.filter(item => {
            const date = parseISO(item.start_time);

            // Date Range Filter
            if (selectedDateRange === 'yesterday' && !isYesterday(date)) return false;
            if (selectedDateRange === 'today' && !isToday(date)) return false;
            if (selectedDateRange === 'tomorrow' && !isTomorrow(date)) return false;

            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesType = filterType === 'all' || item.type === filterType;
            const matchesImportance = filterImportance === 'all' || item.importance === filterImportance;

            return matchesSearch && matchesType && matchesImportance;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'date-desc') return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
            if (sortBy === 'date-asc') return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
            if (sortBy === 'importance-high') {
                const importanceMap: any = { high: 3, medium: 2, low: 1 };
                return importanceMap[b.importance] - importanceMap[a.importance];
            }
            return 0;
        });

        return result;
    }, [schedules, searchQuery, filterType, filterImportance, sortBy, selectedDateRange]);

    const handleScheduleClick = (schedule: any) => {
        window.dispatchEvent(new CustomEvent('edit-schedule', { detail: schedule }));
    };

    const importanceLabel: any = {
        high: { text: '높음', color: '#EF4444' },
        medium: { text: '보통', color: '#F59E0B' },
        low: { text: '낮음', color: '#10B981' }
    };

    if (loading) {
        return <div className="loading">데이터를 불러오는 중...</div>;
    }

    const SummaryCard = ({ title, count, items, type, icon: Icon, color }: { title: string, count: number, items: any[], type: string, icon: any, color: string }) => {
        const isActive = selectedDateRange === type;
        const percentage = Math.min(100, (count / 5) * 100);

        return (
            <div
                className={`summary-card-infographic ${type} ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedDateRange(isActive ? 'all' : type as any)}
            >
                {/* Background Decoration Icon */}
                <div className="card-bg-icon" style={{ color }}>
                    <Icon size={100} strokeWidth={1} />
                </div>

                <div className="card-content-top">
                    <div className="header-row">
                        <span className="info-label">{title}</span>
                        <div className="mini-icon-badge" style={{ backgroundColor: `${color}15`, color }}>
                            <Icon size={14} />
                        </div>
                    </div>
                    <div className="data-row">
                        <span className="main-stat" style={{ color: isActive ? color : '#1e293b' }}>{count}</span>
                        <span className="stat-unit">개</span>
                    </div>
                </div>

                <div className="card-content-bottom">
                    <div className="visual-graph-container">
                        <div className="graph-bar-bg">
                            <div className="graph-bar-fill" style={{ width: `${percentage}%`, backgroundColor: color }} />
                        </div>
                        <div className="graph-labels">
                            <span className="graph-hint">밀도</span>
                            <span className="graph-value">{percentage.toFixed(0)}%</span>
                        </div>
                    </div>

                    <div className="card-preview-mini">
                        {items.length > 0 ? (
                            <span className="preview-simple-text">
                                {items[0].title}{items.length > 1 ? ` 외 ${items.length - 1}개` : ''}
                            </span>
                        ) : (
                            <span className="preview-empty-text">일정 없음</span>
                        )}
                    </div>
                </div>
                {isActive && <div className="active-border-glow" style={{ backgroundColor: color }} />}
            </div>
        );
    };

    return (
        <div className="tasks-container">
            <header className="tasks-header">
                <h1 className="page-title">모든 일정 내역</h1>

                <div className="summary-section-modern">
                    <SummaryCard
                        title="어제"
                        count={dateTiers.yesterday.length}
                        items={dateTiers.yesterday}
                        type="yesterday"
                        icon={History}
                        color="#64748B"
                    />
                    <SummaryCard
                        title="오늘"
                        count={dateTiers.today.length}
                        items={dateTiers.today}
                        type="today"
                        icon={Target}
                        color="#3B82F6"
                    />
                    <SummaryCard
                        title="내일"
                        count={dateTiers.tomorrow.length}
                        items={dateTiers.tomorrow}
                        type="tomorrow"
                        icon={Zap}
                        color="#10B981"
                    />
                </div>

                <div className="search-bar-container shadow-sm">
                    <SearchIcon size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="일정 제목이나 내용을 검색해보세요"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="controls-row">
                    <div className="filter-group">
                        <div className="select-wrapper">
                            <Tag size={14} />
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="all">모든 유형</option>
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
                        <div className="select-wrapper">
                            <AlertCircle size={14} />
                            <select value={filterImportance} onChange={(e) => setFilterImportance(e.target.value)}>
                                <option value="all">모든 중요도</option>
                                <option value="high">중요도: 높음</option>
                                <option value="medium">중요도: 보통</option>
                                <option value="low">중요도: 낮음</option>
                            </select>
                        </div>
                    </div>

                    <div className="sort-group">
                        <div className="select-wrapper sort">
                            <ArrowUpDown size={14} />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="date-desc">최신순</option>
                                <option value="date-asc">과거순</option>
                                <option value="importance-high">중요도순</option>
                            </select>
                        </div>
                    </div>
                </div>

                {selectedDateRange !== 'all' && (
                    <div className="active-filter-bar shadow-sm">
                        <div className="filter-info">
                            <CalendarCheck size={16} />
                            <span>
                                {selectedDateRange === 'yesterday' ? '어제' : selectedDateRange === 'today' ? '오늘' : '내일'}의 일정 목록
                            </span>
                        </div>
                        <button className="clear-filter" onClick={() => setSelectedDateRange('all')}>필터 해제</button>
                    </div>
                )}
            </header>

            <main className="tasks-list">
                {filteredAndSortedSchedules.length > 0 ? (
                    filteredAndSortedSchedules.map(item => (
                        <div key={item.id} className="task-item shadow-sm clickable" onClick={() => handleScheduleClick(item)}>
                            <div className="task-main">
                                <div className="task-date-info">
                                    <span className="task-date">{format(parseISO(item.start_time), 'yyyy.MM.dd (eee)', { locale: ko })}</span>
                                    <span className="task-time">
                                        <Clock size={12} />
                                        {format(parseISO(item.start_time), 'HH:mm')} - {format(parseISO(item.end_time), 'HH:mm')}
                                    </span>
                                </div>
                                <h3 className="task-title">{item.title}</h3>
                                {item.description && <p className="task-desc">{item.description}</p>}
                                <div className="task-tags">
                                    <span className="tag type">{item.type}</span>
                                    <span className="tag importance" style={{ backgroundColor: `${importanceLabel[item.importance].color}15`, color: importanceLabel[item.importance].color }}>
                                        중요도: {importanceLabel[item.importance].text}
                                    </span>
                                    {(item.is_appointment || item.is_meeting) && (
                                        <span className="tag spec">
                                            {item.is_appointment ? '약속' : '회의'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="task-accent" style={{ backgroundColor: item.color || '#3B82F6' }}></div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <CalendarIcon size={48} className="empty-icon" />
                        <p>일치하는 일정이 없습니다.</p>
                    </div>
                )}
            </main>

            <style jsx>{`
                .tasks-container {
                    padding: 24px 20px;
                    padding-bottom: 100px;
                    background: #F8FAFC;
                    min-height: 100vh;
                }

                .tasks-header {
                    margin-bottom: 24px;
                }

                .page-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 24px;
                }

                .summary-section-modern {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .summary-card-infographic {
                    background: white;
                    border-radius: 28px;
                    padding: 24px;
                    border: 1px solid #F1F5F9;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    min-height: 180px;
                }

                .summary-card-infographic:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08);
                    border-color: #E2E8F0;
                }

                .summary-card-infographic.active {
                    background: #FAFBFC;
                    border-color: #CBD5E1;
                    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.02);
                }

                .card-bg-icon {
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    opacity: 0.03;
                    pointer-events: none;
                    transform: rotate(-15deg);
                }

                .card-content-top {
                    position: relative;
                    z-index: 1;
                }

                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .info-label {
                    font-size: 14px;
                    font-weight: 700;
                    color: #94A3B8;
                    letter-spacing: -0.01em;
                }

                .mini-icon-badge {
                    width: 28px;
                    height: 28px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .data-row {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                }

                .main-stat {
                    font-size: 40px;
                    font-weight: 900;
                    line-height: 1;
                    letter-spacing: -0.02em;
                }

                .stat-unit {
                    font-size: 12px;
                    font-weight: 700;
                    color: #94A3B8;
                    text-transform: uppercase;
                }

                .card-content-bottom {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .visual-graph-container {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .graph-bar-bg {
                    height: 6px;
                    background: #F1F5F9;
                    border-radius: 100px;
                    overflow: hidden;
                }

                .graph-bar-fill {
                    height: 100%;
                    border-radius: 100px;
                    transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .graph-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    font-weight: 700;
                }

                .graph-hint {
                    color: #94A3B8;
                }

                .graph-value {
                    color: #475569;
                }

                .card-preview-mini {
                    border-top: 1px solid #F1F5F9;
                    padding-top: 12px;
                }

                .preview-simple-text {
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .preview-empty-text {
                    font-size: 11px;
                    font-weight: 600;
                    color: #CBD5E1;
                    font-style: italic;
                }

                .active-border-glow {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    height: 4px;
                }

                .active-filter-bar {
                    background: #3B82F6;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    margin-top: 16px;
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .filter-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 700;
                }

                .clear-filter {
                    font-size: 12px;
                    font-weight: 700;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 4px 10px;
                    border-radius: 8px;
                }

                .search-bar-container {
                    background: white;
                    border-radius: 16px;
                    padding: 14px 18px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    border: 1px solid #F1F5F9;
                }

                .search-icon {
                    color: #94A3B8;
                }

                .search-bar-container input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 15px;
                    color: var(--text-primary);
                }

                .controls-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .filter-group {
                    display: flex;
                    gap: 8px;
                }

                .select-wrapper {
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 10px;
                    padding: 6px 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #64748B;
                }

                .select-wrapper select {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                }

                .select-wrapper.sort {
                    background: #F1F5F9;
                    border-color: transparent;
                }

                .tasks-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-top: 10px;
                }

                .task-item {
                    background: white;
                    border-radius: 18px;
                    overflow: hidden;
                    display: flex;
                    border: 1px solid #F1F5F9;
                    transition: transform 0.2s;
                }

                .task-item:active {
                    transform: scale(0.98);
                }

                .task-main {
                    flex: 1;
                    padding: 20px;
                    text-align: left;
                }

                .task-date-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .task-date {
                    font-size: 13px;
                    font-weight: 700;
                    color: #3B82F6;
                }

                .task-time {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: #94A3B8;
                    font-weight: 500;
                }

                .task-title {
                    font-size: 17px;
                    font-weight: 800;
                    color: #1E293B;
                    margin-bottom: 6px;
                }

                .task-desc {
                    font-size: 14px;
                    color: #64748B;
                    margin-bottom: 14px;
                    line-height: 1.5;
                }

                .task-tags {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .tag {
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 700;
                }

                .tag.type {
                    background: #F1F5F9;
                    color: #475569;
                }

                .tag.spec {
                    background: #3B82F610;
                    color: #3B82F6;
                    border: 1px solid #3B82F620;
                }

                .task-accent {
                    width: 6px;
                }

                .empty-state {
                    padding: 60px 0;
                    text-align: center;
                    color: #CBD5E1;
                }

                .empty-icon {
                    margin-bottom: 16px;
                }

                .loading {
                    padding: 100px 0;
                    text-align: center;
                    color: #94A3B8;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
