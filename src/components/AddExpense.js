import React, { useState, useEffect } from 'react';
import { db, addDoc, collection, getDocs } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Select from 'react-select';
import CustomModal from './CustomModal';

const AddExpense = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [expenseItems, setExpenseItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchExpenseItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'expenseItems'));
      const items = querySnapshot.docs.map(doc => ({
        label: doc.data().title,
        value: doc.id
      }));
      setExpenseItems(items);
    };

    fetchExpenseItems();
  }, [currentUser, navigate]);

  const handleAddItem = async () => {
    if (!currentUser) {
      alert('You must be logged in to add an expense item.');
      navigate('/login');
      return;
    }

    if (!newItemTitle.trim()) {
      alert('Please enter a title for the new item.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'expenseItems'), {
        title: newItemTitle,
        userId: currentUser.uid,
      });
      const newItem = { label: newItemTitle, value: docRef.id };
      setExpenseItems([...expenseItems, newItem]);
      setSelectedItem(newItem);
      setNewItemTitle('');
      setModalIsOpen(false);
    } catch (error) {
      console.error('Error adding expense item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('You must be logged in to add an expense.');
      navigate('/login');
      return;
    }

    if (!selectedItem || cost.trim() === '' || date.trim() === '') {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'expenses'), {
        userId: currentUser.uid,
        title: selectedItem.label,
        cost: parseFloat(cost),
        date: new Date(date),
        note,
        itemId: selectedItem.value,
      });

      setSelectedItem(null);
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

  if (!currentUser) {
    return <div>Please log in to add expenses.</div>;
  }

  return (
    <div className="flex justify-center items-center">
      <Sidebar />
      <div className="p-4" style={{ maxWidth: '26rem' }}>
        <h1 className="text-xl font-semibold">Add Expense</h1>
        <form onSubmit={handleSubmit} className="mt-4">
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
          <button
            type="submit"
            className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-700 focus:outline-none focus:bg-blue-700 transition duration-150"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>

        <CustomModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          onSubmit={handleAddItem}
        >
          <h2 className="text-lg font-semibold mb-4">Add New Expense Item</h2>
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
            placeholder="Enter item title"
          />
        </CustomModal>
      </div>
    </div>
  );
};

export default AddExpense;