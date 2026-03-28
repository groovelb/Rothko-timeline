import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { defaultTheme as theme } from './styles/themes';
import { RothkoTimeline } from './components/timeline';
import worksData from './data/rothko/rothko_works.json';
import eventsData from './data/rothko/rothko_events.json';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RothkoTimeline worksData={ worksData } eventsData={ eventsData } />
    </ThemeProvider>
  );
}

export default App;
