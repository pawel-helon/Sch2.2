import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';
import { SessionsLayout } from 'src/features/sessions/SessionsLayout';
import { AvailabilityLayout } from 'src/features/slots/AvailabilityLayout';
import { getCurrentWeek } from 'src/lib/helpers';
import { StoreProvider } from './lib/storeProvider';

const App = () => {
  const { year, weekNumber, dayName } = getCurrentWeek();
  const defaultsessionsPath = `/sessions/${year}w${weekNumber}/${dayName}`;
  const defaultAvailabilityPath = `/availability/${year}w${weekNumber}`;

  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={defaultsessionsPath} replace />} />
          <Route path="/sessions" element={<Navigate to={defaultsessionsPath} replace />} />
          <Route path="/sessions/:week/" element={<Redirect />} />
          <Route path="/sessions/:week/:day" element={<SessionsLayout />} />
          <Route path="/availability" element={<Navigate to={defaultAvailabilityPath} replace />} />
          <Route path="/availability/:week" element={<AvailabilityLayout />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
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
    return <Navigate to={`/sessions/${week}/${dayName}`} replace />;
  }
  return <Navigate to={`/sessions/${currentYear}w${currentWeekNumber}/${dayName}`} replace />;
}
