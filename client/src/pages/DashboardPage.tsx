import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { useTheme } from "../ThemeContext";
import { listRecipes, type RecipeListItem } from "../api/recipes";

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [recent, setRecent] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listRecipes()
      .then((data) => {
        if (cancelled) return;
        setRecent((data.recipes || []).slice(0, 6));
      })
      .catch(() => {
        if (cancelled) return;
        setRecent([]);
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
      <h1 className="text-2xl font-semibold mb-1" style={{ color: theme.text }}>
        Dashboard
      </h1>
      <p className="text-sm" style={{ color: theme.textMuted }}>
        Welcome back, {user?.username}.
      </p>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium" style={{ color: theme.text }}>
            Recent recipes
          </h2>
          <button
            onClick={() => navigate("/recipes")}
            className="text-xs cursor-pointer transition-colors"
            style={{ color: theme.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.textMuted;
            }}
          >
            View all
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Loading…
          </p>
        ) : recent.length === 0 ? (
          <p className="text-sm" style={{ color: theme.textMuted }}>
            No recipes yet.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {recent.map((r) => (
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
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
