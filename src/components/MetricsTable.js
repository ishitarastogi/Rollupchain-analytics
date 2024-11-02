import React from "react";

const MetricsTable = () => {
  const data = [
    { metric: "Total Transactions", value: 600 },
    { metric: "30-Day Transaction Count", value: 41 },
    { metric: "Total Addresses", value: 1000 },
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.metric}</td>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MetricsTable;
