import React from 'react';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Worth</h3>
        <p className="text-3xl font-bold text-green-600">$0</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Income</h3>
        <p className="text-3xl font-bold text-blue-600">$0</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Expenses</h3>
        <p className="text-3xl font-bold text-red-600">$0</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash Flow</h3>
        <p className="text-3xl font-bold text-gray-600">$0</p>
      </div>
    </div>
  );
};

export default Dashboard;