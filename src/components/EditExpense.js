import React, { useState, useEffect } from 'react';
import { db, doc, getDocs, updateDoc, collection, addDoc } from '../config/firebase';
import Select from 'react-select';
import CustomModal from './CustomModal';

const EditExpense = ({ expense, onSave, onCancel }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [expenseItems, setExpenseItems] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');

  useEffect(() => {
    // Pre-populate the form fields with the passed expense data
    if (expense) {
      setCost(expense.cost);
      setDate(expense.date.toISOString().split('T')[0]);
      setNote(expense.note);
      setSelectedItem({ label: expense.title, value: expense.itemId });
    }

    // Fetch available expense items from the database
    const fetchExpenseItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'expenseItems'));
        const items = querySnapshot.docs.map(doc => ({
          label: doc.data().title,
          value: doc.id,
        }));
        setExpenseItems(items);
      } catch (error) {
        console.error('Error fetching expense items:', error);
      }
    };

    fetchExpenseItems();
  }, [expense]);

  const handleAddItem = async () => {
    try {
      const docRef = await addDoc(collection(db, 'expenseItems'), {
        title: newItemTitle,
        userId: expense.userId,
      });
      const newItem = { label: newItemTitle, value: docRef.id };
      setExpenseItems([...expenseItems, newItem]);
      setSelectedItem(newItem);
      setNewItemTitle('');
      setModalIsOpen(false);
    } catch (error) {
      console.error('Error adding expense item:', error);
      alert('Failed to add new item.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem || cost.trim() === '' || date.trim() === '') {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const updatedExpense = {
        ...expense,
        title: selectedItem.label,
        cost: parseFloat(cost),
        date: new Date(date),
        note,
        itemId: selectedItem.value,
      };

      // Update the expense in the database
      const expenseRef = doc(db, 'expenses', expense.id);
      await updateDoc(expenseRef, updatedExpense);

      onSave(updatedExpense); // Pass the updated expense back to the parent component
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-expense-container">
      <h1 className="text-xl font-semibold mb-4">Edit Expense</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Expense Item</label>
          <Select
            value={selectedItem}
            onChange={setSelectedItem}
            options={expenseItems}
            isSearchable
            className="w-full mt-1"
          />
          <button
            type="button"
            onClick={() => setModalIsOpen(true)}
            className="mt-2 text-blue-500 underline"
          >
            Add New Item
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Cost</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
            rows="3"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            className="py-2 px-4 bg-black text-white rounded-md hover:bg-gray-700 focus:outline-none focus:bg-blue-700 transition duration-150 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Expense'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none transition duration-150 ease-in-out"
          >
            Cancel
          </button>
        </div>
      </form>

      <CustomModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        title="Add New Expense Item"
      >
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700">New Item Title</label>
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddItem}
              className="py-2 px-4 bg-black text-white rounded-md hover:bg-gray-700 focus:outline-none focus:bg-blue-700 transition duration-150 ease-in-out"
            >
              Add Item
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default EditExpense;
