import CalendarNav from '@/components/calendar/CalendarNav';

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <CalendarNav>{children}</CalendarNav>;
}
