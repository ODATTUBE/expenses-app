import React, { useState, useEffect } from 'react';
import { db, addDoc, updateDoc, deleteDoc, collection, doc, getDocs, query, where, serverTimestamp } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import CustomModal from './CustomModal';
import { Pencil, Trash2, Plus, FileText } from 'lucide-react';

const RoscaManager = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [roscas, setRoscas] = useState([]);
  const [newRoscaName, setNewRoscaName] = useState('');
  const [editRoscaName, setEditRoscaName] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoscaId, setSelectedRoscaId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchRoscas = async () => {
      try {
        const roscaQuery = query(
          collection(db, 'roscas'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(roscaQuery);
        const fetchedRoscas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoscas(fetchedRoscas);
      } catch (error) {
        console.error('Error fetching ROSCAs:', error);
      }
    };

    fetchRoscas();
  }, [currentUser, navigate]);

  const handleAddRosca = async () => {
    if (!newRoscaName.trim()) {
      alert('الرجاء إدخال اسم للجمعية');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'roscas'), {
        name: newRoscaName,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setRoscas(prevRoscas => [...prevRoscas, { id: docRef.id, name: newRoscaName, createdAt: new Date() }]);
      setNewRoscaName('');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding ROSCA:', error);
      alert('فشل في إضافة الجمعية. حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRosca = async () => {
    if (!editRoscaName.trim()) return;

    try {
      const roscaDoc = doc(db, 'roscas', selectedRoscaId);
      await updateDoc(roscaDoc, { name: editRoscaName });
      setRoscas(prevRoscas =>
        prevRoscas.map(rosca => (rosca.id === selectedRoscaId ? { ...rosca, name: editRoscaName } : rosca))
      );
      setIsEditModalOpen(false);
      alert('تم تحديث الجمعية بنجاح!');
    } catch (error) {
      console.error('Error updating ROSCA:', error);
      alert('فشل في تحديث الجمعية');
    }
  };

  const openEditModal = (roscaId, currentName) => {
    setSelectedRoscaId(roscaId);
    setEditRoscaName(currentName);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (roscaId) => {
    setSelectedRoscaId(roscaId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRosca = async () => {
    try {
      await deleteDoc(doc(db, 'roscas', selectedRoscaId));
      setRoscas(prevRoscas => prevRoscas.filter(rosca => rosca.id !== selectedRoscaId));
      setIsDeleteModalOpen(false);
      alert('تم حذف الجمعية بنجاح!');
    } catch (error) {
      console.error('Error deleting ROSCA:', error);
      alert('فشل في حذف الجمعية');
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-row-reverse min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 py-2 px-6 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-150"
              dir="rtl"
            >
              <Plus size={20} />
              <span>إضافة جمعية جديدة</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">إدارة الجمعيات</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            {roscas.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                لا توجد جمعيات حالياً. أضف جمعية جديدة للبدء.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {roscas.map(rosca => (
                  <li key={rosca.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <button
                          onClick={() => openDeleteModal(rosca.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => openEditModal(rosca.id, rosca.name)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/rosca/${rosca.id}`)}
                          className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                      <div className="text-right">
                        <h3 className="font-semibold text-gray-900">{rosca.name}</h3>
                        <p className="text-sm text-gray-500">
                          <span>تاريخ الإنشاء:</span> {formatDateTime(rosca.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <CustomModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddRosca}
          >
            <div dir="rtl">
              <h2 className="text-xl font-semibold mb-4">إضافة جمعية جديدة</h2>
              <input
                type="text"
                value={newRoscaName}
                onChange={(e) => setNewRoscaName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="اسم الجمعية"
                dir="rtl"
              />
            </div>
          </CustomModal>

          <CustomModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditRosca}
          >
            <div dir="rtl">
              <h2 className="text-xl font-semibold mb-4">تعديل الجمعية</h2>
              <input
                type="text"
                value={editRoscaName}
                onChange={(e) => setEditRoscaName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اسم الجمعية الجديد"
                dir="rtl"
              />
            </div>
          </CustomModal>

          <CustomModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onSubmit={handleDeleteRosca}
          >
            <div dir="rtl" className="text-center">
              <h2 className="text-lg font-semibold mb-2">تأكيد الحذف</h2>
              <p className="text-gray-700">هل أنت متأكد أنك تريد حذف هذه الجمعية؟</p>
            </div>
          </CustomModal>
        </div>
      </div>
    </div>
  );
};

export default RoscaManager;
