import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { getRecipe, type RecipeDetail } from '../api/recipes';

export default function RecipeDetailPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError('');

    getRecipe(id)
      .then((data) => {
        if (cancelled) return;
        setRecipe(data.recipe);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message || 'Could not load recipe');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Loading…
        </p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/recipes')}
          className="text-sm mb-6 cursor-pointer transition-colors"
          style={{ color: theme.textMuted }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.textMuted;
          }}
        >
          &larr; Back to Recipes
        </button>
        <p className="text-sm" style={{ color: '#ef4444' }}>
          {error || 'Recipe not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => navigate('/recipes')}
        className="text-sm mb-6 cursor-pointer transition-colors"
        style={{ color: theme.textMuted }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = theme.text;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme.textMuted;
        }}
      >
        &larr; Back to Recipes
      </button>

      <h1 className="text-2xl font-semibold mb-2" style={{ color: theme.text }}>
        {recipe.title}
      </h1>
      {recipe.description && (
        <p className="text-sm mb-6" style={{ color: theme.textMuted }}>
          {recipe.description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section
          className="rounded-lg p-5"
          style={{ background: theme.card, border: `1px solid ${theme.border}` }}
        >
          <h2 className="text-sm font-medium mb-3" style={{ color: theme.text }}>
            Ingredients
          </h2>
          {recipe.ingredients?.length ? (
            <ul className="space-y-2">
              {recipe.ingredients.map((i, idx) => (
                <li key={idx} className="text-sm" style={{ color: theme.text }}>
                  <span style={{ color: theme.textMuted }}>
                    {typeof i.quantity === 'number' ? i.quantity : ''}
                    {i.unit ? ` ${i.unit}` : ''}
                    {i.quantity || i.unit ? ' ' : ''}
                  </span>
                  {i.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: theme.textMuted }}>
              —
            </p>
          )}
        </section>

        <section
          className="rounded-lg p-5"
          style={{ background: theme.card, border: `1px solid ${theme.border}` }}
        >
          <h2 className="text-sm font-medium mb-3" style={{ color: theme.text }}>
            Steps
          </h2>
          {recipe.instructions?.length ? (
            <ol className="space-y-3 list-decimal pl-5">
              {recipe.instructions
                .slice()
                .sort((a, b) => a.stepNumber - b.stepNumber)
                .map((s, idx) => (
                  <li key={idx} className="text-sm" style={{ color: theme.text }}>
                    {s.text}
                  </li>
                ))}
            </ol>
          ) : (
            <p className="text-sm" style={{ color: theme.textMuted }}>
              —
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

