import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Link2, Copy, Loader2, Check, AlertCircle } from "lucide-react";

// This component handles the actual redirection logic
function RedirectHandler() {
  const { stem } = useParams();
  const linkData = useQuery(api.links.getLink, { stem: stem || "" });

  useEffect(() => {
    if (linkData) {
      window.location.replace(linkData.url);
    }
  }, [linkData]);

  if (linkData === null) return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>
      <AlertCircle size={48} color="#ef4444" style={{ marginBottom: "10px" }} />
      <h2>404: Link Not Found</h2>
      <p>This link doesn't exist or has been removed.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <Loader2 className="animate-spin" size={48} color="#2563eb" />
      <h2 style={{ color: "#1e293b", marginTop: "10px" }}>Redirecting you...</h2>
    </div>
  );
}

// The Main UI
function Home() {
  const [url, setUrl] = useState("");
  const [customStem, setCustomStem] = useState("");
  const [shortened, setShortened] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  
  const createLink = useMutation(api.links.createLink);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
    setCopied(false);

    try {
      const stem = await createLink({ 
        url, 
        customStem: customStem.trim() !== "" ? customStem : undefined 
      });
      setShortened(`${window.location.host}/${stem}`);
      setCustomStem(""); 
    } catch (err: any) {
      setError(err.data?.message || "Something went wrong. Please try again.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortened);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ maxWidth: "400px", width: "100%", backgroundColor: "white", padding: "40px", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", color: "#1e293b", margin: "0 0 30px 0" }}>
          <div style={{ backgroundColor: "#2563eb", padding: "8px", borderRadius: "8px", display: "flex" }}>
            <Link2 color="white" size={24} />
          </div>
          GenLink
        </h1>
        
        <form onSubmit={handleShorten} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>DESTINATION URL</label>
            <input 
              style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", boxSizing: "border-box", fontSize: "14px" }}
              placeholder="https://example.com/very-long-link" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>CUSTOM STEM (OPTIONAL)</label>
            <input 
              style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", boxSizing: "border-box", fontSize: "14px" }}
              placeholder="e.g. my-project" 
              value={customStem} 
              onChange={(e) => setCustomStem(e.target.value)} 
            />
          </div>

          {error && (
            <div style={{ color: "#ef4444", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px", backgroundColor: "#fef2f2", padding: "10px", borderRadius: "8px" }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button style={{ width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", padding: "14px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", marginTop: "10px" }}>
            Shorten
          </button>
        </form>

        {shortened && (
          <div style={{ marginTop: "25px", padding: "15px", backgroundColor: "#f0f7ff", borderRadius: "12px", border: "1px solid #dbeafe" }}>
            <p style={{ fontSize: "11px", fontWeight: "bold", color: "#2563eb", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Ready! Your short link:</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              <code style={{ color: "#1e40af", fontWeight: "600", fontSize: "14px", wordBreak: "break-all" }}>{shortened}</code>
              <button 
                type="button"
                onClick={copyToClipboard} 
                style={{ border: "none", background: "#ffffff", cursor: "pointer", padding: "8px", borderRadius: "6px", display: "flex", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
              >
                {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} color="#64748b" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:stem" element={<RedirectHandler />} />
      </Routes>
    </BrowserRouter>
  );
}