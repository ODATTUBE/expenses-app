import React, { useState } from 'react';
import { db, addDoc, collection } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

const AddExpense = () => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() === '' || cost.trim() === '' || date.trim() === '') {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // Ensure the current user is logged in
      if (!currentUser) {
        alert('You must be logged in to add an expense.');
        setLoading(false);
        return;
      }

      // Add the expense with the user's ID
      await addDoc(collection(db, 'expenses'), {
        userId: currentUser.uid, // Associate the expense with the logged-in user's ID
        title,
        cost: parseFloat(cost),
        date: new Date(date),
        note,
        id: Date.now().toString(),
      });

      setTitle('');
      setCost('');
      setDate('');
      setNote('');
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center" >
      <Sidebar />
      <div className="p-4" style={{ maxWidth: '26rem' }}>

        <h1 className="text-xl font-semibold">Add Expense</h1>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Cost</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows="3"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-black dark:bg-gray-600 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:bg-blue-700 dark:focus:bg-blue-600 transition duration-150"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>

  );
};

export default AddExpense;
