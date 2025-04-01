import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';
import { MeetingsLayout } from 'src/features/meetings/MeetingsLayout';
import { AvailabilityLayout } from 'src/features/slots/AvailabilityLayout';
import { getCurrentWeek } from 'src/lib/helpers';

const App = () => {
  const { year, weekNumber, dayName } = getCurrentWeek();
  const defaultMeetingsPath = `/meetings/${year}w${weekNumber}/${dayName}`;
  const defaultAvailabilityPath = `/availability/${year}w${weekNumber}`;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={defaultMeetingsPath} replace />} />
        <Route path="/meetings" element={<Navigate to={defaultMeetingsPath} replace />} />
        <Route path="/meetings/:week/" element={<Redirect />} />
        <Route path="/meetings/:week/:day" element={<MeetingsLayout />} />
        <Route path="/availability" element={<Navigate to={defaultAvailabilityPath} replace />} />
        <Route path="/availability/:week" element={<AvailabilityLayout />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

const Redirect = () => {
  const { week } = useParams();
  const { year: currentYear, weekNumber: currentWeekNumber, dayName } = getCurrentWeek();
  const [year, weekNum] = week!.split('w');
  const validYear = Number(year) > 2000 && Number(year) < 2050;
  const validWeek = Number(weekNum) > 0 && Number(weekNum) < 54;

  if (validYear && validWeek) {
    return <Navigate to={`/meetings/${week}/${dayName}`} replace />;
  }
  return <Navigate to={`/meetings/${currentYear}w${currentWeekNumber}/${dayName}`} replace />;
}
