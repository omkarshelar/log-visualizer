// import { ChartOptions } from "chart.js";
import { Log } from "./types.ts";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { prepareStatusCodeData, statusOptions } from "./utils.ts";

const StatusCode: React.FC<{logs: Log[]}> = ({logs}: {logs: Log[]}) => {

  const chartData = useMemo(() => prepareStatusCodeData(logs), [logs]);

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>Status Code Percentage Split (per Minute)</h2>
      <div style={{ width: "70%", height: "400px" }}>
        {chartData.labels?.length ? (
          <Bar data={chartData} options={statusOptions} />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default StatusCode;
