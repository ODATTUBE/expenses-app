import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from '../config/firebase'; 
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import { Pencil, Trash2 } from 'lucide-react';

const Lend = () => {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState([]);
  const [beneficiary, setBeneficiary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loanValue, setLoanValue] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState(null); // Track which loan is being edited

  useEffect(() => {
    const fetchLoans = async () => {
      if (!currentUser) return;

      try {
        const loansCollection = collection(db, 'loans');
        const q = query(loansCollection, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const loansData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate.toDate(),
          endDate: doc.data().endDate.toDate(),
        }));
        setLoans(loansData);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    fetchLoans();
  }, [currentUser]);

  const handleAddLoan = async (e) => {
    e.preventDefault();

    if (!beneficiary || !startDate || !endDate || !status || !loanAmount) {
      alert('يرجى تعبئة جميع الحقول');
      return;
    }

    setLoading(true);

    try {
      const newLoan = {
        beneficiary,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        loanAmount,
        userId: currentUser.uid,
      };

      await addDoc(collection(db, 'loans'), newLoan);

      setLoans((prevLoans) => [...prevLoans, { ...newLoan, id: Date.now().toString() }]);
      setBeneficiary('');
      setStartDate('');
      setEndDate('');
      setLoanAmount('');
      setStatus('pending');
    } catch (error) {
      console.error('Error adding loan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoan = async (id) => {
    const confirmDelete = window.confirm('هل أنت متأكد من حذف هذا القرض؟');
    if (!confirmDelete) return;

    try {
      const loanDocRef = doc(db, 'loans', id);
      await deleteDoc(loanDocRef);
      const updatedLoans = loans.filter((loan) => loan.id !== id);
      setLoans(updatedLoans);
      alert('تم حذف القرض بنجاح');
    } catch (error) {
      console.error('Error deleting loan: ', error);
      alert('حدث خطأ أثناء حذف القرض');
    }
  };

  const handleEditLoan = (id) => {
    const loanToEdit = loans.find((loan) => loan.id === id);
    setBeneficiary(loanToEdit.beneficiary);
    setStartDate(loanToEdit.startDate.toISOString().split('T')[0]);
    setEndDate(loanToEdit.endDate.toISOString().split('T')[0]);
    setLoanAmount(loanToEdit.loanAmount);
    setStatus(loanToEdit.status);
    setEditingLoanId(id); // Set the loan id being edited
  };

  const handleUpdateLoan = async (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page

    if (!editingLoanId) return;

    try {
      const loanDocRef = doc(db, 'loans', editingLoanId);
      await updateDoc(loanDocRef, {
        beneficiary,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        loanAmount,
        status,
      });

      const updatedLoans = loans.map((loan) =>
        loan.id === editingLoanId ? { ...loan, beneficiary, startDate: new Date(startDate), endDate: new Date(endDate), loanAmount, status } : loan
      );
      setLoans(updatedLoans);
      setEditingLoanId(null); // Reset the editing state
      setBeneficiary('');
      setStartDate('');
      setEndDate('');
      setLoanAmount('');
      setStatus('pending');
      alert('تم تحديث القرض بنجاح');
    } catch (error) {
      console.error('Error updating loan:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'مدفوع':
        return 'bg-green-200 text-green-800';
      case 'بالانتظار':
        return 'bg-yellow-200 text-yellow-800';
      case 'متأخر':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-grow lg:mr-64" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 p-6 border-b border-gray-200 dark:border-gray-700">قائمة القروض</h2>

            <form onSubmit={editingLoanId ? handleUpdateLoan : handleAddLoan} className="px-6 py-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المستفيد</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ البداية</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="مدفوع">مدفوع</option>
                  <option value="متأخر">متأخر</option>
                  <option value="بالانتظار">بالانتظار</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قيمة القرض</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="قيمة القرض"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${editingLoanId ? 'bg-gray-700 hover:bg-gray-500' : 'bg-black hover:bg-gray-700'}`}
                disabled={loading}
              >
                {loading ? 'جاري المعالجة...' : editingLoanId ? 'تحديث القرض' : 'إضافة قرض'}
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستفيد</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البداية</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{loan.beneficiary}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{loan.startDate.toISOString().split('T')[0]}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{loan.endDate.toISOString().split('T')[0]}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 flex space-x-2">
                        <button onClick={() => handleEditLoan(loan.id)} className="text-gray-400 hover:text-blue-500">
                          <Pencil size={20} />
                        </button>
                        <button onClick={() => handleDeleteLoan(loan.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={20} />
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

export default Lend;
