import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { createRecipe } from "../api/recipes";
import { listFolders, type FolderItem } from "../api/folders";

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

const UNIT_OPTIONS = [
  "tsp",
  "tbsp",
  "cup",
  "fl oz",
  "pt",
  "qt",
  "ml",
  "L",
  "oz",
  "lb",
  "g",
  "kg",
  "pinch",
  "dash",
  "handful",
  "to taste",
  "as needed",
  "can",
  "package",
  "bag",
  "slice",
  "clove",
  "bunch",
  "head",
  "sprig",
  "stalk",
  "strip",
  "sheet",
  "piece",
];

export default function CreateRecipePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("4");
  const [difficulty, setDifficulty] = useState("medium");
  const [cuisine, setCuisine] = useState("");
  const [course, setCourse] = useState("");
  const [folderIds, setFolderIds] = useState<string[]>([]);
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);

  useEffect(() => {
    listFolders()
      .then((data) => setAllFolders(data.folders || []))
      .catch(() => setAllFolders([]));
  }, []);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "" },
  ]);

  const [steps, setSteps] = useState<Step[]>([
    { text: "", photo: null, photoPreview: "", timerMinutes: "", showTimer: false },
  ]);

  const [finishedPhoto, setFinishedPhoto] = useState<File | null>(null);
  const [finishedPhotoPreview, setFinishedPhotoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addIngredient = () =>
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);

  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () =>
    setSteps([
      ...steps,
      { text: "", photo: null, photoPreview: "", timerMinutes: "", showTimer: false },
    ]);

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

  const toggleStepTimer = (index: number) => {
    const updated = [...steps];
    updated[index] = {
      ...updated[index],
      showTimer: !updated[index].showTimer,
      timerMinutes: updated[index].showTimer ? "" : updated[index].timerMinutes,
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
    if (updated[index].photoPreview) URL.revokeObjectURL(updated[index].photoPreview);
    updated[index] = {
      ...updated[index],
      photo: file,
      photoPreview: file ? URL.createObjectURL(file) : "",
    };
    setSteps(updated);
  };

  const handleFinishedPhoto = (file: File | null) => {
    if (finishedPhotoPreview) URL.revokeObjectURL(finishedPhotoPreview);
    setFinishedPhoto(file);
    setFinishedPhotoPreview(file ? URL.createObjectURL(file) : "");
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      let imageUrl = "";
      if (finishedPhoto) imageUrl = await fileToBase64(finishedPhoto);

      const instructionsWithPhotos = await Promise.all(
        steps
          .filter((s) => s.text.trim())
          .map(async (s, idx) => ({
            stepNumber: idx + 1,
            text: s.text.trim(),
            timerMinutes: s.showTimer && s.timerMinutes ? Number(s.timerMinutes) : undefined,
            imageUrl: s.photo ? await fileToBase64(s.photo) : undefined,
          }))
      );

      const payload = {
        title,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        prepTimeMinutes: prepTime ? Number(prepTime) : 0,
        cookTimeMinutes: cookTime ? Number(cookTime) : 0,
        totalTimeMinutes: (prepTime ? Number(prepTime) : 0) + (cookTime ? Number(cookTime) : 0),
        servings: servings ? Number(servings) : 4,
        difficulty,
        cuisine: cuisine || undefined,
        course: course || undefined,
        folderIds: folderIds.length > 0 ? folderIds : undefined,
        ingredients: ingredients
          .filter((i) => i.name.trim())
          .map((i) => ({
            name: i.name.trim(),
            quantity: i.quantity ? Number(i.quantity) : undefined,
            unit: i.unit?.trim() || undefined,
          })),
        instructions: instructionsWithPhotos,
      };

      const { recipe } = await createRecipe(payload);
      navigate(`/recipes/${recipe._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save recipe");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: theme.bg,
    color: theme.text,
    border: `1px solid ${theme.border}`,
  };
  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors";
  const labelClass = "block text-xs font-medium mb-1.5";

  const sh = (n: number, label: string) => (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
        style={{ background: theme.buttonBg, color: theme.buttonText }}
      >
        {n}
      </div>
      <span
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: theme.textMuted }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: theme.border }} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/recipes")}
        className="text-sm mb-6 cursor-pointer transition-colors"
        style={{ color: theme.textMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.color = theme.text)}
        onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
      >
        &larr; Back to Recipes
      </button>

      <h1 className="text-2xl font-bold mb-8" style={{ color: theme.text }}>
        New Recipe
      </h1>

      <form onSubmit={handleSubmit} className="space-y-10 pb-8">
        {/* ── 1. About ──────────────────────────────────────────────────────── */}
        <section>
          {sh(1, "About the recipe")}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: title + description */}
            <div className="space-y-4">
              <div>
                <label className={labelClass} style={{ color: theme.textMuted }}>
                  Recipe title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Grandma's Lasagna"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: theme.textMuted }}>
                  Description <span className="font-normal opacity-50">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="A short description of the dish..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-colors"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Right: metadata grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ color: theme.textMuted }}>
                    Cuisine
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g. Italian"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ color: theme.textMuted }}>
                    Course
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. Dinner"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ color: theme.textMuted }}>
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ color: theme.textMuted }}>
                    Servings
                  </label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    min="1"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Folders */}
              {allFolders.length > 0 && (
                <div>
                  <label className={labelClass} style={{ color: theme.textMuted }}>
                    Folders
                  </label>
                  <div
                    className="flex flex-wrap gap-2 px-3 py-2 rounded-lg"
                    style={{ ...inputStyle, minHeight: "42px" }}
                  >
                    {allFolders.map((f) => {
                      const selected = folderIds.includes(f._id);
                      return (
                        <button
                          key={f._id}
                          type="button"
                          onClick={() =>
                            setFolderIds((prev) =>
                              selected ? prev.filter((fid) => fid !== f._id) : [...prev, f._id]
                            )
                          }
                          className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors"
                          style={{
                            background: selected ? theme.buttonBg : theme.card,
                            color: selected ? theme.buttonText : theme.text,
                            border: `1px solid ${selected ? theme.buttonBg : theme.border}`,
                          }}
                        >
                          {selected ? "✓ " : ""}
                          {f.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Timing */}
              <div>
                <label className={labelClass} style={{ color: theme.textMuted }}>
                  Timing <span className="font-normal opacity-50">(minutes)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      placeholder="Prep"
                      min="0"
                      className={inputClass}
                      style={{ ...inputStyle, paddingRight: "2.5rem" }}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none"
                      style={{ color: theme.textMuted }}
                    >
                      min
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      placeholder="Cook"
                      min="0"
                      className={inputClass}
                      style={{ ...inputStyle, paddingRight: "2.5rem" }}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none"
                      style={{ color: theme.textMuted }}
                    >
                      min
                    </span>
                  </div>
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: theme.textMuted }}>
                  Total time is calculated automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Ingredients ────────────────────────────────────────────────── */}
        <section>
          {sh(2, "Ingredients")}

          {/* Column headers — desktop only */}
          <div className="hidden md:flex gap-3 mb-2 px-0.5">
            <div
              className="w-20 shrink-0 text-[11px] font-medium"
              style={{ color: theme.textMuted }}
            >
              Qty
            </div>
            <div
              className="w-28 shrink-0 text-[11px] font-medium"
              style={{ color: theme.textMuted }}
            >
              Unit <span className="font-normal opacity-50">— optional</span>
            </div>
            <div className="flex-1 text-[11px] font-medium" style={{ color: theme.textMuted }}>
              Ingredient name
            </div>
          </div>

          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex flex-col gap-2 md:flex-row md:gap-3 md:items-center">
                {/* Qty + Unit row */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                    placeholder="2"
                    className="w-1/3 min-w-0 md:w-20 md:flex-none px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    list="unit-options"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                    placeholder="cup, tbsp…"
                    className="flex-1 min-w-0 md:w-28 md:flex-none px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                {/* Name + remove row */}
                <div className="flex gap-2 flex-1 min-w-0">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, "name", e.target.value)}
                    placeholder="e.g. all-purpose flour, onions, eggs"
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="shrink-0 w-9 h-[42px] flex items-center justify-center rounded-lg text-lg transition-colors cursor-pointer hover:text-red-400"
                      style={{ color: theme.textMuted }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Datalist: common unit suggestions */}
          <datalist id="unit-options">
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>

          <p className="text-[11px] mt-3" style={{ color: theme.textMuted }}>
            <strong>Tip:</strong> Leave Unit blank for whole items — e.g. <em>3 onions</em>,{" "}
            <em>2 eggs</em>, <em>4 cloves garlic</em>. Start typing in the Unit field to see
            suggestions.
          </p>

          <button
            type="button"
            onClick={addIngredient}
            className="mt-4 text-xs font-medium px-4 py-2 rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
            style={{ color: theme.text, borderColor: theme.border, background: theme.card }}
          >
            + Add Ingredient
          </button>
        </section>

        {/* ── 3. Steps ──────────────────────────────────────────────────────── */}
        <section>
          {sh(3, "Steps")}
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${theme.border}` }}
              >
                {/* Step header bar */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: theme.card, borderBottom: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ background: theme.buttonBg, color: theme.buttonText }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
                      Step {i + 1}
                    </span>
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="text-xs cursor-pointer transition-colors hover:text-red-400"
                      style={{ color: theme.textMuted }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Step body */}
                <div className="p-4" style={{ background: theme.bg }}>
                  <textarea
                    value={step.text}
                    onChange={(e) => updateStepText(i, e.target.value)}
                    placeholder={`Describe step ${i + 1}...`}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none mb-3"
                    style={inputStyle}
                  />

                  <div className="flex flex-wrap gap-2">
                    {!step.showTimer ? (
                      <button
                        type="button"
                        onClick={() => toggleStepTimer(i)}
                        className="text-xs px-3 py-1.5 rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                        style={{ color: theme.textMuted, borderColor: theme.border }}
                      >
                        + Add Timer
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-xs font-medium" style={{ color: theme.textMuted }}>
                          Timer:
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={step.timerMinutes}
                            onChange={(e) => updateStepTimer(i, e.target.value)}
                            placeholder="0"
                            min="1"
                            className="w-20 px-2 py-1.5 rounded-lg text-sm outline-none pr-8"
                            style={inputStyle}
                          />
                          <span
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none"
                            style={{ color: theme.textMuted }}
                          >
                            min
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleStepTimer(i)}
                          className="text-xs cursor-pointer hover:text-red-400 transition-colors"
                          style={{ color: theme.textMuted }}
                        >
                          Remove timer
                        </button>
                      </div>
                    )}

                    <label
                      className="text-xs px-3 py-1.5 rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                      style={{ color: theme.textMuted, borderColor: theme.border }}
                    >
                      {step.photo ? "Change Photo" : "+ Add Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => updateStepPhoto(i, e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {step.photoPreview && (
                    <div className="mt-3 relative inline-block">
                      <img
                        src={step.photoPreview}
                        className="h-32 w-48 object-cover rounded-lg border"
                        style={{ borderColor: theme.border }}
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() => updateStepPhoto(i, null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStep}
            className="mt-4 text-xs font-medium px-4 py-2 rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
            style={{ color: theme.text, borderColor: theme.border, background: theme.card }}
          >
            + Add Step
          </button>
        </section>

        {/* ── 4. Finished dish photo ────────────────────────────────────────── */}
        <section>
          {sh(4, "Finished Dish Photo")}
          {finishedPhotoPreview ? (
            <div className="relative">
              <img
                src={finishedPhotoPreview}
                className="w-full h-52 object-cover rounded-xl border"
                style={{ borderColor: theme.border }}
                alt=""
              />
              <button
                type="button"
                onClick={() => handleFinishedPhoto(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-lg transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer hover:opacity-70 transition-opacity"
              style={{ borderColor: theme.border }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-2"
                style={{ color: theme.textMuted }}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-sm font-medium" style={{ color: theme.textMuted }}>
                Upload a photo of the finished dish
              </span>
              <span className="text-[11px] mt-1 opacity-60" style={{ color: theme.textMuted }}>
                optional
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

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="pt-6 border-t" style={{ borderColor: theme.border }}>
          {error && (
            <p className="text-sm mb-4" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 md:flex-none md:px-10 py-2.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50 transition-opacity"
              style={{ background: theme.buttonBg, color: theme.buttonText }}
            >
              {saving ? "Saving..." : "Save Recipe"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/recipes")}
              className="flex-1 md:flex-none md:px-10 py-2.5 rounded-lg text-sm font-medium border cursor-pointer hover:opacity-75 transition-opacity"
              style={{ color: theme.text, borderColor: theme.border }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
