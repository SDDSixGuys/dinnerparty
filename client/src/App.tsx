import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, createContext, useContext } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import SidebarLayout from "./components/SidebarLayout";

const API_BASE = import.meta.env.VITE_API_URL || '';

// --- Auth Context ---

interface User {
  uuid: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data.user);
      })
      .catch((err) => {
        console.error("Auth check failed: ", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
}

// --- Landing Page ---

function HomePage() {
  const loginRef = useRef<HTMLDivElement>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isRegistering ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;
    const body = isRegistering ? { email, username, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login/Register Error: ", error);
      setError("Could not connect to server");
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-5xl font-semibold text-black mb-3 tracking-tight">dinnerparty</h1>
        <p className="text-base text-neutral-500 mb-10">Cook Better, Eat Better.</p>
        <button
          onClick={scrollToLogin}
          className="px-6 py-2 bg-black text-white rounded text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Log In
        </button>
      </div>

      {/* Login / Register */}
      <div ref={loginRef} className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-full max-w-sm px-6">
          <h2 className="text-xl font-semibold text-black mb-6 text-center">
            {isRegistering ? "Create an Account" : "Log In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="your username"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <button
              type="submit"
              className="w-full py-2 bg-black text-white rounded text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {isRegistering ? "Create Account" : "Log In"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-neutral-500">
            {isRegistering ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setIsRegistering(false);
                    setError("");
                  }}
                  className="text-black font-medium hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                I don't have an account.{" "}
                <button
                  onClick={() => {
                    setIsRegistering(true);
                    setError("");
                  }}
                  className="text-black font-medium hover:underline cursor-pointer"
                >
                  Create one
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Protected Route ---

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/" />;

  return <SidebarLayout />;
}

// --- App ---

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { fontSize } = useTheme();

  const fontSizeMap = {
    smallest: "text-[12px]",
    small: "text-[14px]",
    default: "text-[16px]",
    large: "text-[18px]",
    largest: "text-[20px]",
  };

  const currentFontSizeClass = fontSizeMap[fontSize] || fontSizeMap.default;

  return (
    <div className={`${currentFontSizeClass} min-h-screen transition-all duration-200`}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/*" element={<ProtectedRoute />} />
      </Routes>
    </div>
  );
}

export default App;
