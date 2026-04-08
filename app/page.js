"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [module, setModule] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (input, result) => {
    const newHistory = [{ input, result }, ...history];
    setHistory(newHistory);
    localStorage.setItem("history", JSON.stringify(newHistory));
  };

  const generateTestCases = async () => {
    if (!input) return alert("Please enter requirement");

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      setResult(data.result);
      saveToHistory(input, data.result);
    } catch (error) {
      alert("Error generating test cases");
    }

    setLoading(false);
  };

  const parseTestCases = () => {
    if (!result) return [];

    const testCases = result.split("Test Case ID:").slice(1);

    return testCases.map((tc, index) => {
      const lines = tc.split("\n").filter(l => l.trim() !== "");

      return {
        id: "TC" + String(index + 1).padStart(3, "0"),
        title: lines.find(l => l.includes("Title"))?.split(":")[1]?.trim() || "",
        steps: lines.filter(l => l.match(/^\d+\./)).join(" "),
        expected: lines.find(l => l.includes("Expected"))?.split(":")[1]?.trim() || "",
        type: lines.find(l => l.includes("Type"))?.split(":")[1]?.trim() || "",
      };
    });
  };

  const downloadExcel = () => {
    if (!result) return alert("Generate test cases first");

    const parsed = parseTestCases();

    const data = parsed.map((tc) => ({
      "Test Case ID": tc.id,
      Module: module || "General",
      Title: tc.title,
      Preconditions: "User is on the application",
      Steps: tc.steps,
      "Expected Result": tc.expected,
      "Actual Result": "",
      Status: "",
      Remarks: "",
      Type: tc.type,
      Priority: tc.type === "Negative" ? "High" : priority,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TestCases");
    XLSX.writeFile(wb, "TestCases.xlsx");
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    alert("Copied!");
  };

  const theme = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black";
  const parsedData = parseTestCases();

  return (
    <div className={`min-h-screen p-6 ${theme}`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">TestGenie AI 🪄</h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded bg-gray-300 text-black"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <p className="mb-6 text-center">
          From Idea to Test Cases — Powered by AI Magic ✨
        </p>

        <div className="bg-white text-black p-6 rounded-xl shadow">

          <input
            type="text"
            placeholder="e.g., Login functionality"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="w-full border p-3 mb-3 rounded-lg"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border p-2 mb-3 rounded"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows="4"
            placeholder="Enter requirement..."
            className="w-full border p-2 mb-3 rounded"
          />

          {/* 🔥 BUTTONS */}
          <div className="flex gap-2">
            <button
              onClick={generateTestCases}
              className="bg-blue-500 text-white px-4 py-2 rounded flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </button>

            <button
              onClick={downloadExcel}
              disabled={!result}
              className={`px-4 py-2 rounded text-white ${
                result ? "bg-green-500" : "bg-gray-400"
              }`}
            >
              Excel
            </button>

            <button
              onClick={copyToClipboard}
              disabled={!result}
              className={`px-4 py-2 rounded text-white ${
                result ? "bg-purple-500" : "bg-gray-400"
              }`}
            >
              Copy
            </button>
          </div>

          {/* 🔥 TABLE OUTPUT */}
          {parsedData.length > 0 && (
            <div className="mt-6 overflow-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Title</th>
                    <th className="border p-2">Steps</th>
                    <th className="border p-2">Expected</th>
                    <th className="border p-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((tc, i) => (
                    <tr key={i}>
                      <td className="border p-2">{tc.id}</td>
                      <td className="border p-2">{tc.title}</td>
                      <td className="border p-2">{tc.steps}</td>
                      <td className="border p-2">{tc.expected}</td>
                      <td className="border p-2">{tc.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold mb-2">History</h2>
            {history.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="bg-white text-black p-3 mb-2 rounded shadow cursor-pointer"
                onClick={() => {
                  setInput(item.input);
                  setResult(item.result);
                }}
              >
                {item.input}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}