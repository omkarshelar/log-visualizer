import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

import {
  ELASTICSEARCH_URL,
  ELASTICSEARCH_USERNAME,
  ELASTICSEARCH_PASSWORD,
} from "../config.ts";
import { prepareLatencyChartData, getLatencyOptions } from "./utils.ts";
import { Log } from "./types.ts";
import StatusCode from "./StatusCodes.tsx";
import LogsTable from "./LogsTable.tsx";
import RequestsPerMinuteChart from "./RequestsPerMinute.tsx";

const App: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const chartData = useMemo(() => prepareLatencyChartData(logs), [logs]);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const query = useMemo(() => {
    if (searchTerm === "") {
      return {
        size: 10000,
        query: { match_all: {} },
        sort: [
          {
            timestamp: {
              order: "desc",
            },
          },
        ],
      };
    } else {
      return {
        size: 10000,
        query: {
          multi_match: {
            query: searchTerm,
            fields: ["request_path", "client_ip", "message"],
            fuzziness: "AUTO",
          },
        },
        sort: [
          {
            timestamp: {
              order: "desc",
            },
          },
        ],
      };
    }
  }, [searchTerm]);

  const fetchLogs = async () => {
    try {
      const response = await axios.post(
        `${ELASTICSEARCH_URL}/filebeat-*/_search`,
        query,
        {
          auth: {
            username: ELASTICSEARCH_USERNAME,
            password: ELASTICSEARCH_PASSWORD,
          },
        }
      );

      const hits = response.data.hits.hits.map((hit: any) => hit._source);
      console.log("hits = ", hits);
      setLogs(hits);
      prepareLatencyChartData(hits);
    } catch (err) {
      setError("Error fetching logs from Elasticsearch.");
      console.error(err);
    }
  };

  const handleSearch = () => fetchLogs();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Log Visualizer</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "20px", textAlign: "right" }}>
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "10px", padding: "5px", maxWidth: "50%" }}
        />
        <button onClick={handleSearch} style={{ padding: "5px 10px" }}>
          Search
        </button>
      </div>

      <div style={{ marginBottom: "50px", width: "100%", height: "400px" }}>
        <h2>Latency Over Time</h2>
        <div style={{ width: "70%", height: "400px" }}>
          {chartData?.datasets?.length ? (
            <Line
              data={chartData}
              options={getLatencyOptions()}
            />
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
      </div>
      <StatusCode logs={logs} />
      <RequestsPerMinuteChart logs={logs} />

      {logs?.length && <LogsTable logs={logs} />}
    </div>
  );
};

export default App;
