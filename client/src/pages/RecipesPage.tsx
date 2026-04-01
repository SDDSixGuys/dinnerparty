import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { listRecipes, type RecipeListItem } from "../api/recipes";

export default function RecipesPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    listRecipes()
      .then((data) => {
        if (cancelled) return;
        setRecipes(data.recipes || []);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message || "Could not load recipes");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: theme.text }}>
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
                  navigate("/recipes/new");
                }}
                className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer"
                style={{ color: theme.text }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
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
            <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
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
                onClick={() => {
                  setShowImport(false);
                  setImportUrl("");
                }}
                className="px-4 py-1.5 rounded text-sm cursor-pointer transition-colors"
                style={{ color: theme.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.sidebarHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: send importUrl to backend parser
                  setShowImport(false);
                  setImportUrl("");
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

      {loading ? (
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Loading recipes…
        </p>
      ) : error ? (
        <p className="text-sm" style={{ color: "#ef4444" }}>
          {error}
        </p>
      ) : recipes.length === 0 ? (
        <p className="text-sm" style={{ color: theme.textMuted }}>
          No recipes yet. Click + to add your first one.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {recipes.map((r) => (
            <button
              key={r._id}
              onClick={() => navigate(`/recipes/${r._id}`)}
              className="text-left rounded-lg p-4 transition-colors cursor-pointer"
              style={{ background: theme.card, border: `1px solid ${theme.border}` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.border;
              }}
            >
              <div className="text-sm font-medium mb-1" style={{ color: theme.text }}>
                {r.title}
              </div>
              <div className="text-xs line-clamp-2" style={{ color: theme.textMuted }}>
                {r.description || "—"}
              </div>
              <div className="mt-3 text-[11px]" style={{ color: theme.textMuted }}>
                Updated {new Date(r.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
