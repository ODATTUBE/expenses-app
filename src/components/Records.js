import React, { useState, useEffect } from 'react';
import { db, getDocs, query, where, orderBy, getDoc, collection, addDoc } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import { Pencil, Trash2 } from 'lucide-react';
import EditExpense from './EditExpense'; // Import the EditExpense component

const Record = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [editingExpense, setEditingExpense] = useState(null); // State to manage the expense being edited

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const expensesCollection = collection(db, 'expenses');
        const q = query(
          expensesCollection,
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const expensesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        }));
        setExpenses(expensesData);
        setFilteredExpenses(expensesData);
        calculateTotal(expensesData);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [currentUser]);

  useEffect(() => {
    filterExpenses();
  }, [startDate, endDate, expenses]);

  const filterExpenses = () => {
    let filtered = expenses;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set to end of day
      filtered = expenses.filter(expense => 
        expense.date >= start && expense.date <= end
      );
    }
    setFilteredExpenses(filtered);
    calculateTotal(filtered);
  };

  const calculateTotal = (expensesToSum) => {
    const sum = expensesToSum.reduce((acc, expense) => acc + expense.cost, 0);
    setTotal(sum);
  };

  const handleEdit = (id) => {
    const expenseToEdit = expenses.find(expense => expense.id === id);
    setEditingExpense(expenseToEdit);
  };

  const handleDelete = (id) => {
    console.log('Delete expense with id:', id);
  };

  const handleSave = (updatedExpense) => {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    setFilteredExpenses((prevFilteredExpenses) =>
      prevFilteredExpenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    setEditingExpense(null); // Close the edit form
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-grow lg:mr-64 rtl" style={{ direction: 'rtl' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {editingExpense ? (
            <EditExpense
              expense={editingExpense}
              onSave={handleSave}
              onCancel={() => setEditingExpense(null)}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 p-6">سجل المصروفات</h2>
              <div className="px-6 pb-4 flex justify-between items-center">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <label htmlFor="start-date" className="text-gray-600 dark:text-gray-400">من:</label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <label htmlFor="end-date" className="text-gray-600 dark:text-gray-400">إلى:</label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>
              </div>
              <div className="px-6 pb-4">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  إجمالي المصروفات: {total.toFixed(2)}
                </p>
              </div>
              {loading ? (
                <p className="text-gray-600 dark:text-gray-400 px-6 pb-6">جاري التحميل...</p>
              ) : filteredExpenses.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 px-6 pb-6">لم يتم العثور على مصروفات.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-700">
                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-200">العنوان</th>
                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-200">التكلفة</th>
                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-200">التاريخ</th>
                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-200">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="border-b dark:border-gray-700">
                          <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">{expense.title}</td>
                          <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">{expense.cost.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">
                            {expense.date.toLocaleDateString('en-ae', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">
                            <button
                              onClick={() => handleEdit(expense.id)}
                              className="m-2 text-gray-500 hover:text-blue-700"
                              aria-label="تعديل"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="حذف"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Sidebar />
    </div>
  );
};

export default Record;
