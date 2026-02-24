import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { useTheme } from '../ThemeContext';
import DashboardPage from '../pages/DashboardPage';
import RecipesPage from '../pages/RecipesPage';
import CreateRecipePage from '../pages/CreateRecipePage';
import SettingsPage from '../pages/SettingsPage';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Recipes', path: '/recipes' },
  { label: 'Settings', path: '/settings' },
];

export default function SidebarLayout() {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/');
  };

  return (
    <div className="flex h-screen" style={{ background: theme.bg }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0"
        style={{
            width: '224px',
          background: theme.sidebar,
          borderRight: `1px solid ${theme.sidebarBorder}`,
        }}
      >
        <div
          className="px-6 py-5"
          style={{ borderBottom: `1px solid ${theme.sidebarBorder}` }}
        >
          <h1
            className="text-base font-semibold tracking-tight"
            style={{ color: theme.sidebarText }}
          >
            dinnerparty
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
              || location.pathname.startsWith(item.path + '/');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full text-left px-3 py-1.5 rounded text-sm transition-colors cursor-pointer"
                style={{
                  background: isActive ? theme.sidebarActive : 'transparent',
                  color: isActive ? theme.sidebarText : theme.textMuted,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = theme.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div
          className="px-3 py-4"
          style={{ borderTop: `1px solid ${theme.sidebarBorder}` }}
        >
          <p
            className="text-xs px-3 mb-2"
            style={{ color: theme.textMuted }}
          >
            {user?.username}
          </p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-1.5 rounded text-sm transition-colors cursor-pointer"
            style={{ color: theme.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.sidebarHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/new" element={<CreateRecipePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
