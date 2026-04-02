import { useTheme, presets, type FontSize } from "../ThemeContext";

export default function SettingsPage() {
  const { theme, themeName, setTheme, fontSize, setFontSize } = useTheme();

  const fontSizes: { label: string; value: FontSize }[] = [
    { label: "Smallest", value: "smallest" },
    { label: "Small", value: "small" },
    { label: "Default", value: "default" },
    { label: "Large", value: "large" },
    { label: "Largest", value: "largest" },
  ];

  const activeIndex = fontSizes.findIndex((f) => f.value === fontSize);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: theme.text }}>
        Settings
      </h1>
      <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
        Customize your experience.
      </p>

      <div className="mb-10">
        <h2 className="text-sm font-medium mb-4" style={{ color: theme.text }}>
          Font Size
        </h2>

        <div
          className="relative flex p-1 rounded-lg select-none"
          style={{
            width: "450px",
            height: "40px",
            background: theme.border,
          }}
        >
          <div
            className="absolute top-1 bottom-1 left-1 rounded-md shadow-sm transition-all duration-300 ease-out"
            style={{
              // Width is (Total width - padding) / number of items
              width: "calc((100% - 8px) / 5)",
              // Move the block horizontally based on index
              transform: `translateX(${activeIndex * 100}%)`,
              background: theme.accent,
            }}
          />
          {fontSizes.map((f) => {
            const isActive = fontSize === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFontSize(f.value)}
                className="relative z-10 flex-1 flex items-center justify-center text-[13px] font-medium transition-colors duration-300 cursor-pointer"
                style={{
                  // If active, use buttonText (usually dark for light accents)
                  color: isActive ? theme.buttonText : theme.textMuted,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="mb-8 opacity-10" style={{ borderColor: theme.text }} />

      {/* Color Scheme */}
      <div>
        <h2 className="text-sm font-medium mb-4" style={{ color: theme.text }}>
          Themes
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 w-full">
          {Object.entries(presets).map(([key, preset]) => {
            const isActive = themeName === key;
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className="rounded-lg p-3 text-left transition-all cursor-pointer"
                style={{
                  background: preset.card,
                  border: isActive ? `2px solid ${preset.accent}` : `1px solid ${preset.border}`,
                }}
              >
                {/* Preview swatches */}
                <div className="flex gap-1.5 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: preset.sidebar, border: `1px solid ${preset.border}` }}
                  />
                  <div className="w-4 h-4 rounded-full" style={{ background: preset.buttonBg }} />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: preset.bg, border: `1px solid ${preset.border}` }}
                  />
                </div>
                <p className="text-xs font-medium" style={{ color: preset.text }}>
                  {preset.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
