import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, getDocs, query, where } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import {Pencil, Trash2} from 'lucide-react';

const Shares = () => {
    const { currentUser } = useAuth();
    const [shares, setShares] = useState([]);
    const [date, setDate] = useState('');
    const [company, setCompany] = useState('');
    const [numberOfShares, setNumberOfShares] = useState('');
    const [sharePrice, setSharePrice] = useState('');
    const [comission, setComission] = useState('');
    const [broker, setBroker] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchShares = async () => {
            if (!currentUser) return;

            try {
                const sharesCollection = collection(db, 'shares');
                const q = query(sharesCollection, where('userId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                const sharesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date.toDate(),
                }));
                setShares(sharesData);
            } catch (error) {
                console.error('Error fetching shares:', error);
            }
        };

        fetchShares();
    }, [currentUser]);

    const handleAddShare = async (e) => {
        e.preventDefault();

        if (!date || !company || !numberOfShares || !sharePrice || !broker || !comission) {
            alert('يرجى تعبئة جميع الحقول');
            return;
        }

        setLoading(true);

        try {
            const totalPrice = Number(numberOfShares) * Number(sharePrice);
            const newShare = {
                date: new Date(date),
                company,
                numberOfShares: Number(numberOfShares),
                sharePrice: Number(sharePrice),
                totalPrice,
                comission: Number(comission),
                broker,
                userId: currentUser.uid,
            };

            await addDoc(collection(db, 'shares'), newShare);

            setShares(prevShares => [...prevShares, { ...newShare, id: Date.now().toString() }]);
            setDate('');
            setCompany('');
            setNumberOfShares('');
            setSharePrice('');
            setComission('');
            setBroker('');
        } catch (error) {
            console.error('Error adding share:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteShare = (id) => {
        const confirmDelete = window.confirm('هل أنت متأكد من حذف هذا السهم؟');
        if (!confirmDelete) return;

        const updatedShares = shares.filter(share => share.id !== id);
        setShares(updatedShares);
        // Here you would also delete the share from the database
    };

    const handleEditShare = (id) => {
        const shareToEdit = shares.find(share => share.id === id);
        setDate(shareToEdit.date.toISOString().split('T')[0]);
        setCompany(shareToEdit.company);
        setNumberOfShares(shareToEdit.numberOfShares.toString());
        setComission(shareToEdit.comission.toString());
        setSharePrice(shareToEdit.sharePrice.toString());
        setBroker(shareToEdit.broker);
        // Here you would implement the logic to update the share in the database
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 rtl" dir="rtl">
            <div className="flex-grow lg:mr-64">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 p-6 border-b border-gray-200 dark:border-gray-700">سجل شراء الأسهم</h2>

                        <form onSubmit={handleAddShare} className="px-6 py-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الشركة</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عدد الأسهم</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={numberOfShares}
                                    onChange={(e) => setNumberOfShares(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سعر السهم</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={sharePrice}
                                    onChange={(e) => setSharePrice(e.target.value)}
                                />
                            </div>
                            <div
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عمولة الشراء</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={comission}
                                    onChange={(e) => setComission(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوسيط</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={broker}
                                    onChange={(e) => setBroker(e.target.value)}
                                />
                            </div>


                            <button
                                type="submit"
                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                {loading ? 'جاري الإضافة...' : 'إضافة سهم'}
                            </button>
                        </form>

                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الشركة</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الأسهم</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر السهم</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر الإجمالي</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عمولة الشراء</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوسيط</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
                                    {shares.map((share) => (
                                        <tr key={share.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                {share.date.toLocaleDateString('en-jo', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{share.company}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{share.numberOfShares}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{share.sharePrice.toFixed(2)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{share.totalPrice.toFixed(2)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{share.comission.toFixed(2)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{share.broker}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleEditShare(share.id)} className="text-blue-600 hover:text-blue-900 mr-2">
                                                    <Pencil />
                                                </button>
                                                <button onClick={() => handleDeleteShare(share.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Sidebar />
        </div>
    );
};

export default Shares;