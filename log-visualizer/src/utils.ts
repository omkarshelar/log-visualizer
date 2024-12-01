import { ChartOptions } from "chart.js";
import { Log } from "./types";

export const prepareLatencyChartData = (logs: Log[]) => {

  const roundTo5Minutes = (date: Date) => {
    const ms = date.getTime();
    const roundedMs = Math.floor(ms / (1 * 60 * 1000)) * (1 * 60 * 1000);
    return new Date(roundedMs);
  };

  const groupedData: { [interval: string]: number[] } = {};

  logs.forEach((log) => {
    const roundedTimestamp = roundTo5Minutes(new Date(log.timestamp)).toLocaleString();
    if (!groupedData[roundedTimestamp]) {
      groupedData[roundedTimestamp] = [];
    }
    groupedData[roundedTimestamp].push(log.latency_ms);
  });

  const timestamps = Object.keys(groupedData);
  const latencies = timestamps.map((timestamp) => {
    const values = groupedData[timestamp];
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  });

  return {
    labels: timestamps,
    datasets: [
      {
        label: "Latency (ms)",
        data: latencies,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
    ],
  };
};

export const getLatencyOptions = () => ({
  responsive: true,
  scales: {
    y: {
      beginAtZero: true, // Start the y-axis at 0
      ticks: {
        padding: 10, // Add padding between ticks and chart area
      },
      grace: "10%", // Add padding above the max value
    },
  },
  layout: {
    padding: {
      top: 20, // Add extra padding at the top
      bottom: 20, // Add extra padding at the bottom
    },
  },
});

// Helper function to round timestamp to the nearest 1-minute interval
const roundToMinutes = (date: Date) => {
  const ms = date.getTime();
  const roundedMs = Math.floor(ms / (1 * 60 * 1000)) * (1 * 60 * 1000);
  return new Date(roundedMs);
};

export const prepareStatusCodeData = (logs: Log[]) => {
  // Group logs by minute and count status codes
  const groupedData: {
    [minute: string]: { "2xx": number; "4xx": number; "5xx": number };
  } = {};

  logs.forEach((log) => {
    const minute = roundToMinutes(new Date(log.timestamp)).toISOString();
    const statusCategory =
      log.status_code >= 200 && log.status_code < 300
        ? "2xx"
        : log.status_code >= 400 && log.status_code < 500
        ? "4xx"
        : log.status_code >= 500
        ? "5xx"
        : null;

    if (!statusCategory) return;

    if (!groupedData[minute]) {
      groupedData[minute] = { "2xx": 0, "4xx": 0, "5xx": 0 };
    }
    groupedData[minute][statusCategory]++;
  });

  const labels = Object.keys(groupedData);
  const data2xx = labels.map((minute) => {
    const total = Object.values(groupedData[minute]).reduce(
      (sum, count) => sum + count,
      0
    );
    return (groupedData[minute]["2xx"] / total) * 100;
  });
  const data4xx = labels.map((minute) => {
    const total = Object.values(groupedData[minute]).reduce(
      (sum, count) => sum + count,
      0
    );
    return (groupedData[minute]["4xx"] / total) * 100;
  });
  const data5xx = labels.map((minute) => {
    const total = Object.values(groupedData[minute]).reduce(
      (sum, count) => sum + count,
      0
    );
    return (groupedData[minute]["5xx"] / total) * 100;
  });

  // Set chart data
  return({
    labels,
    datasets: [
      {
        label: "2xx",
        data: data2xx,
        backgroundColor: "rgba(75,192,192,0.6)",
      },
      {
        label: "4xx",
        data: data4xx,
        backgroundColor: "rgba(255,206,86,0.6)",
      },
      {
        label: "5xx",
        data: data5xx,
        backgroundColor: "rgba(255,99,132,0.6)",
      },
    ],
  });
};

export const statusOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true, // Stack bars horizontally
    },
    y: {
      stacked: true, // Stack bars vertically
      beginAtZero: true,
      ticks: {
        callback: (value) => `${value}%`, // Show percentage labels
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => `${context.raw.toFixed(2)}%`,
      },
    },
  },
};

export const prepareRequestsPerMinuteChartData = (logs: Log[]) => {
  // Helper function to round timestamp to the nearest minute
  const roundToMinute = (date: Date) => {
    const ms = date.getTime();
    const roundedMs = Math.floor(ms / (1 * 60 * 1000)) * (1 * 60 * 1000);
    return new Date(roundedMs);
  };

  // Group logs by minute
  const groupedData: { [minute: string]: number } = {};

  logs.forEach((log) => {
    const minute = roundToMinute(new Date(log.timestamp)).toISOString();
    if (!groupedData[minute]) {
      groupedData[minute] = 0;
    }
    groupedData[minute]++;
  });

  // Prepare chart data
  const timestamps = Object.keys(groupedData);
  const requestCounts = timestamps.map((timestamp) => groupedData[timestamp]);

  return {
    labels: timestamps,
    datasets: [
      {
        label: "Requests Per Minute",
        data: requestCounts,
        borderColor: "rgba(54,162,235,1)",
        backgroundColor: "rgba(54,162,235,0.2)",
        fill: true,
      },
    ],
  };
};

