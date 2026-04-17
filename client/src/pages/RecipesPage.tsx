import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { importRecipe, listRecipes, type RecipeListItem } from '../api/recipes';
import {
  listFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolder,
  type FolderItem,
} from '../api/folders';

const CUISINE_OPTIONS = ["American", "Mexican", "Italian", "Asian", "Indian", "Mediterranean", "French", "Other"];
const COURSE_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer", "Side Dish", "Other"];
const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

export default function RecipesPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFolderId = searchParams.get("folderId") || undefined;

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importingUrl, setImportingUrl] = useState(false);
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
  const [cuisineFilter, setCuisineFilter] = useState<string[]>([]);
  const [courseFilter, setCourseFilter] = useState<string[]>([]);
  const [maxTimeFilter, setMaxTimeFilter] = useState<number | ''>('');

  // Folder state
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [folderContextMenu, setFolderContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch recipes (now includes folderId filter)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    listRecipes({
      ...(debouncedQuery ? { q: debouncedQuery } : {}),
      ...(activeFolderId ? { folderId: activeFolderId } : {}),
      ...(difficultyFilter.length ? { difficulty: difficultyFilter } : {}),
      ...(cuisineFilter.length ? { cuisine: cuisineFilter } : {}),
      ...(courseFilter.length ? { course: courseFilter } : {}),
      ...(maxTimeFilter !== '' ? { maxTotalTime: maxTimeFilter } : {})
    })
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
  }, [debouncedQuery, activeFolderId, difficultyFilter, cuisineFilter, courseFilter, maxTimeFilter]);

  // Fetch folders for the current level
  const fetchFolders = () => {
    setFoldersLoading(true);
    listFolders(activeFolderId ? { parentId: activeFolderId } : undefined)
      .then((data) => setFolders(data.folders || []))
      .catch(() => setFolders([]))
      .finally(() => setFoldersLoading(false));
  };

  useEffect(() => {
    fetchFolders();
  }, [activeFolderId]);

  // Fetch current folder info for breadcrumb
  useEffect(() => {
    if (activeFolderId) {
      getFolder(activeFolderId)
        .then((data) => setCurrentFolder(data.folder))
        .catch(() => setCurrentFolder(null));
    } else {
      setCurrentFolder(null);
    }
  }, [activeFolderId]);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handler = () => setFolderContextMenu(null);
    if (folderContextMenu) window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [folderContextMenu]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      await createFolder({ name: newFolderName.trim(), parentId: activeFolderId });
      setNewFolderName("");
      setShowNewFolder(false);
      fetchFolders();
    } catch {
      // silently fail
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleRenameFolder = async (id: string) => {
    if (!editFolderName.trim()) {
      setEditingFolderId(null);
      return;
    }
    try {
      await updateFolder(id, { name: editFolderName.trim() });
      setEditingFolderId(null);
      fetchFolders();
    } catch {
      setEditingFolderId(null);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id);
      fetchFolders();
    } catch {
      // silently fail
    }
  };

  const navigateToFolder = (folderId: string) => {
    setSearchParams({ folderId });
  };

  const navigateUp = () => {
    if (currentFolder?.parentId) {
      setSearchParams({ folderId: currentFolder.parentId });
    } else {
      setSearchParams({});
    }
  };

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
      <div className="flex flex-col mb-6 gap-4">
        <div className="flex items-center justify-between">
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded text-sm outline-none w-full transition-colors"
              style={{
                background: theme.card,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent)}
              onBlur={(e) => (e.currentTarget.style.borderColor = theme.border)}
            />
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 rounded text-sm transition-colors cursor-pointer w-full sm:w-auto"
              style={{
                background: theme.card,
                color: theme.text,
                border: `1px solid ${showFilters ? theme.accent : theme.border}`,
              }}
            >
              Filters
            </button>

            {showFilters && (
              <div
                className="absolute right-0 mt-2 w-72 rounded shadow-lg p-4 z-10 max-h-[70vh] overflow-y-auto"
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: theme.textMuted }}>Difficulty</h3>
                  <div className="flex flex-col gap-1">
                    {DIFFICULTY_OPTIONS.map((diff) => (
                      <label key={diff} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={difficultyFilter.includes(diff)}
                          onChange={(e) => {
                            if (e.target.checked) setDifficultyFilter([...difficultyFilter, diff]);
                            else setDifficultyFilter(difficultyFilter.filter((d) => d !== diff));
                          }}
                        />
                        <span className="capitalize">{diff}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: theme.textMuted }}>Meal Type</h3>
                  <div className="flex flex-col gap-1">
                    {COURSE_OPTIONS.map((course) => (
                      <label key={course} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={courseFilter.includes(course)}
                          onChange={(e) => {
                            if (e.target.checked) setCourseFilter([...courseFilter, course]);
                            else setCourseFilter(courseFilter.filter((c) => c !== course));
                          }}
                        />
                        <span>{course}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: theme.textMuted }}>Cuisine</h3>
                  <div className="flex flex-col gap-1">
                    {CUISINE_OPTIONS.map((cuisine) => (
                      <label key={cuisine} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cuisineFilter.includes(cuisine)}
                          onChange={(e) => {
                            if (e.target.checked) setCuisineFilter([...cuisineFilter, cuisine]);
                            else setCuisineFilter(cuisineFilter.filter((c) => c !== cuisine));
                          }}
                        />
                        <span>{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: theme.textMuted }}>Max Total Time (min)</h3>
                  <input
                    type="number"
                    value={maxTimeFilter}
                    onChange={(e) => setMaxTimeFilter(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 30"
                    className="w-full px-2 py-1 rounded text-sm outline-none"
                    style={{
                      background: theme.bg,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                    }}
                  />
                </div>

                {(difficultyFilter.length > 0 || cuisineFilter.length > 0 || courseFilter.length > 0 || maxTimeFilter !== '') && (
                  <button
                    onClick={() => {
                      setDifficultyFilter([]);
                      setCuisineFilter([]);
                      setCourseFilter([]);
                      setMaxTimeFilter('');
                    }}
                    className="mt-4 text-xs underline cursor-pointer w-full text-center"
                    style={{ color: theme.textMuted }}
                  >
                    Clear All Filters
                  </button>
                )}
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

      {/* Breadcrumb when inside a folder */}
      {activeFolderId && currentFolder && (
        <div className="flex items-center gap-1 mb-4 text-sm">
          <button
            onClick={() => setSearchParams({})}
            className="cursor-pointer hover:underline"
            style={{ color: theme.accent }}
          >
            All Recipes
          </button>
          <span style={{ color: theme.textMuted }}>/</span>
          {currentFolder.parentId && (
            <>
              <button
                onClick={navigateUp}
                className="cursor-pointer hover:underline"
                style={{ color: theme.accent }}
              >
                ...
              </button>
              <span style={{ color: theme.textMuted }}>/</span>
            </>
          )}
          <span style={{ color: theme.text }}>{currentFolder.name}</span>
        </div>
      )}

      {/* Folders Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Folders
          </h2>
          <button
            onClick={() => setShowNewFolder(true)}
            className="text-xs cursor-pointer transition-colors hover:opacity-70"
            style={{ color: theme.textMuted }}
            title="New folder"
          >
            + New
          </button>
        </div>

        {/* New folder inline input */}
        {showNewFolder && (
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.textMuted }} className="shrink-0">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }
              }}
              onBlur={() => {
                if (!newFolderName.trim()) {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }
              }}
              placeholder="Folder name"
              disabled={creatingFolder}
              className="px-2 py-1 rounded text-sm outline-none flex-1"
              style={{
                background: theme.card,
                color: theme.text,
                border: `1px solid ${theme.accent}`,
              }}
            />
            <button
              onClick={handleCreateFolder}
              disabled={creatingFolder || !newFolderName.trim()}
              className="px-3 py-1 rounded text-xs cursor-pointer disabled:opacity-50"
              style={{ background: theme.buttonBg, color: theme.buttonText }}
            >
              {creatingFolder ? "..." : "Create"}
            </button>
            <button
              onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
              className="px-2 py-1 text-xs cursor-pointer"
              style={{ color: theme.textMuted }}
            >
              Cancel
            </button>
          </div>
        )}

        {foldersLoading ? (
          <p className="text-xs" style={{ color: theme.textMuted }}>Loading folders...</p>
        ) : folders.length === 0 && !showNewFolder ? (
          <p className="text-xs" style={{ color: theme.textMuted }}>
            {activeFolderId ? "No subfolders" : "No folders yet"}
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
            {folders.map((folder) => {
              const isEditing = editingFolderId === folder._id;
              return (
                <button
                  key={folder._id}
                  onClick={() => { if (!isEditing) navigateToFolder(folder._id); }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setFolderContextMenu({ id: folder._id, x: e.clientX, y: e.clientY });
                  }}
                  className="text-left rounded-lg p-3 transition-colors cursor-pointer flex items-center gap-3"
                  style={{ background: theme.card, border: `1px solid ${theme.border}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={folder.color || theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameFolder(folder._id);
                        if (e.key === "Escape") setEditingFolderId(null);
                      }}
                      onBlur={() => handleRenameFolder(folder._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-transparent outline-none text-sm px-1 rounded min-w-0"
                      style={{ color: theme.text, border: `1px solid ${theme.accent}` }}
                    />
                  ) : (
                    <span className="text-sm truncate" style={{ color: theme.text }}>
                      {folder.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Folder context menu */}
      {folderContextMenu && (
        <div
          className="fixed z-50 rounded shadow-lg py-1 min-w-[120px]"
          style={{
            left: folderContextMenu.x,
            top: folderContextMenu.y,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <button
            onClick={() => {
              const folder = folders.find((f) => f._id === folderContextMenu.id);
              if (folder) {
                setEditingFolderId(folder._id);
                setEditFolderName(folder.name);
              }
              setFolderContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer"
            style={{ color: theme.text }}
            onMouseEnter={(e) => (e.currentTarget.style.background = theme.sidebarHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Rename
          </button>
          <button
            onClick={() => {
              handleDeleteFolder(folderContextMenu.id);
              setFolderContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer"
            style={{ color: "#ef4444" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = theme.sidebarHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Delete
          </button>
        </div>
      )}

      {/* Recipes Section */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: theme.textMuted }}>
          Recipes
        </h2>

        {loading ? (
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Loading recipes...
          </p>
        ) : error ? (
          <p className="text-sm" style={{ color: "#ef4444" }}>
            {error}
          </p>
        ) : recipes.length === 0 ? (
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {debouncedQuery
              ? "No recipes found matching your search."
              : activeFolderId
                ? "No recipes in this folder."
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
    </div>
  );
}
