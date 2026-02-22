'use client';

import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  setMonth,
  setYear,
  getYear
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  currentDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

type PickerMode = 'day' | 'month' | 'year';

export default function DatePickerModal({ isOpen, currentDate: initialDate, onClose, onSelect }: DatePickerModalProps) {
  const [viewDate, setViewDate] = useState(initialDate);
  const [mode, setMode] = useState<PickerMode>('day');

  if (!isOpen) return null;

  // Day View Logic
  const startMonthMonth = startOfMonth(viewDate);
  const endMonthMonth = endOfMonth(startMonthMonth);
  const startDay = startOfWeek(startMonthMonth);
  const endDay = endOfWeek(endMonthMonth);
  const days = eachDayOfInterval({ start: startDay, end: endDay });

  // Year View Logic
  const currentYear = getYear(viewDate);
  const startYearRange = Math.floor(currentYear / 12) * 12;
  const yearRange = Array.from({ length: 12 }, (_, i) => startYearRange + i);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'day') setViewDate(subMonths(viewDate, 1));
    else if (mode === 'month') setViewDate(subYears(viewDate, 1));
    else setViewDate(subYears(viewDate, 12));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'day') setViewDate(addMonths(viewDate, 1));
    else if (mode === 'month') setViewDate(addYears(viewDate, 1));
    else setViewDate(addYears(viewDate, 12));
  };

  const handleHeaderClick = () => {
    if (mode === 'day') setMode('month');
    else if (mode === 'month') setMode('year');
    else setMode('day');
  };

  const handleMonthSelect = (m: number) => {
    setViewDate(setMonth(viewDate, m));
    setMode('day');
  };

  const handleYearSelect = (y: number) => {
    setViewDate(setYear(viewDate, y));
    setMode('month');
  };

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-content" onClick={(e) => e.stopPropagation()}>
        <div className="picker-header">
          <button onClick={handlePrev} className="p-nav-btn">
            <ChevronLeft size={16} />
          </button>
          <button className="p-title-btn" onClick={handleHeaderClick}>
            <h2 className="p-title">
              {mode === 'day' && format(viewDate, 'MMMM yyyy')}
              {mode === 'month' && format(viewDate, 'yyyy')}
              {mode === 'year' && `${yearRange[0]} - ${yearRange[11]}`}
            </h2>
          </button>
          <button onClick={handleNext} className="p-nav-btn">
            <ChevronRight size={16} />
          </button>
        </div>

        {mode === 'day' && (
          <>
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
          </>
        )}

        {mode === 'month' && (
          <div className="p-grid-month">
            {Array.from({ length: 12 }, (_, i) => {
              const date = setMonth(viewDate, i);
              const isSelected = isSameMonth(date, initialDate);
              return (
                <button
                  key={i}
                  className={`p-month-btn ${isSelected ? 'p-selected' : ''}`}
                  onClick={() => handleMonthSelect(i)}
                >
                  {format(date, 'MMM')}
                </button>
              );
            })}
          </div>
        )}

        {mode === 'year' && (
          <div className="p-grid-month">
            {yearRange.map((y) => {
              const isSelected = getYear(initialDate) === y;
              const isCurrentYear = getYear(viewDate) === y;
              return (
                <button
                  key={y}
                  className={`p-month-btn ${isSelected ? 'p-selected' : ''} ${isCurrentYear && !isSelected ? 'p-focus' : ''}`}
                  onClick={() => handleYearSelect(y)}
                >
                  {y}
                </button>
              );
            })}
          </div>
        )}
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
          min-height: 400px;
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

        .p-title-btn {
            background: transparent;
            border: none;
            padding: 4px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .p-title-btn:hover {
            background: #F8FAFC;
        }

        .p-title {
          font-size: 19px;
          font-weight: 500;
          color: #1A1A1A;
          letter-spacing: -0.01em;
          margin: 0;
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

        .p-grid-month {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 8px 0;
        }

        .p-day-btn, .p-month-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          transition: all 0.1s;
          background: transparent;
          border: none;
          color: #1A1A1A;
          cursor: pointer;
        }

        .p-day-btn {
          height: 44px;
          font-size: 18px;
          font-weight: 500;
        }

        .p-month-btn {
            height: 60px;
            font-size: 17px;
            font-weight: 500;
        }

        .p-day-btn:hover:not(.p-selected), .p-month-btn:hover:not(.p-selected) {
          background: #F8FAFC;
        }

        .p-day-btn.p-other {
          color: #CBD5E1;
          visibility: visible;
          opacity: 0.5;
        }

        .p-day-btn.p-selected, .p-month-btn.p-selected {
          background: #1C1C1E !important;
          color: white !important;
          font-weight: 600;
        }

        .p-day-btn.p-today:not(.p-selected) {
          color: #1C1C1E;
          font-weight: 800;
        }

        .p-month-btn.p-focus {
            background: #F1F5F9;
            font-weight: 600;
        }
      `}</style>
    </div>
  );
}
