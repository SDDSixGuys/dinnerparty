import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

export default function RecipesPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: theme.text }}
        >
          Recipes
        </h1>

        {/* Add Button */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-8 h-8 flex items-center justify-center rounded text-lg font-light transition-colors cursor-pointer"
            style={{
              background: theme.buttonBg,
              color: theme.buttonText,
            }}
          >
            +
          </button>

          {/* Dropdown */}
          {showAddMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded shadow-sm py-1 z-10"
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
              }}
            >
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  navigate('/recipes/new');
                }}
                className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer"
                style={{ color: theme.text }}
                onMouseEnter={(e) => { e.currentTarget.style.background = theme.sidebarHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Create recipe
              </button>
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  setShowImport(true);
                }}
                className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer"
                style={{ color: theme.text }}
                onMouseEnter={(e) => { e.currentTarget.style.background = theme.sidebarHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Import from URL
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
          <div
            className="w-full max-w-md rounded-lg p-6"
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: theme.text }}
            >
              Import from URL
            </h2>
            <p className="text-sm mb-4" style={{ color: theme.textMuted }}>
              Paste a link to a recipe and we'll import it for you.
            </p>
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://example.com/recipe"
              className="w-full px-3 py-2 rounded text-sm outline-none mb-4"
              style={{
                background: theme.bg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowImport(false); setImportUrl(''); }}
                className="px-4 py-1.5 rounded text-sm cursor-pointer transition-colors"
                style={{ color: theme.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.background = theme.sidebarHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: send importUrl to backend parser
                  setShowImport(false);
                  setImportUrl('');
                }}
                className="px-4 py-1.5 rounded text-sm cursor-pointer transition-colors"
                style={{
                  background: theme.buttonBg,
                  color: theme.buttonText,
                }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      <p className="text-sm" style={{ color: theme.textMuted }}>
        No recipes yet. Click + to add your first one.
      </p>
    </div>
  );
}
