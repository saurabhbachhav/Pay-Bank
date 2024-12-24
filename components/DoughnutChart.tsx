"use client";
import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  accounts?: any; // Adjust the type of `accounts` based on your use case.
}

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
  const data = {
    labels: ["Bank1", "Bank2", "Bank3"],
    datasets: [
      {
        label: "Banks",
        data: [1250, 2500, 3750],
        backgroundColor: ["#0747b6", "#2265d8", "#2f91fa"],
      },
    ],
  };

  return (
   
    <Doughnut data={data}
      options={{
        cutout: '60%',
        plugins: {
          legend: {
            display:false
          }
        }
    }}
    />
    

  );
};

export default DoughnutChart;
