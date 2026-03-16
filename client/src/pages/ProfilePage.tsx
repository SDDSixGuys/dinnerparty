import { useAuth } from '../App';
import { useTheme } from '../ThemeContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: theme.text }}>
        Profile information
      </h1>
      <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
        Your account details.
      </p>

      <div
        className="rounded-lg p-5"
        style={{ background: theme.card, border: `1px solid ${theme.border}` }}
      >
        <div className="grid gap-4">
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              Username
            </div>
            <div className="text-sm" style={{ color: theme.text }}>
              {user?.username || '—'}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
              Email
            </div>
            <div className="text-sm" style={{ color: theme.text }}>
              {user?.email || '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

