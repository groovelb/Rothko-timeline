import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { defaultTheme as theme } from './styles/themes';
import { LocaleProvider } from './i18n';
import { LanguageToggle } from './components/navigation/LanguageToggle';
import { RothkoTimeline } from './components/timeline';
import worksData from './data/rothko/rothko_works.json';
import eventsData from './data/rothko/rothko_events.json';

function App() {
  return (
    <LocaleProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageToggle />
        <RothkoTimeline worksData={ worksData } eventsData={ eventsData } />
      </ThemeProvider>
    </LocaleProvider>
  );
}

export default App;
