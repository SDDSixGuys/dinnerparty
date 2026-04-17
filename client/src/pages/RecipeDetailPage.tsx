import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { deleteRecipe, getRecipe, updateRecipe, type RecipeDetail } from "../api/recipes";
import { downloadRecipeAsPDF } from "../utils/pdfGenerator";
import { listFolders, type FolderItem } from "../api/folders";

/* --- Helper Component for Step Timers --- */
function StepTimer({ minutes, theme }: { minutes: number; theme: any }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isAlarming, setIsAlarming] = useState(false);

  // Use useRef for Audio to prevent "value cannot be modified" lint error
  const audioRef = useRef(new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"));
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beepCountRef = useRef(0);

  const stopAlarm = useCallback(() => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
        alarmTimeoutRef.current = null;
      }
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAlarming(false);
  }, []);

  useEffect(() => {
      let timerInterval: ReturnType<typeof setInterval> | null = null;

      if (isActive && secondsLeft > 0) {
        timerInterval = setInterval(() => {
          setSecondsLeft((s) => s - 1);
        }, 1000);
      } else if (secondsLeft === 0 && isActive) {
        setIsActive(false);
        setIsAlarming(true);
        beepCountRef.current = 0;

        const playBeep = () => {
          const positionInCycle = beepCountRef.current % 4;
          if (positionInCycle < 3) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
          beepCountRef.current += 1;
        };

        playBeep();
        audioIntervalRef.current = setInterval(playBeep, 200);
        alarmTimeoutRef.current = setTimeout(() => {
          stopAlarm();
        }, 60000);
      }

      return () => {
        if (timerInterval) clearInterval(timerInterval);
      };
  }, [isActive, secondsLeft, stopAlarm]);

  const handleReset = () => {
    stopAlarm();
    setSecondsLeft(minutes * 60);
    setIsActive(false);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* --- Classy Minimalist Overlay --- */}
      {isAlarming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
          <div
            className="w-full max-w-sm p-10 rounded-xl shadow-2xl text-center"
            style={{ background: theme.card, border: `1px solid ${theme.border}` }}
          >
            <h2 className="text-xl font-medium mb-2" style={{ color: theme.text }}>
              Timer Complete
            </h2>
            <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
              The current step duration has finished.
            </p>
            <button
              onClick={() => stopAlarm()}
              className="w-full py-3 rounded-lg font-semibold tracking-wide transition-all active:scale-95"
              style={{ background: theme.buttonBg, color: theme.buttonText }}
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* --- Timer UI --- */}
      <div className="mt-4 flex items-center gap-4">
        <div
          className="px-4 py-2 rounded-md font-mono text-sm border transition-colors"
          style={{
            background: secondsLeft === 0 ? theme.card : theme.bg,
            color: secondsLeft === 0 ? "#ef4444" : theme.text,
            borderColor: secondsLeft === 0 ? "#ef4444" : theme.border,
          }}
        >
          {formatTime(secondsLeft)}
        </div>

        <button
          onClick={() => {
            if (isAlarming) stopAlarm();
            else if (secondsLeft === 0) handleReset();
            else setIsActive(!isActive);
          }}
          className="text-xs px-5 py-2 rounded-md font-medium transition-all cursor-pointer border"
          style={{
            background: isActive ? "transparent" : theme.buttonBg,
            color: isActive ? theme.text : theme.buttonText,
            borderColor: isActive ? theme.border : "transparent",
          }}
        >
          {isActive ? "Stop" : secondsLeft === 0 ? "Reset" : "Start Timer"}
        </button>

        {secondsLeft < minutes * 60 && !isAlarming && (
          <button
            onClick={handleReset}
            className="text-xs font-medium opacity-60 hover:opacity-100 cursor-pointer"
            style={{ color: theme.text }}
          >
            Reset
          </button>
        )}
      </div>
    </>
  );
}

export default function RecipeDetailPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<RecipeDetail | any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [movingToFolder, setMovingToFolder] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteRecipe(id); // Using the DELETE route
      navigate("/recipes"); // Redirect to list after deletion
    } catch (err) {
      alert("Failed to delete recipe");
    }
  };

  useEffect(() => {
    listFolders()
      .then((data) => setAllFolders(data.folders || []))
      .catch(() => setAllFolders([]));
  }, []);

  const handleToggleFolder = async (folderId: string) => {
    if (!id) return;
    setMovingToFolder(true);
    try {
      const currentIds: string[] = recipe?.folderIds || [];
      const isInFolder = currentIds.includes(folderId);
      const newIds = isInFolder
        ? currentIds.filter((fid: string) => fid !== folderId)
        : [...currentIds, folderId];
      await updateRecipe(id, { folderIds: newIds });
      setRecipe((prev: any) => prev ? { ...prev, folderIds: newIds } : prev);
    } catch {
      // silently fail
    } finally {
      setMovingToFolder(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError("");

    getRecipe(id)
      .then((data) => {
        if (cancelled) return;
        setRecipe(data.recipe);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message || "Could not load recipe");
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
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Loading…
        </p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/recipes")}
          className="text-sm mb-6 cursor-pointer"
          style={{ color: theme.textMuted }}
        >
          &larr; Back to Recipes
        </button>
        <p className="text-sm" style={{ color: "#ef4444" }}>
          {error || "Recipe not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/recipes")}
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

      {/* --- Header Section --- */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.text }}>
          {recipe.title}
        </h1>

        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm"
          style={{ color: theme.textMuted }}
        >
          {recipe.totalTimeMinutes > 0 && (
            <span>
              <strong>Total Time:</strong> {recipe.totalTimeMinutes} mins
            </span>
          )}
          {recipe.servings && (
            <>
              <span className="hidden sm:inline opacity-30">|</span>
              <span>
                <strong>Yield:</strong> {recipe.servings} servings
              </span>
            </>
          )}
          {recipe.difficulty && (
            <>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="capitalize">
                <strong>Difficulty:</strong> {recipe.difficulty}
              </span>
            </>
          )}
          {recipe.cuisine && (
            <>
              <span className="hidden sm:inline opacity-30">|</span>
              <span>
                <strong>Cuisine:</strong> {recipe.cuisine}
              </span>
            </>
          )}
        </div>

        {recipe.description && (
          <p className="text-base md:text-lg mb-8 leading-relaxed" style={{ color: theme.text }}>
            {recipe.description}
          </p>
        )}

        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl shadow-sm"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* --- Ingredients List --- */}
        <section className="md:col-span-1">
          <h2
            className="text-xl font-bold mb-6 pb-2 border-b"
            style={{ color: theme.text, borderColor: theme.border }}
          >
            Ingredients
          </h2>
          {recipe.ingredients?.length ? (
            <div className="flex flex-col space-y-4">
              {recipe.ingredients.map((i: any, idx: number) => (
                <div key={idx} className="text-base leading-snug" style={{ color: theme.text }}>
                  <span className="font-semibold">
                    {typeof i.quantity === "number" && i.quantity > 0 ? i.quantity : ""}
                    {i.unit ? ` ${i.unit}` : ""}
                  </span>
                  {i.quantity || i.unit ? " " : ""}
                  <span>{i.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: theme.textMuted }}>
              No ingredients listed.
            </p>
          )}
        </section>

        {/* --- Instructions --- */}
        <section className="md:col-span-2">
          <h2
            className="text-xl font-bold mb-6 pb-2 border-b"
            style={{ color: theme.text, borderColor: theme.border }}
          >
            Instructions
          </h2>
          <div className="space-y-8">
            {recipe.instructions?.length ? (
              recipe.instructions
                .slice()
                .sort((a: any, b: any) => a.stepNumber - b.stepNumber)
                .map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl p-6 flex flex-col gap-6 shadow-sm"
                    style={{ background: theme.card, border: `1px solid ${theme.border}` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold" style={{ color: theme.text }}>
                          Step {s.stepNumber}
                        </h3>
                      </div>
                      <p className="text-base leading-relaxed" style={{ color: theme.text }}>
                        {s.text}
                      </p>

                      {s.timerMinutes > 0 && <StepTimer minutes={s.timerMinutes} theme={theme} />}
                    </div>

                    {s.imageUrl && (
                      <div className="w-full">
                        <img
                          src={s.imageUrl}
                          alt={`Step ${s.stepNumber}`}
                          className="w-full h-auto max-h-80 object-cover rounded-lg border"
                          style={{ borderColor: theme.border }}
                        />
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <p className="text-sm" style={{ color: theme.textMuted }}>
                No instructions listed.
              </p>
            )}
          </div>
        </section>
      </div>
      {/* Actions Footer */}
      <div
        className="mt-16 pt-8 border-t flex justify-center gap-4"
        style={{ borderColor: theme.border }}
      >
        <button
          onClick={() => downloadRecipeAsPDF(recipe)}
          className="px-6 py-2 rounded border text-sm font-medium transition-colors"
          style={{
            background: theme.buttonBg,
            color: theme.buttonText,
            borderColor: theme.border
          }}
        >
          Download PDF
        </button>
        <div className="relative">
          <button
            onClick={() => setShowFolderMenu(!showFolderMenu)}
            disabled={movingToFolder}
            className="px-6 py-2 rounded border text-sm font-medium transition-colors cursor-pointer"
            style={{ color: theme.text, borderColor: showFolderMenu ? theme.accent : theme.border }}
          >
            {(recipe.folderIds?.length || 0) > 0
              ? `Folders (${recipe.folderIds.length})`
              : "Add to Folder"}
          </button>
          {showFolderMenu && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded shadow-lg py-1 z-10"
              style={{ background: theme.card, border: `1px solid ${theme.border}` }}
            >
              {allFolders.map((f) => {
                const isIn = (recipe.folderIds || []).includes(f._id);
                return (
                  <button
                    key={f._id}
                    onClick={() => handleToggleFolder(f._id)}
                    className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer flex items-center gap-2"
                    style={{
                      color: isIn ? theme.accent : theme.text,
                      fontWeight: isIn ? 600 : 400,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = theme.sidebarHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="w-4 text-center shrink-0">{isIn ? "\u2713" : ""}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={f.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    {f.name}
                  </button>
                );
              })}
              {allFolders.length === 0 && (
                <p className="px-4 py-2 text-xs" style={{ color: theme.textMuted }}>
                  No folders yet
                </p>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => navigate(`/recipes/${id}/edit`)}
          className="px-6 py-2 rounded border text-sm font-medium"
          style={{ color: theme.text, borderColor: theme.border }}
        >
          Edit Recipe
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-2 rounded text-sm font-medium text-red-500 border border-red-500/20"
        >
          Delete Recipe
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
          <div
            className="w-full max-w-sm p-8 rounded-xl text-center"
            style={{ background: theme.card, border: `1px solid ${theme.border}` }}
          >
            <h2 className="text-xl font-medium mb-2" style={{ color: theme.text }}>
              Delete Recipe?
            </h2>
            <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
              This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                className="w-full py-3 rounded-lg font-bold text-white bg-red-500"
              >
                Delete Forever
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3 rounded-lg font-medium"
                style={{ color: theme.text }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
