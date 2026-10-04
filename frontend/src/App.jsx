import { useCallback, useEffect, useState } from "react";
import { Loader2, ServerCrash } from "lucide-react";
import { api } from "./api/api";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import CreateProjectModal from "./modals/CreateProjectModal";
import "./styles/global.css";

export default function App() {
  const [token, setToken]           = useState(localStorage.getItem("dc_token"));
  const [user, setUser]             = useState(null);
  const [status, setStatus]         = useState(() => (token ? "loading" : "anon"));
  const [page, setPage]             = useState("dashboard");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast]           = useState(null);
  const [projectRefresh, setProjectRefresh] = useState(0);
  const [retryKey, setRetryKey]     = useState(0);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("dc_token");
    setToken(null);
    setUser(null);
    setStatus("anon");
    setPage("dashboard");
  }, []);

  // Fetch the logged-in user; an expired token logs us out, a dead backend does not.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    api("/users/me", {}, token)
      .then(data => {
        if (cancelled) return;
        setUser(data);
        setStatus("ready");
      })
      .catch(err => {
        if (cancelled) return;
        if (err?.status === 401 || err?.status === 403) {
          handleLogout();
        } else {
          setStatus("offline");
        }
      });

    return () => { cancelled = true; };
  }, [token, retryKey, handleLogout]);

  function handleAuth(newToken) {
    localStorage.setItem("dc_token", newToken);
    setStatus("loading");
    setToken(newToken);
  }

  function retry() {
    setStatus("loading");
    setRetryKey(k => k + 1);
  }

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  if (status === "anon") {
    return <AuthPage onAuth={handleAuth} />;
  }

  if (status === "offline") {
    return (
      <div className="boot-screen">
        <ServerCrash size={26} color="var(--t3)" />
        <h2>Cannot reach the DevCollab API</h2>
        <p>Make sure the Spring Boot backend is running on port 8080, then try again.</p>
        <button className="btn-primary" onClick={retry}>
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="boot-screen">
        <Loader2 size={24} className="spin" color="var(--t3)" />
        <p>Loading your workspace…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={handleLogout}
      />

      {page === "dashboard" && (
        <Dashboard
          token={token}
          refreshKey={projectRefresh}
          onToast={showToast}
          onShowCreate={() => setShowCreate(true)}
        />
      )}

      {page === "profile" && (
        <ProfilePage
          token={token}
          user={user}
          setUser={setUser}
        />
      )}

      {showCreate && (
        <CreateProjectModal
          token={token}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            showToast("Project created successfully!");
            setProjectRefresh(k => k + 1);
          }}
        />
      )}

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}