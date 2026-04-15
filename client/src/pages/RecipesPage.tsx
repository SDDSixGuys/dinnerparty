import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { importRecipe, listRecipes, type RecipeListItem } from '../api/recipes';

export default function RecipesPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importingUrl, setImportingUrl] = useState(false);
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    listRecipes(debouncedQuery ? { q: debouncedQuery } : undefined)
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
  }, [debouncedQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setImportingUrl(true);

    try {
      // const payload = {
      //   title,
      //   description: description || undefined,
      //   prepTimeMinutes: prepTime ? Number(prepTime) : 0,
      //   cookTimeMinutes: cookTime ? Number(cookTime) : 0,
      //   totalTimeMinutes: (prepTime ? Number(prepTime) : 0) + (cookTime ? Number(cookTime) : 0),
      //   servings: servings ? Number(servings) : 4,
      //   difficulty,
      //   cuisine: cuisine || undefined,
      //   course: course || undefined,
      //   ingredients: ingredients
      //     .filter((i) => i.name.trim())
      //     .map((i) => ({
      //       name: i.name.trim(),
      //       quantity: i.quantity ? Number(i.quantity) : undefined,
      //       unit: i.unit?.trim() || undefined,
      //     })),
      //   instructions: steps
      //     .filter((s) => s.text.trim())
      //     .map((s, idx) => ({
      //       stepNumber: idx + 1,
      //       text: s.text.trim(),
      //       timerMinutes: s.showTimer && s.timerMinutes ? Number(s.timerMinutes) : undefined,
      //     })),
      // };

      const { recipe } = await importRecipe({ url: importUrl });
      setShowImport(false);
      setImportUrl('');
      navigate(`/recipes/${recipe._id}`);
    } catch (err: any) {
      setError(err?.message || 'Could not import recipe');
    } finally {
      setImportingUrl(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-semibold" style={{ color: theme.text }}>
          Recipes
        </h1>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded text-sm outline-none w-64 transition-colors"
              style={{
                background: theme.card,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent)}
              onBlur={(e) => (e.currentTarget.style.borderColor = theme.border)}
            />
          </div>

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
            <form onSubmit={handleSubmit} className="flex justify-end gap-2">
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
                // onClick={() => {
                //   // TODO: send importUrl to backend parser
                //   setShowImport(false);
                //   setImportUrl('');
                // }}
                type='submit'
                disabled={importingUrl}
                className="px-4 py-1.5 rounded text-sm cursor-pointer transition-colors"
                style={{
                  background: theme.buttonBg,
                  color: theme.buttonText,
                }}
              >
                {importingUrl ? 'Importing...' : 'Import'}
              </button>
            </form>
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
          {debouncedQuery 
            ? "No recipes found matching your search." 
            : "No recipes yet. Click + to add your first one."}
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
