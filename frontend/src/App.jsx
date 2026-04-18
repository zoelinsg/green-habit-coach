import { useState } from "react";

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          transport_days_per_week: Number(form.transport_days_per_week),
          red_meat_meals_per_week: Number(form.red_meat_meals_per_week),
          ac_hours_per_day: Number(form.ac_hours_per_day),
          disposable_items_per_week: Number(form.disposable_items_per_week),
          shopping_frequency_per_week: Number(form.shopping_frequency_per_week),
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("API error:", error);
      alert("Failed to analyze habits.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", fontFamily: "Arial" }}>
      <h1>Green Habit Coach</h1>
      <p>Analyze your daily habits and get eco-friendly suggestions.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        <label>
          Transport Mode
          <select name="transport_mode" value={form.transport_mode} onChange={handleChange}>
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="public_transport">Public Transport</option>
            <option value="bicycle">Bicycle</option>
            <option value="walk">Walk</option>
          </select>
        </label>

        <label>
          Transport Days Per Week
          <input
            type="number"
            name="transport_days_per_week"
            value={form.transport_days_per_week}
            onChange={handleChange}
          />
        </label>

        <label>
          Red Meat Meals Per Week
          <input
            type="number"
            name="red_meat_meals_per_week"
            value={form.red_meat_meals_per_week}
            onChange={handleChange}
          />
        </label>

        <label>
          AC Hours Per Day
          <input
            type="number"
            name="ac_hours_per_day"
            value={form.ac_hours_per_day}
            onChange={handleChange}
          />
        </label>

        <label>
          Disposable Items Per Week
          <input
            type="number"
            name="disposable_items_per_week"
            value={form.disposable_items_per_week}
            onChange={handleChange}
          />
        </label>

        <label>
          Recycle Habit
          <select name="recycle_habit" value={form.recycle_habit} onChange={handleChange}>
            <option value="always">Always</option>
            <option value="sometimes">Sometimes</option>
            <option value="never">Never</option>
          </select>
        </label>

        <label>
          Bring Own Bottle
          <input
            type="checkbox"
            name="bring_own_bottle"
            checked={form.bring_own_bottle}
            onChange={handleChange}
          />
        </label>

        <label>
          Bring Own Bag
          <input
            type="checkbox"
            name="bring_own_bag"
            checked={form.bring_own_bag}
            onChange={handleChange}
          />
        </label>

        <label>
          Shopping Frequency Per Week
          <input
            type="number"
            name="shopping_frequency_per_week"
            value={form.shopping_frequency_per_week}
            onChange={handleChange}
          />
        </label>

        <label>
          Electricity Saving Awareness
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
          <textarea name="notes" value={form.notes} onChange={handleChange} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze My Habits"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "2rem", padding: "1.5rem", border: "1px solid #ccc", borderRadius: "12px" }}>
          <h2>Analysis Result</h2>
          <p><strong>Score:</strong> {result.score}</p>
          <p><strong>Summary:</strong> {result.summary}</p>

          <h3>Top Issues</h3>
          <ul>
            {result.top_issues.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>Suggestions</h3>
          <ul>
            {result.suggestions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>7-Day Challenge Plan</h3>
          <ul>
            {result.challenge_plan.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;