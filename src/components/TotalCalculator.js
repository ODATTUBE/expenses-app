import React from 'react';

const TotalCalculator = ({ expenses }) => {
  const total = expenses.reduce((acc, expense) => acc + expense.cost, 0);

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Total Amount</h3>
      <p className="text-lg text-gray-700 dark:text-gray-300">{total.toFixed(2)} USD</p>
    </div>
  );
};

export default TotalCalculator;
