import { useAuth } from '../App';
import { useTheme } from '../ThemeContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="p-8">
      <h1
        className="text-2xl font-semibold mb-1"
        style={{ color: theme.text }}
      >
        Dashboard
      </h1>
      <p className="text-sm" style={{ color: theme.textMuted }}>
        Welcome back, {user?.username}.
      </p>
    </div>
  );
}
