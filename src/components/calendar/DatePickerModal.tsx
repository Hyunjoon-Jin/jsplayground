'use client';

import { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerModalProps {
    isOpen: boolean;
    currentDate: Date;
    onClose: () => void;
    onSelect: (date: Date) => void;
}

export default function DatePickerModal({ isOpen, currentDate: initialDate, onClose, onSelect }: DatePickerModalProps) {
    const [viewDate, setViewDate] = useState(initialDate);

    if (!isOpen) return null;

    const startMonthMonth = startOfMonth(viewDate);
    const endMonthMonth = endOfMonth(startMonthMonth);
    const startDay = startOfWeek(startMonthMonth);
    const endDay = endOfWeek(endMonthMonth);

    const days = eachDayOfInterval({
        start: startDay,
        end: endDay,
    });

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(subMonths(viewDate, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(addMonths(viewDate, 1));
    };

    return (
        <div className="picker-overlay" onClick={onClose}>
            <div className="picker-content" onClick={(e) => e.stopPropagation()}>
                <div className="picker-header">
                    <button onClick={handlePrevMonth} className="p-nav-btn">
                        <ChevronLeft size={16} />
                    </button>
                    <h2 className="p-title">
                        {format(viewDate, 'MMMM yyyy')}
                    </h2>
                    <button onClick={handleNextMonth} className="p-nav-btn">
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="p-grid-header">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <div key={d} className="p-weekday">{d}</div>
                    ))}
                </div>

                <div className="p-grid">
                    {days.map((day, idx) => {
                        const isSelected = isSameDay(day, initialDate);
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, viewDate);

                        return (
                            <button
                                key={idx}
                                className={`p-day-btn ${!isCurrentMonth ? 'p-other' : ''} ${isSelected ? 'p-selected' : ''} ${isToday && !isSelected ? 'p-today' : ''}`}
                                onClick={() => {
                                    onSelect(day);
                                    onClose();
                                }}
                            >
                                {format(day, 'd')}
                            </button>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
        .picker-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .picker-content {
          background: white;
          width: 340px;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          border: 1px solid #E2E8F0;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .picker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .p-title {
          font-size: 19px;
          font-weight: 500;
          color: #1A1A1A;
          letter-spacing: -0.01em;
        }

        .p-nav-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #64748B;
          background: white;
          border: 1px solid #F1F5F9;
          transition: all 0.2s;
          cursor: pointer;
        }

        .p-nav-btn:hover {
          background: #F8FAFC;
          border-color: #E2E8F0;
        }

        .p-grid-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 16px;
        }

        .p-weekday {
          text-align: center;
          font-size: 15px;
          font-weight: 500;
          color: #94A3B8;
        }

        .p-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .p-day-btn {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.1s;
          background: transparent;
          border: none;
          color: #1A1A1A;
          cursor: pointer;
        }

        .p-day-btn:hover:not(.p-selected) {
          background: #F8FAFC;
        }

        .p-day-btn.p-other {
          color: #CBD5E1;
          visibility: visible;
          opacity: 0.5;
        }

        .p-day-btn.p-selected {
          background: #1C1C1E !important;
          color: white !important;
          font-weight: 600;
        }

        .p-day-btn.p-today:not(.p-selected) {
          color: #1C1C1E;
          font-weight: 800;
        }
      `}</style>
        </div>
    );
}
