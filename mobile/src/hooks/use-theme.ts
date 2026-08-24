import { Colors } from '@/constants/theme';

// The app deliberately has one warm scrapbook look, not a light/dark pair —
// the original web app has no dark mode either. Reacting to the system
// color scheme here previously caused text and card backgrounds to be
// themed independently (text light-on-dark-mode colors rendered against
// paper-card backgrounds that stayed light), making text unreadable
// whenever the phone was in dark mode.
export function useTheme() {
  return Colors.light;
}
