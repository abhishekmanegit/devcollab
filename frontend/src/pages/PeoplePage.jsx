import { useEffect, useState } from "react";
import { Loader2, Search, Users } from "lucide-react";
import { api, githubHandle } from "../api/api";
import Avatar from "../components/Avatar";
import GithubIcon from "../components/GithubIcon";
import DeveloperProfileModal from "../modals/DeveloperProfileModal";

export default function PeoplePage({ token, onToast }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState(null);
  // Holds the outcome for one specific term, which lets loading be derived
  // instead of tracked with extra state.
  const [outcome, setOutcome] = useState({ term: "", results: [], error: "" });

  const tooShort = debounced.length < 2;
  const loading = !tooShort && outcome.term !== debounced;
  const settled = !tooShort && outcome.term === debounced;
  const results = settled ? outcome.results : [];
  const error = settled ? outcome.error : "";

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) return;

    let cancelled = false;

    api(`/users/search?q=${encodeURIComponent(debounced)}`, {}, token)
      .then(data => {
        if (cancelled) return;
        setOutcome({ term: debounced, results: Array.isArray(data) ? data : [], error: "" });
      })
      .catch(err => {
        if (cancelled) return;
        setOutcome({ term: debounced, results: [], error: err?.message || "Search failed." });
      });

    return () => { cancelled = true; };
  }, [debounced, token]);

  return (
    <div style={{ flex: 1, overflow: "auto" }}>

      <div style={{
        padding: "16px 28px", borderBottom: "1px solid var(--border)",
        background: "var(--surface)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 19, fontWeight: 700 }}>Find Developers</h1>
        <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>Search by name, skill or bio, then send a collaboration request</p>
      </div>

      <div style={{ padding: 28, maxWidth: 760 }}>

        <div style={{ position: "relative" }}>
          <Search
            size={15}
            color="var(--t3)"
            style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search developers by name, skill or bio…"
            style={{ paddingLeft: 36, paddingRight: loading ? 36 : 13 }}
          />
          {loading && (
            <Loader2
              size={14}
              className="spin"
              color="var(--t3)"
              style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
          )}
        </div>

        {error && (
          <p style={{ marginTop: 16, padding: "9px 12px", fontSize: 13, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--r-sm)", color: "var(--red)" }}>
            {error}
          </p>
        )}

        {!tooShort && !loading && !error && outcome.results.length === 0 && (
          <div style={{ marginTop: 44, textAlign: "center", color: "var(--t3)" }}>
            <Users size={26} />
            <p style={{ fontSize: 13, marginTop: 10 }}>
              Type at least 2 characters to find developers.
            </p>
          </div>
        )}

        {settled && !loading && !error && results.length === 0 && (
          <div style={{ marginTop: 44, textAlign: "center", color: "var(--t3)" }}>
            <Users size={26} />
            <p style={{ fontSize: 13, marginTop: 10 }}>No developers matched “{debounced}”.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          {results.map(person => {
            const handle = githubHandle(person.githubUrl);
            return (
              <button
                key={person.id}
                onClick={() => setSelected(person.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 13, width: "100%",
                  padding: 15, textAlign: "left",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-lg)",
                }}
              >
                <Avatar
                  name={person.name}
                  src={person.profilePictureUrl}
                  size={42}
                  style={{ flexShrink: 0, border: "1.5px solid var(--border)" }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>{person.name}</span>
                    {handle && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)" }}>
                        <GithubIcon size={12} />@{handle}
                      </span>
                    )}
                  </div>
                  {person.bio && (
                    <p style={{
                      fontSize: 12, color: "var(--t2)", marginTop: 4,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {person.bio}
                    </p>
                  )}
                  {person.skills?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                      {person.skills.slice(0, 4).map((s, i) => (
                        <span key={i} style={{ padding: "3px 9px", fontSize: 11, fontWeight: 500, background: "var(--accent-bg)", color: "var(--accent)", borderRadius: 20 }}>
                          {s}
                        </span>
                      ))}
                      {person.skills.length > 4 && (
                        <span style={{ fontSize: 11, color: "var(--t3)", alignSelf: "center" }}>
                          +{person.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected !== null && (
        <DeveloperProfileModal
          key={selected}
          userId={selected}
          token={token}
          onClose={() => setSelected(null)}
          onToast={onToast}
        />
      )}
    </div>
  );
}