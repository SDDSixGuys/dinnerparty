import { useTheme, presets } from '../ThemeContext';

export default function SettingsPage() {
  const { theme, themeName, setTheme } = useTheme();

  return (
    <div className="p-8">
      <h1
        className="text-2xl font-semibold mb-1"
        style={{ color: theme.text }}
      >
        Settings
      </h1>
      <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
        Customize your experience.
      </p>

      {/* Color Scheme */}
      <div>
        <h2
          className="text-sm font-medium mb-4"
          style={{ color: theme.text }}
        >
          Color scheme
        </h2>
        <div className="grid grid-cols-3 gap-3 max-w-lg">
          {Object.entries(presets).map(([key, preset]) => {
            const isActive = themeName === key;
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className="rounded-lg p-3 text-left transition-all cursor-pointer"
                style={{
                  background: preset.card,
                  border: isActive
                    ? `2px solid ${preset.accent}`
                    : `1px solid ${preset.border}`,
                }}
              >
                {/* Preview swatches */}
                <div className="flex gap-1.5 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: preset.sidebar, border: `1px solid ${preset.border}` }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: preset.buttonBg }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: preset.bg, border: `1px solid ${preset.border}` }}
                  />
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: preset.text }}
                >
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
