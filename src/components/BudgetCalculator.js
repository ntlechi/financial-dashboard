import React from 'react';

const BudgetCalculator = () => {
  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Budget Calculator</h2>
        <p className="text-gray-600 mb-6">
          Use the 50/30/20 rule and 6 Jars system to manage your budget effectively.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">50/30/20 Rule</h3>
            <p className="text-gray-600 text-sm">50% Needs, 30% Wants, 20% Savings</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">6 Jars System</h3>
            <p className="text-gray-600 text-sm">Divide income into 6 categories</p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-500">
          Coming soon...
        </div>
      </div>
    </div>
  );
};

export default BudgetCalculator;