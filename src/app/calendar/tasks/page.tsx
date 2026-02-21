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
    Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function TasksPage() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterImportance, setFilterImportance] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, importance-high

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

    const filteredAndSortedSchedules = useMemo(() => {
        let result = schedules.filter(item => {
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
    }, [schedules, searchQuery, filterType, filterImportance, sortBy]);

    const importanceLabel: any = {
        high: { text: '높음', color: '#EF4444' },
        medium: { text: '중간', color: '#F59E0B' },
        low: { text: '낮음', color: '#10B981' }
    };

    if (loading) {
        return <div className="loading">데이터를 불러오는 중...</div>;
    }

    return (
        <div className="tasks-container">
            <header className="tasks-header">
                <h1 className="page-title">일정 통합 관리</h1>

                <div className="search-bar-container shadow-sm">
                    <SearchIcon size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="일정 제목이나 내용을 검색하세요"
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
            </header>

            <main className="tasks-list">
                {filteredAndSortedSchedules.length > 0 ? (
                    filteredAndSortedSchedules.map(item => (
                        <div key={item.id} className="task-item shadow-sm">
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
                    margin-bottom: 20px;
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
