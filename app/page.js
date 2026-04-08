"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [module, setModule] = useState("Authentication");
  const [priority, setPriority] = useState("Medium");

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
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  // ✅ Excel Download (with safety check)
  const downloadExcel = () => {
    if (!result) {
      alert("Please generate test cases first");
      return;
    }

    const testCases = result.split("Test Case ID:").slice(1);

    const data = testCases.map((tc, index) => {
      const lines = tc.split("\n").filter(l => l.trim() !== "");

      const id = "TC" + String(index + 1).padStart(3, "0");
      const title = lines.find(l => l.includes("Title"))?.split(":")[1]?.trim() || "";
      const steps = lines.filter(l => l.match(/^\d+\./)).join(" ");
      const expected = lines.find(l => l.includes("Expected"))?.split(":")[1]?.trim() || "";
      const type = lines.find(l => l.includes("Type"))?.split(":")[1]?.trim() || "";

      return {
        "Test Case ID": id,
        Module: module,
        Title: title,
        Preconditions: "User is on the application",
        Steps: steps,
        "Expected Result": expected,
        "Actual Result": "",
        Status: "",
        Remarks: "",
        Type: type,
        Priority: type === "Negative" ? "High" : priority,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "TestCases");

    XLSX.writeFile(workbook, "TestCases.xlsx");
  };

  // ✅ Copy Button Function
  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black">
      <h1 className="text-3xl font-bold mb-2 text-center">
        TestGenie AI 🪄
      </h1>

      <p className="text-center text-gray-600 mb-6">
        From Idea to Test Cases - Powered by AI Magic ✨
      </p>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">

        {/* Module Input */}
        <input
          type="text"
          placeholder="Enter Module (e.g., Login Functionality)"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="w-full border p-3 mb-3 rounded"
        />

        {/* Priority Dropdown */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border p-3 mb-4 rounded"
        >
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {/* Requirement Input */}
        <textarea
          className="w-full border p-3 mb-4 rounded"
          rows="5"
          placeholder="Enter your requirement..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Generate Button */}
        <button
          onClick={generateTestCases}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Generating..." : "Generate Test Cases"}
        </button>

        {/* Download Button */}
        <button
          onClick={downloadExcel}
          disabled={!result}
          className={`px-4 py-2 rounded w-full mt-3 text-white ${
            result
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {result ? "Download Excel" : "Generate first to download"}
        </button>

        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          disabled={!result}
          className={`px-4 py-2 rounded w-full mt-3 text-white ${
            result
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Copy Test Cases
        </button>

        {/* Output */}
        {result && (
          <div className="mt-6 bg-gray-100 p-4 rounded whitespace-pre-wrap">
            {result
              .split("\n")
              .filter(line => line.trim() !== "")
              .map((line, index) => (
                <p
                  key={index}
                  className={`mb-2 ${
                    line.includes("Test Case ID") || line.includes("Title")
                      ? "font-semibold"
                      : ""
                  }`}
                >
                  {line}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}