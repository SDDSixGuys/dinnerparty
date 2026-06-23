import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { useTheme } from "../ThemeContext";
import DashboardPage from "../pages/DashboardPage";
import RecipesPage from "../pages/RecipesPage";
import CreateRecipePage from "../pages/CreateRecipePage";
import RecipeDetailPage from "../pages/RecipeDetailPage";
import SettingsPage from "../pages/SettingsPage";
import ProfilePage from "../pages/ProfilePage";
import EditRecipePage from "../pages/EditRecipePage";

const API_BASE = import.meta.env.VITE_API_URL || "";

const IconHome = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconBook = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconSettings = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconUser = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <IconHome /> },
  { label: "Recipes", path: "/recipes", icon: <IconBook /> },
  { label: "Settings", path: "/settings", icon: <IconSettings /> },
];

export default function SidebarLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileUserSheetOpen, setIsMobileUserSheetOpen] = useState(false);
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    navigate("/");
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="flex h-screen relative overflow-hidden" style={{ background: theme.bg }}>
      {/* ── DESKTOP ONLY: Floating re-open button when sidebar is collapsed ── */}
      <button
        onClick={() => setIsCollapsed(false)}
        className={`hidden md:block absolute top-4 left-4 z-20 p-2 rounded-md transition-all duration-300 cursor-pointer shadow-md ${
          isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        }`}
        style={{
          background: theme.sidebar,
          color: theme.sidebarText,
          border: `1px solid ${theme.sidebarBorder}`,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* ── DESKTOP ONLY: Sidebar ── */}
      <aside
        className="hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out z-30 h-full overflow-hidden"
        style={{
          width: isCollapsed ? "0px" : "224px",
          background: theme.sidebar,
          borderRight: isCollapsed ? "none" : `1px solid ${theme.sidebarBorder}`,
          transform: isCollapsed ? "translateX(-100%)" : "translateX(0)",
          opacity: isCollapsed ? 0 : 1,
          visibility: isCollapsed ? "hidden" : "visible",
        }}
      >
        <div
          className="px-6 py-5 flex items-center justify-between min-w-[224px]"
          style={{ borderBottom: `1px solid ${theme.sidebarBorder}` }}
        >
          <h1
            className="text-base font-semibold tracking-tight"
            style={{ color: theme.sidebarText }}
          >
            dinnerparty
          </h1>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:opacity-70 cursor-pointer transition-opacity"
            style={{ color: theme.sidebarText }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col min-w-[224px] overflow-hidden">
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full text-left px-3 py-1.5 rounded text-sm transition-all duration-200 cursor-pointer"
                  style={{
                    background: active ? theme.sidebarActive : "transparent",
                    color: active ? theme.sidebarText : theme.textMuted,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = theme.sidebarHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div
            className="px-3 py-4 mt-auto"
            style={{ borderTop: `1px solid ${theme.sidebarBorder}` }}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="w-full text-left px-3 py-2 rounded transition-all duration-200 cursor-pointer"
                style={{ color: theme.sidebarText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{user?.username}</div>
                    <div className="text-[11px] truncate" style={{ color: theme.textMuted }}>
                      {user?.email}
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : "rotate-0"}`}
                    style={{ color: theme.textMuted }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-lg overflow-hidden"
                  style={{ background: theme.sidebar, border: `1px solid ${theme.sidebarBorder}` }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-3 py-2 text-sm transition-all duration-200 cursor-pointer"
                    style={{ color: theme.sidebarText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.sidebarHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Profile information
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-1.5 rounded text-sm transition-all duration-200 cursor-pointer"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.sidebarHover;
                e.currentTarget.style.color = theme.sidebarText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = theme.textMuted;
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE ONLY: Top bar ── */}
      <div
        className="md:hidden fixed top-0 inset-x-0 z-20 flex items-center px-5"
        style={{
          height: "48px",
          background: theme.sidebar,
          borderBottom: `1px solid ${theme.sidebarBorder}`,
        }}
      >
        <span className="text-sm font-semibold tracking-tight" style={{ color: theme.sidebarText }}>
          dinnerparty
        </span>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto pt-12 pb-20 md:pt-0 md:pb-0 transition-all duration-300 ease-in-out">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/new" element={<CreateRecipePage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      {/* ── MOBILE ONLY: Bottom navigation bar ── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-20 flex items-stretch"
        style={{
          height: "64px",
          background: theme.sidebar,
          borderTop: `1px solid ${theme.sidebarBorder}`,
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors"
              style={{ color: active ? theme.sidebarText : theme.textMuted }}
            >
              <div
                className="p-1.5 rounded-xl transition-colors"
                style={{ background: active ? theme.sidebarActive : "transparent" }}
              >
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* User / account button */}
        <button
          onClick={() => setIsMobileUserSheetOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors"
          style={{ color: theme.textMuted }}
        >
          <div className="p-1.5 rounded-xl">
            <IconUser />
          </div>
          <span className="text-[10px] font-medium truncate max-w-[56px]">{user?.username}</span>
        </button>
      </nav>

      {/* ── MOBILE ONLY: User sheet (slides up from bottom) ── */}
      {isMobileUserSheetOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setIsMobileUserSheetOpen(false)}
          />
          <div
            className="md:hidden fixed bottom-0 inset-x-0 z-40 rounded-t-2xl animate-slide-up"
            style={{
              background: theme.sidebar,
              borderTop: `2px solid ${theme.sidebarBorder}`,
            }}
          >
            {/* Account info */}
            <div
              className="px-6 pt-5 pb-4"
              style={{ borderBottom: `1px solid ${theme.sidebarBorder}` }}
            >
              <div className="text-sm font-semibold" style={{ color: theme.sidebarText }}>
                {user?.username}
              </div>
              <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                {user?.email}
              </div>
            </div>

            {/* Actions */}
            <div className="px-3 pt-2 pb-3">
              <button
                onClick={() => {
                  setIsMobileUserSheetOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer"
                style={{ color: theme.sidebarText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Profile information
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors cursor-pointer"
                style={{ color: theme.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Log out
              </button>
            </div>

            {/* Spacer so content clears the bottom nav */}
            <div style={{ height: "72px" }} />
          </div>
        </>
      )}
    </div>
  );
}
