import React, { useState } from "react";
import { Log } from "./types";

const LogsTable: React.FC<{ logs: Log[] }> = ({ logs }) => {
  const rowsPerPage = 100; // Number of rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(logs.length / rowsPerPage);

  const currentLogs = logs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2>Log Details</h2>

      {/* Pagination Controls */}
      <div style={{ margin: "20px", textAlign: "right" }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Request Path</th>
            <th>Method</th>
            <th>Status</th>
            <th>Latency (ms)</th>
            <th>Client IP</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.map((log, index) => (
            <tr key={index}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.request_path}</td>
              <td>{log.request_method}</td>
              <td
                style={{
                  color: log.status_code >= 400 ? "red" : "black",
                }}
              >
                {log.status_code}
              </td>
              <td>{log.latency_ms}</td>
              <td>{log.client_ip}</td>
              <td>{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
