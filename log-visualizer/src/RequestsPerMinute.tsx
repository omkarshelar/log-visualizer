import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { prepareRequestsPerMinuteChartData } from "./utils";
import { Log } from "./types";
import 'chartjs-adapter-moment';

const RequestsPerMinuteChart: React.FC<{ logs: Log[] }> = ({ logs }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    console.log("Logs.length=", logs.length);
    if (logs?.length > 0) {
      const data = prepareRequestsPerMinuteChartData(logs);
      console.log("Setting data=", data);
      setChartData(data);
    }
  }, [logs]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        type: "time",
        time: {
          unit: "minute",
        },
      },
    },
  };

  if (!chartData || !chartData?.datasets?.length) {
    return <p>Loading chart...</p>;
  }

  return (
    <div style={{ width: "70%", height: "400px", marginBottom: '100px' }}>
      <h2>Requests Per Minute</h2>
      <Line id="reqpermin" data={chartData} options={options} />
    </div>
  );
};

export default RequestsPerMinuteChart;
