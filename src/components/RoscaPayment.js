import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { AlertTriangle, Check, Calendar } from 'lucide-react';
import { db, addDoc, updateDoc, deleteDoc, collection, doc, getDocs, query, where, serverTimestamp } from '../config/firebase';

const ParticipantPaymentsDashboard = ({ participants, payments, settings, roscaId }) => {
  const [participantStats, setParticipantStats] = useState([]);
  const [turns, setTurns] = useState([]);
  const [isArrangingTurns, setIsArrangingTurns] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  useEffect(() => {
    calculateParticipantStats();
    fetchTurns();
  }, [participants, payments]);
  
  const calculateParticipantStats = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const stats = participants.map(participant => {
      const totalPayments = payments
        .filter(payment => payment.participantId === participant.id)
        .reduce((sum, payment) => sum + Number(payment.amount), 0);
        
      const monthlyPayments = payments
        .filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          return payment.participantId === participant.id &&
                 paymentDate.getMonth() === currentMonth &&
                 paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, payment) => sum + Number(payment.amount), 0);
        
      const isLate = settings.monthlyAmount && 
                    monthlyPayments < Number(settings.monthlyAmount) &&
                    currentDate.getDate() > Number(settings.paymentDay);
                    
      return {
        ...participant,
        totalPayments,
        monthlyPayments,
        isLate,
        contribution: totalPayments
      };
    });
    
    setParticipantStats(stats);
  };

  const fetchTurns = async () => {
    try {
      const turnsQuery = query(
        collection(db, 'turns'),
        where('roscaId', '==', roscaId)
      );
      const turnsSnapshot = await getDocs(turnsQuery);
      const turnsData = turnsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.order - b.order);
      
      setTurns(turnsData);
    } catch (error) {
      console.error('Error fetching turns:', error);
    }
  };
  
  const handleArrangeTurns = async () => {
    setIsLoading(true);
    try {
      if (isArrangingTurns) {
        // Save the current turn arrangement
        const batch = [];
        
        // First, delete existing turns
        const existingTurnsQuery = query(
          collection(db, 'turns'),
          where('roscaId', '==', roscaId)
        );
        const existingTurns = await getDocs(existingTurnsQuery);
        for (const doc of existingTurns.docs) {
          await deleteDoc(doc.ref);
        }
        
        // Then create new turns
        for (let i = 0; i < turns.length; i++) {
          const turnData = {
            roscaId,
            participantId: turns[i].participantId,
            order: i,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          await addDoc(collection(db, 'turns'), turnData);
        }
        
        // Update the ROSCA document to mark turns as arranged
        await updateDoc(doc(db, 'roscas', roscaId), {
          turnsArranged: true,
          lastTurnUpdate: serverTimestamp()
        });
      } else {
        // Initialize turns if they don't exist
        if (turns.length === 0) {
          const initialTurns = participants.map((participant, index) => ({
            participantId: participant.id,
            order: index,
            participant: participant // Include participant data for display
          }));
          setTurns(initialTurns);
        }
      }
      
      setIsArrangingTurns(!isArrangingTurns);
    } catch (error) {
      console.error('Error managing turns:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDragTurn = (dragIndex, dropIndex) => {
    const newTurns = [...turns];
    const [removed] = newTurns.splice(dragIndex, 1);
    newTurns.splice(dropIndex, 0, removed);
    setTurns(newTurns);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm" dir='rtl'>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">حالة المدفوعات والأدوار</h2>
        <button
          onClick={handleArrangeTurns}
          disabled={isLoading}
          className={`flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Calendar size={20} />
          <span>
            {isLoading ? 'جاري الحفظ...' : isArrangingTurns ? 'حفظ الأدوار' : 'ترتيب الأدوار'}
          </span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side: Payment status and turns */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-3">حالة المدفوعات</h3>
          
          {/* Late Payments Alert */}
          {participantStats.some(p => p.isLate) && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <div className="font-semibold text-amber-900">مدفوعات متأخرة</div>
                <div className="text-sm text-amber-700">
                  هناك مشاركون متأخرون عن السداد لهذا الشهر
                </div>
              </div>
            </div>
          )}
          
          {/* Participant Payment Status List */}
          <div className="space-y-3">
            {participantStats.map((participant) => (
              <div
                key={participant.id}
                className={`p-4 rounded-lg border ${
                  participant.isLate ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{participant.name}</span>
                  {participant.isLate ? (
                    <AlertTriangle className="text-red-500" size={20} />
                  ) : (
                    <Check className="text-green-500" size={20} />
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div>المدفوع هذا الشهر: {participant.monthlyPayments}</div>
                  <div>إجمالي المدفوعات: {participant.totalPayments}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right side: Contribution visualization */}
        <div dir='ltr'> 
          <h3 className="text-lg font-medium mb-3">نسب المساهمة</h3>
          <div className="flex justify-center">
            <PieChart width={300} height={300}>
              <Pie
                data={participantStats}
                dataKey="contribution"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {participantStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
      
      {/* Turns Management */}
      {isArrangingTurns && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">ترتيب الأدوار</h3>
          <div className="space-y-2">
            {turns.map((turn, index) => {
              const participant = participants.find(p => p.id === turn.participantId) || turn.participant;
              return (
                <div
                  key={turn.id || index}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dragIndex = Number(e.dataTransfer.getData('text/plain'));
                    handleDragTurn(dragIndex, index);
                  }}
                  className="p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span>{participant?.name}</span>
                    <span className="text-gray-500">الدور #{index + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantPaymentsDashboard;