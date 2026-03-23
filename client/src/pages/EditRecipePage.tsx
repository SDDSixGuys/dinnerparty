import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { getRecipe, updateRecipe } from '../api/recipes';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Step {
  text: string;
  photo: File | null;
  photoPreview: string;
  timerMinutes: string;
  showTimer: boolean;
}

export default function EditRecipePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('4');
  const [difficulty, setDifficulty] = useState('medium');
  const [cuisine, setCuisine] = useState('');
  const [course, setCourse] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getRecipe(id)
      .then((data) => {
        const r = data.recipe;
        setTitle(r.title);
        setDescription(r.description || '');
        setPrepTime(r.prepTimeMinutes?.toString() || '');
        setCookTime(r.cookTimeMinutes?.toString() || '');
        setServings(r.servings?.toString() || '4');
        setDifficulty(r.difficulty || 'medium');
        setCuisine(r.cuisine || '');
        setCourse(r.course || '');
        setIngredients(
          r.ingredients.length > 0
            ? r.ingredients.map((i: any) => ({
                name: i.name,
                quantity: i.quantity?.toString() || '',
                unit: i.unit || '',
              }))
            : [{ name: '', quantity: '', unit: '' }]
        );
        setSteps(
          r.instructions.length > 0
            ? r.instructions.map((s: any) => ({
                text: s.text,
                photo: null,
                photoPreview: s.imageUrl || '',
                timerMinutes: s.timerMinutes?.toString() || '',
                showTimer: !!s.timerMinutes,
              }))
            : [{ text: '', photo: null, photoPreview: '', timerMinutes: '', showTimer: false }]
        );
        setLoading(false);
      })
      .catch(() => {
          console.error('FETCH ERROR:', err);
        setError('Failed to load recipe');
        setLoading(false);
      });
  }, [id]);

  // --- Ingredient helpers ---
  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
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
  const addStep = () => setSteps([...steps, { text: '', photo: null, photoPreview: '', timerMinutes: '', showTimer: false }]);
  const removeStep = (index: number) => {
    if (steps.length === 1) return;
    const removed = steps[index];
    if (removed.photoPreview && !removed.photoPreview.startsWith('http')) {
      URL.revokeObjectURL(removed.photoPreview);
    }
    setSteps(steps.filter((_, i) => i !== index));
  };
  const updateStepText = (index: number, text: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], text };
    setSteps(updated);
  };
  const toggleStepTimer = (index: number) => {
    const updated = [...steps];
    updated[index] = {
      ...updated[index],
      showTimer: !updated[index].showTimer,
      timerMinutes: updated[index].showTimer ? '' : updated[index].timerMinutes,
    };
    setSteps(updated);
  };
  const updateStepTimer = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], timerMinutes: value };
    setSteps(updated);
  };
  const updateStepPhoto = (index: number, file: File | null) => {
    const updated = [...steps];
    const prev = updated[index].photoPreview;
    if (prev && !prev.startsWith('http')) URL.revokeObjectURL(prev);
    updated[index] = {
      ...updated[index],
      photo: file,
      photoPreview: file ? URL.createObjectURL(file) : '',
    };
    setSteps(updated);
  };

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
            timerMinutes: s.showTimer && s.timerMinutes ? Number(s.timerMinutes) : undefined,
          })),
      };
      await updateRecipe(id!, payload);
      navigate(`/recipes/${id}`);
    } catch (err: any) {
      setError(err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` };
  const labelClass = 'block text-xs font-medium mb-1';

  if (loading) return <div className="p-8" style={{ color: theme.textMuted }}>Loading recipe...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm mb-6 cursor-pointer" style={{ color: theme.textMuted }}>
        &larr; Back
      </button>

      <h1 className="text-2xl font-bold mb-8" style={{ color: theme.text }}>Edit Recipe</h1>

      <form onSubmit={handleSubmit} className="space-y-12 pb-20">
        {/* --- Header Section --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 rounded text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded text-sm outline-none resize-none" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Cuisine</label>
              <input type="text" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Italian" className="w-full px-3 py-2 rounded text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Course</label>
              <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Dinner" className="w-full px-3 py-2 rounded text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-3 py-2 rounded text-sm outline-none" style={inputStyle}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Servings</label>
              <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} className="w-full px-3 py-2 rounded text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Prep (min)</label>
              <input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="w-full px-3 py-2 rounded text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: theme.textMuted }}>Cook (min)</label>
              <input type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="w-full px-3 py-2 rounded text-sm outline-none" style={inputStyle} />
            </div>
          </div>
        </section>

        {/* --- Ingredients --- */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: theme.border }}>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.text }}>Ingredients</h2>
          </div>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-3">
                <input type="text" value={ing.quantity} onChange={(e) => updateIngredient(i, 'quantity', e.target.value)} placeholder="Qty" className="w-20 px-3 py-2 rounded text-sm outline-none" style={inputStyle} />
                <input type="text" value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} placeholder="Unit" className="w-24 px-3 py-2 rounded text-sm outline-none" style={inputStyle} />
                <input type="text" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} placeholder="Ingredient name" className="flex-1 px-3 py-2 rounded text-sm outline-none" style={inputStyle} />
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIngredient(i)} className="px-2 text-xl hover:text-red-500" style={{ color: theme.textMuted }}>&times;</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addIngredient} className="mt-4 text-xs font-medium px-4 py-2 rounded border cursor-pointer hover:opacity-80 transition-opacity" style={{ color: theme.text, borderColor: theme.border, background: theme.card }}>
            + Add Ingredient
          </button>
        </section>

        {/* --- Steps --- */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: theme.border }}>
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.text }}>Steps</h2>
          </div>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="rounded-xl p-6" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold" style={{ color: theme.textMuted }}>STEP {i + 1}</span>
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(i)} className="text-xs text-red-500 hover:underline">Remove Step</button>
                  )}
                </div>

                <textarea value={step.text} onChange={(e) => updateStepText(i, e.target.value)} placeholder="Describe this step..." rows={3} className="w-full px-3 py-2 rounded text-sm outline-none resize-none mb-4" style={inputStyle} />

                <div className="flex flex-wrap items-center gap-4">
                  {!step.showTimer ? (
                    <button type="button" onClick={() => toggleStepTimer(i)} className="text-xs px-3 py-1.5 rounded border" style={{ color: theme.textMuted, borderColor: theme.border }}>+ Add Timer</button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium" style={{ color: theme.textMuted }}>Timer (min):</label>
                      <input type="number" value={step.timerMinutes} onChange={(e) => updateStepTimer(i, e.target.value)} className="w-20 px-2 py-1 rounded text-sm outline-none" style={inputStyle} />
                      <button type="button" onClick={() => toggleStepTimer(i)} className="text-xs text-red-500 ml-1">Remove</button>
                    </div>
                  )}

                  <label className="text-xs px-3 py-1.5 rounded border cursor-pointer inline-block" style={{ color: theme.textMuted, borderColor: theme.border }}>
                    {step.photo ? 'Change Photo' : step.photoPreview ? 'Change Photo' : '+ Add Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => updateStepPhoto(i, e.target.files?.[0] || null)} />
                  </label>
                </div>

                {step.photoPreview && (
                  <div className="mt-4 relative inline-block">
                    <img src={step.photoPreview} className="h-32 w-48 object-cover rounded-lg border" style={{ borderColor: theme.border }} alt="" />
                    <button type="button" onClick={() => updateStepPhoto(i, null)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg">&times;</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addStep} className="mt-6 text-xs font-medium px-4 py-2 rounded border cursor-pointer hover:opacity-80 transition-opacity" style={{ color: theme.text, borderColor: theme.border, background: theme.card }}>
            + Add Step
          </button>
        </section>

        {/* --- Footer Controls --- */}
        <div className="flex items-center gap-4 pt-6 border-t" style={{ borderColor: theme.border }}>
          <button type="submit" disabled={saving} className="px-10 py-3 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50" style={{ background: theme.buttonBg, color: theme.buttonText }}>
            {saving ? 'Saving...' : 'Update Recipe'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-10 py-3 rounded-lg text-sm font-medium border" style={{ color: theme.text, borderColor: theme.border }}>Cancel</button>
          {error && <p className="text-sm font-medium" style={{ color: '#ef4444' }}>{error}</p>}
        </div>
      </form>
    </div>
  );
}