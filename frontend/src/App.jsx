import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import CoachChat from "./components/CoachChat";

function App() {
  const [form, setForm] = useState({
    transport_mode: "motorcycle",
    transport_days_per_week: 5,
    red_meat_meals_per_week: 4,
    ac_hours_per_day: 8,
    disposable_items_per_week: 6,
    recycle_habit: "sometimes",
    bring_own_bottle: false,
    bring_own_bag: true,
    shopping_frequency_per_week: 3,
    electricity_saving_awareness: "medium",
    notes: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    error,
    getAccessTokenSilently,
  } = useAuth0();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError("");
    setResult(null);

    if (!isAuthenticated) {
      await loginWithRedirect();
      return;
    }

    setLoading(true);

    try {
      const token = await getAccessTokenSilently();

      const payload = {
        ...form,
        transport_days_per_week: Number(form.transport_days_per_week),
        red_meat_meals_per_week: Number(form.red_meat_meals_per_week),
        ac_hours_per_day: Number(form.ac_hours_per_day),
        disposable_items_per_week: Number(form.disposable_items_per_week),
        shopping_frequency_per_week: Number(form.shopping_frequency_per_week),
      };

      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to analyze habits.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Analyze API error:", err);
      setApiError(err.message || "Failed to analyze habits.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = async () => {
    setApiError("");
    setHistoryLoading(true);

    try {
      const token = await getAccessTokenSilently();

      const response = await fetch("http://127.0.0.1:8000/api/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load history.");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error("History API error:", err);
      setApiError(err.message || "Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDateTime = (value) => {
    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
        <h1>Green Habit Coach</h1>
        <p>Loading authentication...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>Green Habit Coach</h1>
          <p>Analyze your daily habits and get eco-friendly suggestions.</p>
        </div>

        <div>
          {isAuthenticated ? (
            <>
              <p style={{ marginBottom: "0.75rem" }}>
                Logged in as: <strong>{user?.name || user?.email}</strong>
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() =>
                    logout({
                      logoutParams: {
                        returnTo: window.location.origin,
                      },
                    })
                  }
                >
                  Log out
                </button>

                <button
                  type="button"
                  onClick={handleLoadHistory}
                  disabled={historyLoading}
                >
                  {historyLoading ? "Loading..." : "Load History"}
                </button>
              </div>
            </>
          ) : (
            <button type="button" onClick={() => loginWithRedirect()}>
              Log in
            </button>
          )}
        </div>
      </div>

      {error && (
        <p style={{ color: "red", marginBottom: "1rem" }}>
          Auth Error: {error.message}
        </p>
      )}

      {apiError && (
        <p
          style={{
            color: "red",
            marginBottom: "1rem",
            whiteSpace: "pre-wrap",
          }}
        >
          API Error: {apiError}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Habit Form</h2>

        <label>
          Transport Mode
          <br />
          <select
            name="transport_mode"
            value={form.transport_mode}
            onChange={handleChange}
          >
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="public_transport">Public Transport</option>
            <option value="bicycle">Bicycle</option>
            <option value="walk">Walk</option>
          </select>
        </label>

        <label>
          Transport Days Per Week
          <br />
          <input
            type="number"
            name="transport_days_per_week"
            min="0"
            value={form.transport_days_per_week}
            onChange={handleChange}
          />
        </label>

        <label>
          Red Meat Meals Per Week
          <br />
          <input
            type="number"
            name="red_meat_meals_per_week"
            min="0"
            value={form.red_meat_meals_per_week}
            onChange={handleChange}
          />
        </label>

        <label>
          AC Hours Per Day
          <br />
          <input
            type="number"
            name="ac_hours_per_day"
            min="0"
            value={form.ac_hours_per_day}
            onChange={handleChange}
          />
        </label>

        <label>
          Disposable Items Per Week
          <br />
          <input
            type="number"
            name="disposable_items_per_week"
            min="0"
            value={form.disposable_items_per_week}
            onChange={handleChange}
          />
        </label>

        <label>
          Recycle Habit
          <br />
          <select
            name="recycle_habit"
            value={form.recycle_habit}
            onChange={handleChange}
          >
            <option value="always">Always</option>
            <option value="sometimes">Sometimes</option>
            <option value="never">Never</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            name="bring_own_bottle"
            checked={form.bring_own_bottle}
            onChange={handleChange}
          />
          {" "}Bring Own Bottle
        </label>

        <label>
          <input
            type="checkbox"
            name="bring_own_bag"
            checked={form.bring_own_bag}
            onChange={handleChange}
          />
          {" "}Bring Own Bag
        </label>

        <label>
          Shopping Frequency Per Week
          <br />
          <input
            type="number"
            name="shopping_frequency_per_week"
            min="0"
            value={form.shopping_frequency_per_week}
            onChange={handleChange}
          />
        </label>

        <label>
          Electricity Saving Awareness
          <br />
          <select
            name="electricity_saving_awareness"
            value={form.electricity_saving_awareness}
            onChange={handleChange}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label>
          Notes
          <br />
          <textarea
            name="notes"
            rows="4"
            value={form.notes}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze My Habits"}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "12px",
          }}
        >
          <h2>Analysis Result</h2>

          <p>
            <strong>Score:</strong> {result.score}
          </p>

          <p>
            <strong>Summary:</strong> {result.summary}
          </p>

          <h3>Top Issues</h3>
          <ul>
            {result.top_issues?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>Suggestions</h3>
          <ul>
            {result.suggestions?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>7-Day Challenge Plan</h3>
          <ul>
            {result.challenge_plan?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {isAuthenticated && result && (
        <CoachChat
          getAccessTokenSilently={getAccessTokenSilently}
          isAuthenticated={isAuthenticated}
        />
      )}

      {history.length > 0 && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "12px",
          }}
        >
          <h2>History</h2>

          {history.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "1rem",
                marginTop: "1rem",
              }}
            >
              <p>
                <strong>Record ID:</strong> {item.id}
              </p>
              <p>
                <strong>Score:</strong> {item.score}
              </p>
              <p>
                <strong>Summary:</strong> {item.summary}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {formatDateTime(item.created_at)}
              </p>

              <h3>Top Issues</h3>
              <ul>
                {item.top_issues?.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>

              <h3>Suggestions</h3>
              <ul>
                {item.suggestions?.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>

              <h3>7-Day Challenge Plan</h3>
              <ul>
                {item.challenge_plan?.map((day, index) => (
                  <li key={index}>{day}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;