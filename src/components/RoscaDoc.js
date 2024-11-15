import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, serverTimestamp } from '../config/firebase';
import CustomModal from './CustomModal';
import { UserPlus, PlusCircle, Settings, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import RoscaPayement from './RoscaPayment';
const RoscaDocument = () => {
    const { roscaId } = useParams();
    const [roscaDetails, setRoscaDetails] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // Form states
    const [newParticipant, setNewParticipant] = useState({
        name: '',
        phone: ''
    });

    const [newPayment, setNewPayment] = useState({
        amount: '',
        participantId: '',
        paymentDate: new Date().toISOString().split('T')[0]
    });

    const [settings, setSettings] = useState({
        frequency: 'monthly',
        monthlyAmount: '',
        paymentDay: '1',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        targetAmount: ''
    });

    useEffect(() => {
        const fetchRoscaData = async () => {
            try {
                // Fetch ROSCA details
                const roscaDoc = await getDoc(doc(db, 'roscas', roscaId));
                if (roscaDoc.exists()) {
                    setRoscaDetails({ id: roscaDoc.id, ...roscaDoc.data() });
                    setSettings(roscaDoc.data().settings || settings);
                }

                // Fetch participants
                const participantsQuery = query(
                    collection(db, 'participants'),
                    where('roscaId', '==', roscaId)
                );
                const participantsSnapshot = await getDocs(participantsQuery);
                setParticipants(
                    participantsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                );

                // Fetch payments
                const paymentsQuery = query(
                    collection(db, 'payments'),
                    where('roscaId', '==', roscaId)
                );
                const paymentsSnapshot = await getDocs(paymentsQuery);
                setPayments(
                    paymentsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                );
            } catch (error) {
                console.error('Error fetching ROSCA data:', error);
            }
        };

        fetchRoscaData();
    }, [roscaId]);

    const handleAddParticipant = async () => {
        try {
            const docRef = await addDoc(collection(db, 'participants'), {
                ...newParticipant,
                roscaId,
                createdAt: serverTimestamp()
            });

            setParticipants(prev => [...prev, {
                id: docRef.id,
                ...newParticipant,
                createdAt: new Date()
            }]);

            setIsAddParticipantModalOpen(false);
            setNewParticipant({ name: '', phone: '' });
        } catch (error) {
            console.error('Error adding participant:', error);
        }
    };

    const handleAddPayment = async () => {
        try {
            const docRef = await addDoc(collection(db, 'payments'), {
                ...newPayment,
                roscaId,
                createdAt: serverTimestamp()
            });

            setPayments(prev => [...prev, {
                id: docRef.id,
                ...newPayment,
                createdAt: new Date()
            }]);

            setIsAddPaymentModalOpen(false);
            setNewPayment({
                amount: '',
                participantId: '',
                paymentDate: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Error adding payment:', error);
        }
    };

    const handleUpdateSettings = async () => {
        try {
            await updateDoc(doc(db, 'roscas', roscaId), { settings });

            // Explicitly update the state to reflect changes
            setSettings((prev) => ({ ...prev }));

            // Close the modal after successful update
            setIsSettingsModalOpen(false);
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };


    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const targetAmount = Number(settings.targetAmount) || 0;
    const progress = targetAmount > 0 ? (totalAmount / targetAmount) * 100 : 0;

    // Header Section
    const Header = () => (
        <div className="flex justify-between items-center mb-8" dir='rtl'>
            <div className="flex gap-4">
                <button
                    onClick={() => setIsAddParticipantModalOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <UserPlus size={20} />
                    <span>إضافة مشارك</span>
                </button>
                <button
                    onClick={() => setIsAddPaymentModalOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <PlusCircle size={20} />
                    <span>إضافة دفعة</span>
                </button>
                <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                    <Settings size={20} />
                    <span>الإعدادات</span>
                </button>
            </div>
            <h1 className="text-2xl font-bold">{roscaDetails?.name}</h1>
        </div>
    );

    // Progress Circle Component
    const ProgressCircle = () => (
        <div className="bg-white p-6 rounded-lg shadow-sm" dir='rtl'>
            <h2 className="text-xl font-semibold mb-4">إجمالي المبلغ المجموع</h2>
            <div className="flex flex-col items-center">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                            className="text-gray-200 stroke-current"
                            strokeWidth="10"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                        />
                        <circle
                            className="text-green-500 stroke-current"
                            strokeWidth="10"
                            strokeLinecap="round"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{totalAmount}</span>
                        {targetAmount > 0 && (
                            <span className="text-sm text-gray-500">من {targetAmount}</span>
                        )}
                    </div>
                </div>
                {targetAmount > 0 && (
                    <div className="mt-4 text-center">
                        <span className="text-lg font-semibold">{progress.toFixed(1)}%</span>
                        <span className="text-gray-500"> تم تحصيله</span>
                    </div>
                )}
            </div>
        </div>
    );

    // Settings Summary Component
    const SettingsSummary = () => (
        <div className="bg-white p-6 rounded-lg shadow-sm" dir='rtl'>
            <h2 className="text-xl font-semibold mb-4">معلومات الجمعية</h2>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Clock className="text-gray-500" size={20} />
                    <span>التكرار: {
                        settings.frequency === 'monthly' ? 'شهري' :
                            settings.frequency === 'weekly' ? 'أسبوعي' : 'سنوي'
                    }</span>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="text-gray-500" size={20} />
                    <span>المبلغ الشهري من كل شخص: {settings.monthlyAmount || 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="text-gray-500" size={20} />
                    <span>المبلغ المستهدف: {settings.targetAmount || 'غير محدد'}</span>
                </div>
                {settings.frequency === 'monthly' && (
                    <div className="flex items-center gap-2">
                        <Calendar className="text-gray-500" size={20} />
                        <span>يوم الدفع: {settings.paymentDay} من كل شهر</span>
                    </div>
                )}
                {settings.endDate && (
                    <div className="flex items-center gap-2">
                        <Calendar className="text-gray-500" size={20} />
                        <span>تاريخ انتهاء الجمعية: {new Date(settings.endDate).toLocaleDateString('ar')}</span>
                    </div>
                )}
            </div>
        </div>
    );

    // Recent Payments Component
    const RecentPayments = () => (
        <div className="bg-white p-6 rounded-lg shadow-sm" dir='rtl'>
            <h2 className="text-xl font-semibold mb-4">آخر المدفوعات</h2>
            <div className="space-y-4">
                {payments.slice(-5).map(payment => {
                    const participant = participants.find(p => p.id === payment.participantId);
                    return (
                        <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{payment.amount}</span>
                            <span>{participant?.name}</span>
                            <span className="text-gray-500">{new Date(payment.paymentDate).toLocaleDateString('ar')}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Participants List Component
    const ParticipantsList = () => (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">المشاركون</h2>
                <div className="flex items-center gap-2">
                    <Users size={20} className="text-gray-500" />
                    <span className="text-gray-500">{participants.length}</span>
                </div>
            </div>
            <div className="space-y-2">
                {participants.map(participant => (
                    <div key={participant.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{participant.name}</span>
                        <span className="text-gray-500 text-sm">{participant.phone}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // Settings Modal Content
    const SettingsModalContent = () => (
        <div className="space-y-4" dir="rtl">
            <h2 className="text-xl font-semibold">إعدادات الجمعية</h2>

            <div className="space-y-2">
                <label className="block text-sm text-gray-600">نوع التكرار</label>
                <select
                    value={settings.frequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="monthly">شهري</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="yearly">سنوي</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-gray-600">
                    {settings.frequency === 'monthly' ? 'المبلغ المطلوب شهريًا من كل شخص' :
                        settings.frequency === 'weekly' ? 'المبلغ المطلوب أسبوعياً' :
                            'المبلغ المطلوب سنوياً'}
                </label>
                <input
                    type="number"
                    value={settings.monthlyAmount}
                    onChange={(e) =>
                        setSettings(prev => ({
                            ...prev,
                            monthlyAmount: Number(e.target.value) || ''
                        }))
                    }
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ادخل المبلغ (اختياري)"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm text-gray-600">المبلغ المستهدف (الإجمالي)</label>
                <input
                    type="number"
                    value={settings.targetAmount}
                    onChange={(e) =>
                        setSettings(prev => ({
                            ...prev,
                            targetAmount: Number(e.target.value) || ''
                        }))
                    }
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="المبلغ المستهدف الكلي (اختياري)"
                />
            </div>


            {settings.frequency === 'monthly' && (
                <div className="space-y-2">
                    <label className="block text-sm text-gray-600">يوم الدفع الشهري</label>
                    <select
                        value={settings.paymentDay}
                        onChange={(e) => setSettings(prev => ({ ...prev, paymentDay: e.target.value }))}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[...Array(28)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1} من كل شهر
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="space-y-2">
                <label className="block text-sm text-gray-600">تاريخ انتهاء الدورة</label>
                <input
                    type="date"
                    value={settings.endDate}
                    onChange={(e) => setSettings(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="تاريخ الانتهاء (اختياري)"
                />
            </div>

            <div className="text-sm text-gray-500 mt-4">
                * جميع الحقول اختيارية
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Header />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProgressCircle />
                <SettingsSummary />
                <RecentPayments />
                <ParticipantsList />
            </div>

            {/* Add Participant Modal */}
            <CustomModal
                isOpen={isAddParticipantModalOpen}
                onClose={() => setIsAddParticipantModalOpen(false)}
                onSubmit={handleAddParticipant}
            >
                <div className="space-y-4" dir="rtl">
                    <h2 className="text-xl font-semibold">إضافة مشارك جديد</h2>
                    <input
                        type="text"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="الاسم"
                    />
                    <input
                        type="tel"
                        value={newParticipant.phone}
                        onChange={(e) => setNewParticipant(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="رقم الهاتف"
                    />
                </div>
            </CustomModal>

            {/* Add Payment Modal */}
            <CustomModal
                isOpen={isAddPaymentModalOpen}
                onClose={() => setIsAddPaymentModalOpen(false)}
                onSubmit={handleAddPayment}
            >
                <div className="space-y-4" dir="rtl">
                    <h2 className="text-xl font-semibold">إضافة دفعة جديدة</h2>
                    <select
                        value={newPayment.participantId}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, participantId: e.target.value }))}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">اختر المشارك</option>
                        {participants.map(participant => (
                            <option key={participant.id} value={participant.id}>
                                {participant.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="المبلغ"
                    />
                    <input
                        type="date"
                        value={newPayment.paymentDate}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, paymentDate: e.target.value }))}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </CustomModal>

            {/* Settings Modal */}
            <CustomModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSubmit={handleUpdateSettings}
            >
                <SettingsModalContent />
            </CustomModal>
            <div className="mt-8">
                < RoscaPayement
                    participants={participants}
                    payments={payments}
                    settings={settings}
                    roscaId={roscaId}  // Add this prop
                />            </div>
        </div>
    );
};

export default RoscaDocument;