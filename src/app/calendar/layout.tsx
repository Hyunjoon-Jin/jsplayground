import CalendarNav from '@/components/calendar/CalendarNav';
import BottomNav from '@/components/calendar/BottomNav';

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <CalendarNav>
      {children}
      <BottomNav />
    </CalendarNav>
  );
}
