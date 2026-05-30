import { useState, useEffect } from "react";
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
  const [page, setPage]             = useState("dashboard");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast]           = useState(null);

  // Fetch logged-in user on load
  useEffect(() => {
    if (token) {
      api("/users/me", {}, token)
        .then(setUser)
        .catch(() => {
          // Token expired or invalid — log out
          handleLogout();
        });
    }
  }, [token]);

  function handleAuth(tok) {
    localStorage.setItem("dc_token", tok);
    setToken(tok);
  }

  function handleLogout() {
    localStorage.removeItem("dc_token");
    setToken(null);
    setUser(null);
    setPage("dashboard");
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
  }

  if (!token) {
    return <AuthPage onAuth={handleAuth} />;
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
          user={user}
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
          onCreated={() => showToast("Project created successfully!")}
        />
      )}

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
