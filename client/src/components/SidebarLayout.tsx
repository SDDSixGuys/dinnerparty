import { useState } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <div className="flex h-screen relative overflow-hidden" style={{ background: theme.bg }}>

      {/* Floating Menu Button (Visible only when sidebar is collapsed) */}
      <button
        onClick={() => setIsCollapsed(false)}
        className={`absolute top-4 left-4 z-20 p-2 rounded-md transition-all duration-300 cursor-pointer shadow-md ${
          isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
        style={{
          background: theme.sidebar,
          color: theme.sidebarText,
          border: `1px solid ${theme.sidebarBorder}`
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300 ease-in-out z-30 h-full overflow-hidden"
        style={{
          width: isCollapsed ? '0px' : '224px',
          background: theme.sidebar,
          borderRight: isCollapsed ? 'none' : `1px solid ${theme.sidebarBorder}`,
          transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
          opacity: isCollapsed ? 0 : 1,
          visibility: isCollapsed ? 'hidden' : 'visible',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between min-w-[224px]"
          style={{ borderBottom: `1px solid ${theme.sidebarBorder}` }}
        >
          <h1 className="text-base font-semibold tracking-tight" style={{ color: theme.sidebarText }}>
            dinnerparty
          </h1>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:opacity-70 cursor-pointer transition-opacity"
            style={{ color: theme.sidebarText }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        </div>

        {/* Navigation - The flex-1 here pushes the footer down */}
        <div className="flex-1 flex flex-col min-w-[224px] overflow-hidden">
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full text-left px-3 py-1.5 rounded text-sm transition-all duration-200 cursor-pointer"
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

          {/* Footer - Bottom Justified */}
          <div
            className="px-3 py-4 mt-auto"
            style={{ borderTop: `1px solid ${theme.sidebarBorder}` }}
          >
            <p className="text-xs px-3 mb-2" style={{ color: theme.textMuted }}>
              {user?.username}
            </p>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-1.5 rounded text-sm transition-all duration-200 cursor-pointer"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.sidebarHover;
                e.currentTarget.style.color = theme.sidebarText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.textMuted;
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
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