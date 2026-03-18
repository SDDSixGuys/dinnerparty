import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { createRecipe } from '../api/recipes';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Step {
  text: string;
  photo: File | null;
  photoPreview: string;
}

export default function CreateRecipePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('4');
  const [difficulty, setDifficulty] = useState('medium');
  const [cuisine, setCuisine] = useState('');
  const [course, setCourse] = useState('');

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '', unit: '' },
  ]);

  const [steps, setSteps] = useState<Step[]>([
    { text: '', photo: null, photoPreview: '' },
  ]);

  const [_finishedPhoto, setFinishedPhoto] = useState<File | null>(null);
  const [finishedPhotoPreview, setFinishedPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // --- Ingredient helpers ---

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  // --- Step helpers ---

  const addStep = () => {
    setSteps([...steps, { text: '', photo: null, photoPreview: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) return;
    const removed = steps[index];
    if (removed.photoPreview) URL.revokeObjectURL(removed.photoPreview);
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStepText = (index: number, text: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], text };
    setSteps(updated);
  };

  const updateStepPhoto = (index: number, file: File | null) => {
    const updated = [...steps];
    if (updated[index].photoPreview) URL.revokeObjectURL(updated[index].photoPreview);
    updated[index] = {
      ...updated[index],
      photo: file,
      photoPreview: file ? URL.createObjectURL(file) : '',
    };
    setSteps(updated);
  };

  const removeStepPhoto = (index: number) => {
    updateStepPhoto(index, null);
  };

  // --- Finished photo ---

  const handleFinishedPhoto = (file: File | null) => {
    if (finishedPhotoPreview) URL.revokeObjectURL(finishedPhotoPreview);
    setFinishedPhoto(file);
    setFinishedPhotoPreview(file ? URL.createObjectURL(file) : '');
  };

  // --- Submit ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        title,
        description: description || undefined,
        prepTimeMinutes: prepTime ? Number(prepTime) : 0,
        cookTimeMinutes: cookTime ? Number(cookTime) : 0,
        totalTimeMinutes: (prepTime ? Number(prepTime) : 0) + (cookTime ? Number(cookTime) : 0),
        servings: servings ? Number(servings) : 4,
        difficulty,
        cuisine: cuisine || undefined,
        course: course || undefined,
        ingredients: ingredients
          .filter((i) => i.name.trim())
          .map((i) => ({
            name: i.name.trim(),
            quantity: i.quantity ? Number(i.quantity) : undefined,
            unit: i.unit?.trim() || undefined,
          })),
        instructions: steps
          .filter((s) => s.text.trim())
          .map((s, idx) => ({
            stepNumber: idx + 1,
            text: s.text.trim(),
          })),
        // Photos are still UI-only for now (backend expects imageUrl strings, not file uploads)
      };

      const { recipe } = await createRecipe(payload);
      navigate(`/recipes/${recipe._id}`);
    } catch (err: any) {
      setError(err?.message || 'Could not save recipe');
    } finally {
      setSaving(false);
    }
  };

  // --- Shared styles ---

  const inputStyle = {
    background: theme.bg,
    color: theme.text,
    border: `1px solid ${theme.border}`,
  };

  const labelClass = "block text-xs font-medium mb-1";

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => navigate('/recipes')}
        className="text-sm mb-6 cursor-pointer transition-colors"
        style={{ color: theme.textMuted }}
        onMouseEnter={(e) => { e.currentTarget.style.color = theme.text; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; }}
      >
        &larr; Back to Recipes
      </button>

      <h1 className="text-2xl font-semibold mb-6" style={{ color: theme.text }}>
        New Recipe
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* --- Basic Info --- */}
        <section className="space-y-3">
          <div>
            <label className={labelClass} style={{ color: theme.textMuted }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Recipe name"
              className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
              style={inputStyle}
            />
          </div>

          <div>
            <label className={labelClass} style={{ color: theme.textMuted }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
              rows={2}
              className="w-full px-3 py-2 rounded text-sm outline-none resize-none transition-colors"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Prep time (min)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Cook time (min)</label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Servings</label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="1"
                placeholder="4"
                className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded text-sm outline-none cursor-pointer transition-colors"
                style={inputStyle}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Cuisine</label>
              <input
                type="text"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="Italian, Mexican..."
                className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Course</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Main, Dessert..."
                className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* --- Ingredients --- */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium" style={{ color: theme.text }}>Ingredients</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="text-xs px-2 py-1 rounded cursor-pointer transition-colors"
              style={{ color: theme.textMuted, border: `1px solid ${theme.border}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = theme.sidebarHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              + Add
            </button>
          </div>

          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(i, 'quantity', e.target.value)}
                  placeholder="Qty"
                  className="w-16 px-2 py-1.5 rounded text-sm outline-none transition-colors"
                  style={inputStyle}
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                  placeholder="Unit"
                  className="w-20 px-2 py-1.5 rounded text-sm outline-none transition-colors"
                  style={inputStyle}
                />
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                  placeholder="Ingredient"
                  className="flex-1 px-2 py-1.5 rounded text-sm outline-none transition-colors"
                  style={inputStyle}
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="px-2 py-1.5 text-xs rounded cursor-pointer transition-colors"
                    style={{ color: theme.textMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; }}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- Steps --- */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium" style={{ color: theme.text }}>Steps</h2>
            <button
              type="button"
              onClick={addStep}
              className="text-xs px-2 py-1 rounded cursor-pointer transition-colors"
              style={{ color: theme.textMuted, border: `1px solid ${theme.border}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = theme.sidebarHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              + Add
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="rounded-lg p-4"
                style={{ background: theme.card, border: `1px solid ${theme.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
                    Step {i + 1}
                  </span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="text-xs cursor-pointer transition-colors"
                      style={{ color: theme.textMuted }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <textarea
                  value={step.text}
                  onChange={(e) => updateStepText(i, e.target.value)}
                  placeholder="Describe this step..."
                  rows={2}
                  className="w-full px-3 py-2 rounded text-sm outline-none resize-none mb-3 transition-colors"
                  style={inputStyle}
                />

                {step.photoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={step.photoPreview}
                      alt={`Step ${i + 1}`}
                      className="h-24 w-auto rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeStepPhoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs cursor-pointer"
                      style={{ background: theme.buttonBg, color: theme.buttonText }}
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <label
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded cursor-pointer transition-colors"
                    style={{ color: theme.textMuted, border: `1px solid ${theme.border}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = theme.sidebarHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    Add photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => updateStepPhoto(i, e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- Finished Result Photo --- */}
        <section>
          <h2 className="text-sm font-medium mb-3" style={{ color: theme.text }}>
            Finished Result
          </h2>

          {finishedPhotoPreview ? (
            <div className="relative inline-block">
              <img
                src={finishedPhotoPreview}
                alt="Finished result"
                className="h-40 w-auto rounded object-cover"
              />
              <button
                type="button"
                onClick={() => handleFinishedPhoto(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs cursor-pointer"
                style={{ background: theme.buttonBg, color: theme.buttonText }}
              >
                &times;
              </button>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center h-40 w-full rounded-lg cursor-pointer transition-colors"
              style={{ border: `2px dashed ${theme.border}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = theme.sidebarHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="text-sm mb-1" style={{ color: theme.textMuted }}>
                Upload a photo of the finished dish
              </span>
              <span className="text-xs" style={{ color: theme.textMuted }}>
                Click to browse
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFinishedPhoto(e.target.files?.[0] || null)}
              />
            </label>
          )}
        </section>

        {/* --- Submit --- */}
        <div className="flex gap-3 pt-2 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded text-sm font-medium cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: theme.buttonBg, color: theme.buttonText }}
          >
            {saving ? 'Saving…' : 'Save Recipe'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="px-5 py-2 rounded text-sm cursor-pointer transition-colors"
            style={{ color: theme.textMuted, border: `1px solid ${theme.border}` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.sidebarHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Cancel
          </button>
        </div>

        {error && (
          <p className="text-sm" style={{ color: '#ef4444' }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
