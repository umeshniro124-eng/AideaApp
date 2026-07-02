import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { ComponentProps, useCallback, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface Category {
  name: string;
  icon: IoniconsName;
  color: string;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  date: string;
  category: string;
  amount: number;
  description: string;
}

interface AttendanceRecord {
  date: string;
  type: 'work' | 'leave';
}

export default function HomeScreen() {
  useFocusEffect(
  useCallback(() => {
    loadSavedData();
  }, [])
);

const [profile, setProfile] = useState({ name: '', email: '', phone: '' });

  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [selectedCategory, setSelectedCategory] = useState('Salary (වැටුප්)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [attendanceType, setAttendanceType] = useState<'work' | 'leave' | null>(null);
  
  
 // වත්මන් දිනය ලබා ගැනීමට අවශ්‍ය දත්ත
const now = new Date();
const day = now.getDate().toString();
const monthNames = ["01", "02", "03", "04", "05", "06", 
                    "07", "08", "09", "10", "11", "12"];
const month = monthNames[now.getMonth()];
const year = now.getFullYear().toString();
const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD ආකෘතිය

// අලුත් අගයන් සමඟ state සකස් කිරීම
const [attendanceDateModal, setAttendanceDateModal] = useState(false);
const [tempDay, setTempDay] = useState(day);
const [tempMonth, setTempMonth] = useState(month);
const [tempYear, setTempYear] = useState(year);
const [displayDate, setDisplayDate] = useState(formattedDate);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // මෙය ඔබේ අනෙකුත් useState වලට පහළින් එක් කරන්න
const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

const [monthModalVisible, setMonthModalVisible] = useState(false);

  useEffect(() => {
    loadSavedData();
  }, []);




  
 // 1. මෙම Hook එක Component එකේ ඉහළින්ම (Main Body එකේ) තබන්න
// const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

const loadSavedData = async () => {
    try {
      // Profile දත්ත ලබා ගැනීම
      const savedName = await AsyncStorage.getItem('@user_name');
      const savedEmail = await AsyncStorage.getItem('@user_email');
      const savedPhone = await AsyncStorage.getItem('@user_phone');
      setProfile({
        name: savedName || 'පරිශීලක',
        email: savedEmail || 'විද්‍යුත් තැපෑලක් නැත',
        phone: savedPhone || 'දුරකථන අංකයක් නැත'
      });

      // අනෙකුත් දත්ත
      const savedTransactions = await AsyncStorage.getItem('@my_transactions');
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

      const savedAttendance = await AsyncStorage.getItem('@my_attendance');
      if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));
      
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedData();
    }, [])
  );

const handleSaveTransaction = async () => {
  if (!amount || isNaN(Number(amount))) {
    Alert.alert('වැරදියි', 'කරුණාකර නිවැරදි මුදලක් ඇතුළත් කරන්න.');
    return;
  }

  const newTransaction: Transaction = {
    id: Date.now().toString(),
    type: transactionType,
    date: date,
    category: selectedCategory,
    amount: parseFloat(amount),
    description: description,
  };

  const updatedTransactions = [newTransaction, ...transactions];
  setTransactions(updatedTransactions);

  try {
    await AsyncStorage.setItem('@my_transactions', JSON.stringify(updatedTransactions));
    Alert.alert('සාර්ථකයි', 'Transaction එක සුරැකින ලදී!');
    
    setAmount('');
    setDescription('');
    setModalVisible(false);
  } catch (error) {
    Alert.alert('දෝෂයක්', 'සුරැකීමට නොහැකි විය.');
  }
};

// උදාහරණයක් ලෙස මාසයේ නම අංකයට හරවන ශ්‍රිතයක් (ඔබේ අවශ්‍යතාවය අනුව මෙය වෙනස් කරගන්න)
const getMonthNumber = (monthName: string) => {
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const index = months.indexOf(monthName) + 1;
  return index.toString().padStart(2, '0');
};

const handleSaveAttendance = async () => {
  if (!attendanceType) {
    Alert.alert('අවධානයට', 'කරුණාකර Work හෝ Leave තෝරන්න.');
    return;
  }
  
// නිවැරදි අගයන් භාවිතා කර දින ආකෘතිය සාදන්න
  const monthNum = getMonthNumber(tempMonth); 
  const formattedDate = `${tempYear}-${monthNum}-${tempDay.padStart(2, '0')}`;

  const newRecord: AttendanceRecord = {
    date: formattedDate,
    type: attendanceType,
  };

  try {
    const existingData = await AsyncStorage.getItem('@my_attendance');
    const currentRecords: AttendanceRecord[] = existingData ? JSON.parse(existingData) : [];

    const filteredRecords = currentRecords.filter((rec) => rec.date !== formattedDate);
    const updatedAttendance = [...filteredRecords, newRecord];

    await AsyncStorage.setItem('@my_attendance', JSON.stringify(updatedAttendance));
    setAttendanceRecords(updatedAttendance);
    
    Alert.alert('සාර්ථකයි', 'දත්ත සුරකින ලදී!');
  } catch (error) {
    Alert.alert('දෝෂයක්', 'Attendance සුරැකීමට නොහැකි විය.');
  }
};

const handleSaveDate = () => {
  setDisplayDate(`${tempDay} -${tempMonth} -${tempYear}`);
  setAttendanceDateModal(false);
};
  
  // Transaction එකක් දිගට ඔබාගෙන සිටියොත් (Long Press) Delete කරන්න අහන Function එක
  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      'මකා දැමීම',
      'මෙම ගනුදෙනුව ලැයිස්තුවෙන් ඉවත් කිරීමට ඔබට විශ්වාසද?',
      [
        { text: 'නැත', style: 'cancel' },
        {
          text: 'ඔව්',
          style: 'destructive',
          onPress: async () => {
            const filtered = transactions.filter(t => t.id !== id);
            setTransactions(filtered);
            await AsyncStorage.setItem('@my_transactions', JSON.stringify(filtered));
          }
        }
      ]
    );
  };

// 1. මාසය අනුව පෙරීම
const filteredTransactions = transactions.filter((t) => 
  t.date.startsWith(selectedMonth)
);

// 2. අලුත් අගයන් ගණනය කිරීම
const totalIncome = filteredTransactions
  .filter((t) => t.type === 'income')
  .reduce((sum, t) => sum + Number(t.amount), 0);

const totalExpense = filteredTransactions
  .filter((t) => t.type === 'expense')
  .reduce((sum, t) => sum + Number(t.amount), 0);

const totalBalance = totalIncome - totalExpense;

  const categories: Category[] = [
    { name: 'Food (කෑම)', icon: 'fast-food', color: '#ff9800' },
    { name: 'Salary (වැටුප්)', icon: 'cash', color: '#4caf50' },
    { name: 'Transport (ගමන්)', icon: 'bus', color: '#2196f3' },
    { name: 'Bills (බිල්පත්)', icon: 'receipt', color: '#e91e63' },
    { name: 'Other (වෙනත්)', icon: 'ellipsis-horizontal', color: '#9c27b0' },


    
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* ScrollView එකක් දැම්මා Screen එක scroll කරන්න පුළුවන් වෙන්න */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* 1. TOP PROFILE HEADER */}
        <View style={styles.profileHeader}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{profile.name.charAt(0) || 'U'}</Text></View>
            <View>
              <Text style={styles.welcomeText}>Welcome Back,</Text>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileName}>{profile.email}</Text>
              <Text style={styles.profileName}>{profile.phone}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notiButton}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* 2. TOTAL BALANCE CARD */}
        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={24} color="#2f5d98" />
            <Text style={styles.cardTitle}>Total Balance (මුළු ඉතිරිය)</Text>
          </View>
          <Text style={styles.balanceAmount}>Rs: {totalBalance.toFixed(2)}</Text>
        </View>

<TouchableOpacity onPress={() => setMonthModalVisible(true)}>
  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
    තෝරාගත් මාසය: {selectedMonth}
  </Text>
</TouchableOpacity>

        {/* 3. INCOME & EXPENSE BOXES */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, styles.incomeBox]}>
            <View style={styles.statHeader}>
              <Ionicons name="arrow-down-circle" size={18} color="#2e7d32" />
              <Text style={styles.statTitle}>Income</Text>
            </View>
            <Text style={styles.incomeAmount}>Rs: {totalIncome.toFixed(2)}</Text>
          </View>

          <View style={[styles.statBox, styles.expenseBox]}>
            <View style={styles.statHeader}>
              <Ionicons name="arrow-up-circle" size={18} color="#c62828" />
              <Text style={styles.statTitle}>Expense</Text>
            </View>
            <Text style={styles.expenseAmount}>Rs: {totalExpense.toFixed(2)}</Text>
          </View>
        </View>

        
        {/* 4. ATTENDANCE SECTION */}
        <View style={styles.attendanceContainer}>
          <TouchableOpacity 
            style={styles.attendanceTitleBar} 
            activeOpacity={0.7}
            onPress={() => setAttendanceDateModal(true)}
          >
            <Text style={styles.attendanceTitleText}>Attendance</Text>
            <View style={styles.attendanceDateBox}>
              <Ionicons name="calendar" size={18} color="#000" />
              <Text style={styles.attendanceDateText}>({displayDate})</Text>
            </View>
          </TouchableOpacity>

          

          <View style={styles.attendanceRow}>
            <TouchableOpacity 
              style={[styles.attendanceSelectBox, styles.workSelectColor, attendanceType === 'work' && styles.workActiveBorder]}
              onPress={() => setAttendanceType('work')}
            >
              <View style={[styles.customCheckbox, attendanceType === 'work' && styles.checkboxCheckedWork]}>
                {attendanceType === 'work' && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.attendanceSelectText}>Work</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.attendanceSelectBox, styles.leaveSelectColor, attendanceType === 'leave' && styles.leaveActiveBorder]}
              onPress={() => setAttendanceType('leave')}
            >
              <View style={[styles.customCheckbox, attendanceType === 'leave' && styles.checkboxCheckedLeave]}>
                {attendanceType === 'leave' && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.attendanceSelectText}>Leave</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAttendanceType(null)}>
              <Text style={styles.cancelBtnText}>අවලංගු කරන්න</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveAttendance}>
              <Text style={styles.submitBtnText}>ඇතුළත් කරන්න</Text>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* 5. FLOATING + BUTTON */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabButton} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={36} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* ================= CUSTOM ATTENDANCE DATE PICKER MODAL ================= */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={attendanceDateModal}
        onRequestClose={() => setAttendanceDateModal(false)}
      >
        <View style={styles.centerModalOverlay}>
          <View style={styles.centerModalContent}>
            <Text style={styles.centerModalTitle}>දිනය වෙනස් කරන්න</Text>
            
            <View style={styles.dateFormRow}>
              <View style={styles.dateInputBox}>
                <Text style={styles.dateLabel}>දිනය</Text>
                <TextInput style={styles.dateTextInput} value={tempDay} onChangeText={setTempDay} keyboardType="numeric" maxLength={2} />
              </View>

              <View style={styles.dateInputBox}>
                <Text style={styles.dateLabel}>මාසය</Text>
                <TextInput style={styles.dateTextInput} value={tempMonth} onChangeText={setTempMonth} />
              </View>

              <View style={styles.dateInputBox}>
                <Text style={styles.dateLabel}>වර්ෂය</Text>
                <TextInput style={styles.dateTextInput} value={tempYear} onChangeText={setTempYear} keyboardType="numeric" maxLength={4} />
              </View>
            </View>

            <View style={styles.dateModalActionRow}>
              <TouchableOpacity style={styles.dateCancelBtn} onPress={() => setAttendanceDateModal(false)}>
                <Text style={styles.dateCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateSaveBtn} onPress={handleSaveDate}>
                <Text style={styles.dateSaveBtnText}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= BOTTOM SHEET MODAL ================= */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Transaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, transactionType === 'income' && styles.activeIncomeBtn]}
                onPress={() => setTransactionType('income')}
              >
                <Text style={[styles.toggleText, transactionType === 'income' && styles.activeToggleText]}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, transactionType === 'expense' && styles.activeExpenseBtn]}
                onPress={() => setTransactionType('expense')}
              >
                <Text style={[styles.toggleText, transactionType === 'expense' && styles.activeToggleText]}>Expense</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Date (දිනය)</Text>
            <View style={styles.dateInputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput style={styles.dateInput} value={date} onChangeText={setDate} />
            </View>

            <Text style={styles.label}>Select Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.name && { backgroundColor: cat.color + '20', borderColor: cat.color, borderWidth: 1.5 }
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Ionicons name={cat.icon} size={18} color={cat.color} />
                  <Text style={[styles.categoryChipText, selectedCategory === cat.name && { fontWeight: 'bold', color: '#000' }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Amount (මුදල)</Text>
            <TextInput style={styles.input} placeholder="Rs: 0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />

            <Text style={styles.label}>Description (විස්තරය)</Text>
            <TextInput style={styles.input} placeholder="වැඩේ මොකක්ද..." value={description} onChangeText={setDescription} />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction}>
              <Text style={styles.saveButtonText}>Save (සුරකින්න)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
      <Modal visible={monthModalVisible} transparent={true} animationType="fade">
  <View style={styles.centerModalOverlay}>
    <View style={styles.centerModalContent}>
      <Text style={styles.centerModalTitle}>මාසය තෝරන්න (YYYY-MM)</Text>
      
      <TextInput 
        style={styles.dateTextInput} 
        value={selectedMonth} 
        onChangeText={setSelectedMonth} 
        placeholder="2026-06"
      />

      <TouchableOpacity 
        style={styles.dateSaveBtn} 
        onPress={() => setMonthModalVisible(false)}
      >
        <Text style={styles.dateSaveBtnText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a58e8e', paddingHorizontal: 20 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 15 },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#2f5d98', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  welcomeText: { fontSize: 12, color: '#666' },
  profileName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  notiButton: { padding: 8, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },

  balanceCard: { backgroundColor: '#e1eafd', borderRadius: 18, padding: 20, alignItems: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#444' },
  balanceAmount: { fontSize: 28, fontWeight: '900', color: '#2f5d98', marginTop: 8 },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 12 },
  statBox: { flex: 1, borderRadius: 15, padding: 15, borderWidth: 1 },
  incomeBox: { backgroundColor: '#e8f5e9', borderColor: '#c8e6c9' },
  expenseBox: { backgroundColor: '#ffebee', borderColor: '#ffcdd2' },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statTitle: { fontSize: 13, fontWeight: '600', color: '#444' },
  incomeAmount: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', marginTop: 6 },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#c62828', marginTop: 6 },

  // HISTORY SECTION STYLES
  historySection: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 10 },
  emptyText: { fontSize: 13, color: '#888', fontStyle: 'italic', paddingVertical: 10, textAlign: 'center' },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyIconBox: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  historyCategory: { fontSize: 14, fontWeight: '600', color: '#333' },
  historyDesc: { fontSize: 11, color: '#777', marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: 'bold' },
  historyDate: { fontSize: 10, color: '#aaa', marginTop: 2 },

  // ATTENDANCE STYLES
  attendanceContainer: { backgroundColor: '#ffffff', borderRadius: 18, padding: 15, marginTop: 15, borderWidth: 1, borderColor: '#eee', elevation: 1 },
  attendanceTitleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#40e0d0', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, marginBottom: 15 },
  attendanceTitleText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  attendanceDateBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  attendanceDateText: { fontSize: 13, fontWeight: '600', color: '#000' },
  attendanceRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  attendanceSelectBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  workSelectColor: { backgroundColor: '#2ecc71' },
  leaveSelectColor: { backgroundColor: '#e74c3c' },
  workActiveBorder: { borderColor: '#145a32' },
  leaveActiveBorder: { borderColor: '#641e16' },
  attendanceSelectText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  customCheckbox: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
  checkboxCheckedWork: { backgroundColor: '#145a32' },
  checkboxCheckedLeave: { backgroundColor: '#641e16' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#dcdde1', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: 'bold', color: '#2f3640' },
  submitBtn: { flex: 1, backgroundColor: '#057a05', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 8 },
  submitBtnText: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' },

  centerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  centerModalContent: { backgroundColor: '#fff', width: '85%', borderRadius: 20, padding: 20, elevation: 5 },
  centerModalTitle: { fontSize: 16, fontWeight: 'bold', color: '#2f5d98', marginBottom: 15, textAlign: 'center' },
  dateFormRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  dateInputBox: { flex: 1 },
  dateLabel: { fontSize: 11, color: '#666', marginBottom: 4, textAlign: 'center' },
  dateTextInput: { backgroundColor: '#f5f5f7', borderRadius: 8, padding: 10, fontSize: 14, textAlign: 'center', borderWidth: 1, borderColor: '#ddd', fontWeight: 'bold' },
  dateModalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  dateCancelBtn: { paddingVertical: 10, paddingHorizontal: 15 },
  dateCancelBtnText: { color: '#666', fontWeight: '600' },
  dateSaveBtn: { backgroundColor: '#2f5d98', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  dateSaveBtnText: { color: '#fff', fontWeight: 'bold' },

  fabContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  fabButton: { backgroundColor: '#fbc02d', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#dbdbdb', borderRadius: 2.5, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#f1f1f4', borderRadius: 12, padding: 4, marginBottom: 15 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeIncomeBtn: { backgroundColor: '#2e7d32' },
  activeExpenseBtn: { backgroundColor: '#c62828' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#666' },
  activeToggleText: { color: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#f5f5f7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 10 },
  dateInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f7', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 10 },
  inputIcon: { paddingLeft: 12 },
  dateInput: { flex: 1, paddingHorizontal: 10, paddingVertical: 10, fontSize: 15, color: '#333' },
  categoryScroll: { flexDirection: 'row', marginBottom: 10, paddingVertical: 5 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f5f5f7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  categoryChipText: { fontSize: 13, color: '#555' },
  saveButton: { backgroundColor: '#2f5d98', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 15 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});