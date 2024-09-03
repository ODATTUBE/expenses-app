import React, { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc, getDocs, collection, addDoc } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Select from 'react-select';
import CustomModal from './CustomModal';

const EditExpense = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // Extracting the id from the URL
    const [expense, setExpense] = useState(null);
    const [expenseItems, setExpenseItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cost, setCost] = useState('');
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');

    useEffect(() => {
        const fetchExpenseDetails = async () => {
            if (!id) {
                console.error('Expense ID is required');
                return;
            }

            try {
                const expenseDocRef = doc(db, 'expenses', id);
                const expenseDoc = await getDoc(expenseDocRef);

                if (expenseDoc.exists()) {
                    const expenseData = { id: expenseDoc.id, ...expenseDoc.data() };
                    setExpense(expenseData);
                    setCost(expenseData.cost);
                    setDate(expenseData.date.toISOString().split('T')[0]);
                    setNote(expenseData.note);
                    setSelectedItem({ label: expenseData.title, value: expenseData.itemId });
                } else {
                    console.error('No such document!');
                }
            } catch (error) {
                console.error('Error fetching expense:', error);
            }
        };

        const fetchExpenseItems = async () => {
            const querySnapshot = await getDocs(collection(db, 'expenseItems'));
            const items = querySnapshot.docs.map(doc => ({
                label: doc.data().title,
                value: doc.id,
            }));
            setExpenseItems(items);
        };

        fetchExpenseDetails();
        fetchExpenseItems();
    }, [id]);

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
            alert('You must be logged in to edit an expense.');
            navigate('/login');
            return;
        }

        if (!selectedItem || cost.trim() === '' || date.trim() === '') {
            alert('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const expenseRef = doc(db, 'expenses', id);
            await updateDoc(expenseRef, {
                title: selectedItem.label,
                cost: parseFloat(cost),
                date: new Date(date),
                note,
                itemId: selectedItem.value,
            });

            alert('Expense updated successfully!');
            navigate('/expenses');
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return <div>Please log in to edit expenses.</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-grow p-4" style={{ maxWidth: '26rem' }}>
                <h1 className="text-xl font-semibold">Edit Expense</h1>
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
                        className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-700 focus:outline-none focus:bg-blue-700 transition duration-150 ease-in-out"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Expense'}
                    </button>
                </form>
            </div>
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
