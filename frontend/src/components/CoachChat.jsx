import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CoachChat({ getAccessTokenSilently, isAuthenticated }) {
  const [threadId, setThreadId] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [threadLoading, setThreadLoading] = useState(false);

  useEffect(() => {
    const initThread = async () => {
      if (!isAuthenticated) return;

      setThreadLoading(true);
      setChatError("");

      if (!API_BASE_URL) {
        setChatError("VITE_API_BASE_URL is not set.");
        setThreadLoading(false);
        return;
      }

      try {
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
        console.error("Create thread error:", err);
        setChatError(err.message || "Failed to initialize coach chat.");
      } finally {
        setThreadLoading(false);
      }
    };

    initThread();
  }, [getAccessTokenSilently, isAuthenticated]);

  const formatReply = (text) => {
    if (!text) return "";

    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^[-•]\s*/gm, "• ")
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const handleSend = async () => {
    setChatError("");
    setReply("");

    if (!API_BASE_URL) {
      setChatError("VITE_API_BASE_URL is not set.");
      return;
    }

    if (!message.trim()) {
      setChatError("Please enter a question first.");
      return;
    }

    if (!threadId) {
      setChatError("Coach thread is not ready yet.");
      return;
    }

    setLoading(true);

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
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send coach message.");
      }

      const data = await response.json();
      setReply(data.reply || "");
    } catch (err) {
      console.error("Coach message error:", err);
      setChatError(err.message || "Failed to get coach reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        border: "1px solid #ccc",
        borderRadius: "12px",
      }}
    >
      <h2>Ask Your Green Coach</h2>
      <p>Ask a follow-up question based on your latest analysis.</p>

      {threadLoading && (
        <p style={{ color: "#666" }}>Preparing coach session...</p>
      )}

      {chatError && (
        <p style={{ color: "red", whiteSpace: "pre-wrap" }}>
          {chatError}
        </p>
      )}

      <textarea
        rows="4"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Example: I have to ride a motorcycle to work. What are 3 realistic ways I can reduce my impact?"
        style={{
          width: "100%",
          marginTop: "1rem",
          padding: "0.75rem",
          fontSize: "1rem",
        }}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={loading || threadLoading}
        style={{ marginTop: "1rem" }}
      >
        {loading ? "Thinking..." : "Ask Coach"}
      </button>

      {reply && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <strong>Coach Reply:</strong>
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