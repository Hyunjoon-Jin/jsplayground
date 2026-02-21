import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    addMinutes,
    startOfDay,
    setHours,
    setMinutes
} from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (date: Date, formatStr: string) => {
    return format(date, formatStr, { locale: ko });
};

// 15분 단위 시간 슬롯 생성 (00:00 ~ 23:45)
export const getTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 96; i++) {
        const totalMinutes = i * 15;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        slots.push(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        );
    }
    return slots;
};

// 특정 날짜의 15분 단위 Date 객체 생성
export const getTimeSlotDate = (date: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return setMinutes(setHours(startOfDay(date), hours), minutes);
};

// 월간 뷰를 위한 날짜 그리드 (이전/다음 달 일부 포함 42일)
export const getMonthGrid = (currentDate: Date) => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));

    const days = eachDayOfInterval({ start, end });

    // 6주(42일)를 채우기 위해 부족한 날짜 추가 (디자인 일관성)
    if (days.length < 42) {
        const lastDay = days[days.length - 1];
        const remainingCount = 42 - days.length;
        for (let i = 1; i <= remainingCount; i++) {
            days.push(addMinutes(lastDay, 24 * 60 * i));
        }
    }

    return days;
};

// 주간 뷰를 위한 날짜 배열 (7일)
export const getWeekDays = (currentDate: Date) => {
    return eachDayOfInterval({
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate),
    });
};

// 시간 문자열 -> 픽셀 위치 (1시간 = 60px 기준)
export const timeToPixel = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

// Date 객체 -> HH:mm 문자열 (15분 반올림)
export const dateToTimeStr = (date: Date) => {
    const h = date.getHours();
    const m = Math.floor(date.getMinutes() / 15) * 15;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};
