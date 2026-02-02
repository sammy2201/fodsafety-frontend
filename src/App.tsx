import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

type TestResult = {
  id: string;
  cfuCount: number;
  location: string;
  testedAt: string;
  ProductionLine: {
    id: string;
    name: string;
    Facility: {
      id: string;
      name: string;
    };
  };
};

function App() {
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    facilityName: "",
    productionLineName: "",
    cfuCount: 0,
    location: "",
    testedAt: "",
  });

  const [filters, setFilters] = useState({
    facility: "",
    productionLine: "",
    from: "",
    to: "",
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch all results once
  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/test-results`);
      setAllResults(res.data.data ?? []);
      setResults(res.data.data ?? []); // show all initially
    } catch (err) {
      console.error(err);
      alert("Failed to fetch test results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Apply frontend filters
  const applyFilters = () => {
    let filtered = allResults;

    if (filters.facility) {
      filtered = filtered.filter((r) =>
        r.ProductionLine?.Facility?.name
          .toLowerCase()
          .includes(filters.facility.toLowerCase()),
      );
    }

    if (filters.productionLine) {
      filtered = filtered.filter((r) =>
        r.ProductionLine?.name
          .toLowerCase()
          .includes(filters.productionLine.toLowerCase()),
      );
    }

    if (filters.from) {
      const fromDate = new Date(filters.from);
      filtered = filtered.filter((r) => new Date(r.testedAt) >= fromDate);
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      filtered = filtered.filter((r) => new Date(r.testedAt) <= toDate);
    }

    setResults(filtered);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/test-results`, form);
      setForm({
        facilityName: "",
        productionLineName: "",
        cfuCount: 0,
        location: "",
        testedAt: "",
      });
      fetchResults();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error ?? "Failed to create test result");
    }
  };

  return (
    <div className="container">
      <h1>Food Safety Test Results</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Facility Name"
          value={form.facilityName}
          onChange={(e) => setForm({ ...form, facilityName: e.target.value })}
        />
        <input
          placeholder="Production Line Name"
          value={form.productionLineName}
          onChange={(e) =>
            setForm({ ...form, productionLineName: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="CFU Count"
          value={form.cfuCount}
          onChange={(e) =>
            setForm({ ...form, cfuCount: Number(e.target.value) })
          }
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          type="datetime-local"
          value={form.testedAt}
          onChange={(e) => setForm({ ...form, testedAt: e.target.value })}
        />
        <button type="submit">Add Test Result</button>
      </form>

      {/* Filters */}
      {/* Filters */}
      <div className="filters">
        <h2>Filters</h2>

        <div style={{ marginBottom: 8 }}>
          <label>
            Facility:&nbsp;
            <input
              placeholder="Facility"
              value={filters.facility}
              onChange={(e) =>
                setFilters({ ...filters, facility: e.target.value })
              }
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Production Line:&nbsp;
            <input
              placeholder="Production Line"
              value={filters.productionLine}
              onChange={(e) =>
                setFilters({ ...filters, productionLine: e.target.value })
              }
            />
          </label>
        </div>

        <div style={{ marginBottom: 8, display: "flex", gap: 16 }}>
          <label>
            From Date:&nbsp;
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
          </label>

          <label>
            To Date:&nbsp;
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={applyFilters}>Apply Filters</button>
          <button
            onClick={() => {
              setFilters({
                facility: "",
                productionLine: "",
                from: "",
                to: "",
              });
              setResults(allResults); // reset
            }}>
            Clear Filters
          </button>
        </div>
      </div>

      <h2>Results</h2>
      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Facility</th>
                <th>Production Line</th>
                <th>CFU Count</th>
                <th>Location</th>
                <th>Tested At</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{r.ProductionLine?.Facility?.name}</td>
                  <td>{r.ProductionLine?.name}</td>
                  <td>{r.cfuCount}</td>
                  <td>{r.location}</td>
                  <td>{new Date(r.testedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
