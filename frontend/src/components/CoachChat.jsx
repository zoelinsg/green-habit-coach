import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CoachChat({ getAccessTokenSilently, isAuthenticated }) {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");
  const [threadId, setThreadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initThread = async () => {
      if (!isAuthenticated) return;

      try {
        setError("");

        const token = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/coach/thread`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to create coach thread.");
        }

        const data = await response.json();
        setThreadId(data.thread_id);
      } catch (err) {
        console.error("Create coach thread error:", err);
        setError(err.message || "Failed to create coach thread.");
      }
    };

    initThread();
  }, [getAccessTokenSilently, isAuthenticated]);

  const formatReply = (text) => {
    if (!text) return null;

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    return lines.map((line, index) => (
      <p key={index} style={{ margin: "0 0 0.9rem 0" }}>
        {line}
      </p>
    ));
  };

  const handleAskCoach = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    if (!threadId) {
      setError("Coach thread is not ready yet. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    setError("");
    setReply("");

    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(
        `${API_BASE_URL}/api/coach/message?thread_id=${encodeURIComponent(threadId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: question,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to get coach reply.");
      }

      const data = await response.json();
      setReply(data.reply || "");
    } catch (err) {
      console.error("Coach message error:", err);
      setError(err.message || "Failed to get coach reply.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        border: "1px solid #ccc",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Ask Your Green Coach</h2>
      <p>Ask a follow-up question based on your latest analysis.</p>

      {error && (
        <p style={{ color: "red", marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
          {error}
        </p>
      )}

      <textarea
        rows="4"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Example: I have to ride a motorcycle to work. What are 3 realistic ways I can reduce my impact?"
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: "8px",
          border: "1px solid #999",
          marginBottom: "1rem",
        }}
      />

      <button type="button" onClick={handleAskCoach} disabled={loading || !threadId}>
        {loading ? "Thinking..." : "Ask Coach"}
      </button>

      {reply && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "10px",
            backgroundColor: "#fafafa",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Coach Reply:</h3>
          <div
            style={{
              marginTop: "0.75rem",
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
            }}
          >
            {formatReply(reply)}
          </div>
        </div>
      )}
    </div>
  );
}

export default CoachChat;