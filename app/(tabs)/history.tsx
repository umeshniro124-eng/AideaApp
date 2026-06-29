import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react'; // transactions state එකක් තිබේ නම්


interface Transaction {
  id: string;
  type: 'income' | 'expense';
  date: string;
  category: string;
  amount: number;
  description: string;
}

export default function HistoryScreen() {

useFocusEffect(
  useCallback(() => {
    // History තිරයට focus වූ වහාම දත්ත නැවත ලබාගන්න
    loadTransactions(); 
  }, [])
);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const isFocused = useIsFocused();

  // දින වකවානු තෝරන States (YYYY-MM-DD format එකෙන්)
  // Default විදිහට ජූනි මසේ 01 සිට 26 දක්වා දමා ඇත
  const [fromDate, setFromDate] = useState('2026-06-01');
  const [toDate, setToDate] = useState('2026-06-26');

  // Modal සඳහා States
  const [rangeModalVisible, setRangeModalVisible] = useState(false);

  // තාවකාලිකව දින ඇතුළත් කරන Text States
  const [tempFrom, setTempFrom] = useState('2026-06-01');
  const [tempTo, setTempTo] = useState('2026-06-26');

  useEffect(() => {
    if (isFocused) {
      loadTransactions();
    }
  }, [isFocused]);

  const loadTransactions = async () => {
    try {
      const savedTransactions = await AsyncStorage.getItem('@my_transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.log('History data load කිරීමට නොහැකි විය:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
  Alert.alert('මකා දැමීම', 'මෙම ගනුදෙනුව ඉවත් කිරීමට විශ්වාසද?', [
    { text: 'නැත', style: 'cancel' },
    {
      text: 'ඔව්',
      style: 'destructive',
      onPress: async () => {
        const filtered = transactions.filter(t => t.id !== id);
        // රාජ්‍යය යාවත්කාලීන කරන්න
        setTransactions(filtered);
        // Async Storage එක යාවත්කාලීන කරන්න
        await AsyncStorage.setItem('@my_transactions', JSON.stringify(filtered));
      }
    }
  ]);
};

  // තෝරාගත් දින වකවානුව (Date Range) ඇතුළත දත්ත Filter කිරීම
  const filteredTransactions = transactions.filter((t) => {
    return t.date >= fromDate && t.date <= toDate;
  });

  const incomeTransactions = filteredTransactions.filter((t) => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter((t) => t.type === 'expense');

  // දින Format එක ලස්සනට පෙන්වීමට (2026-06-01 -> 2026 ජූනි 01)
  const formatSinhalaDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const monthsSinhala: { [key: string]: string } = {
      '01': 'ජනවාරි', '02': 'පෙබරවාරි', '03': 'මාර්තු', '04': 'අප්‍රේල්',
      '05': 'මැයි', '06': 'ජූනි', '07': 'ජූලි', '08': 'අගෝස්තු',
      '09': 'සැප්තැම්බර්', '10': 'ඔක්තෝබර්', '11': 'නොවැම්බර්', '12': 'දෙසැම්බර්'
    };
    return `${parts[0]} ${monthsSinhala[parts[1]] || parts[1]} ${parts[2]}`;
  };

  const handleApplyRange = () => {
    setFromDate(tempFrom);
    setToDate(tempTo);
    setRangeModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* ප්‍රධාන මාතෘකාව (Main Blue Header Box) */}
        <View style={styles.mainHeaderBox}>
          <Text style={styles.mainTitle}>ගනුදෙනු ඉතිහාසය</Text>
          <Text style={styles.subTitle}>( History )</Text>

          {/* දින වකවානුව පෙන්වන බොත්තම */}
          <TouchableOpacity 
            style={styles.dateRangePickerButton} 
            onPress={() => {
              setTempFrom(fromDate);
              setTempTo(toDate);
              setRangeModalVisible(true);
            }}
          >
            <Ionicons name="calendar-outline" size={16} color="#2f5d98" />
            <Text style={styles.dateRangeText}>
              {fromDate.replace(/-/g, '.')}  සිට  {toDate.replace(/-/g, '.')}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 1. INCOME SECTION */}
        <View style={[styles.sectionBanner, styles.incomeBanner]}>
          <Text style={styles.bannerText}>Income</Text>
          <Text style={styles.bannerSubText}>{formatSinhalaDate(fromDate)} සිට {formatSinhalaDate(toDate)} දක්වා</Text>
        </View>

        {incomeTransactions.length === 0 ? (
          <Text style={styles.emptyText}>තෝරාගත් කාලසීමාව තුළ ආදායම් කිසිවක් නැත.</Text>
        ) : (
          incomeTransactions.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.listItemRow}
              onLongPress={() => handleDeleteTransaction(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.itemText}>
                {index + 1}. {item.category.split(' ')[0]} {item.date.replace(/-/g, ' : ')}
              </Text>
              <Text style={[styles.amountText, styles.incomeColor]}>
                = Rs: {item.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {/* 2. EXPENSE SECTION */}
        <View style={[styles.sectionBanner, styles.expenseBanner]}>
          <Text style={styles.bannerText}>Expense</Text>
          <Text style={styles.bannerSubText}>{formatSinhalaDate(fromDate)} සිට {formatSinhalaDate(toDate)} දක්වා</Text>
        </View>

        {expenseTransactions.length === 0 ? (
          <Text style={styles.emptyText}>තෝරාගත් කාලසීමාව තුළ වියදම් කිසිවක් නැත.</Text>
        ) : (
          expenseTransactions.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.listItemRow}
              onLongPress={() => handleDeleteTransaction(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.itemText}>
                {index + 1}. {item.category.split(' ')[0]} {item.date.replace(/-/g, ' : ')}
              </Text>
              <Text style={[styles.amountText, styles.expenseColor]}>
                = Rs: {item.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* ================= CUSTOM DATE RANGE PICKER MODAL ================= */}
      <Modal visible={rangeModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalContentTitle}>දින වකවානුව තෝරන්න</Text>
            
            <Text style={styles.inputLabel}>සිට (From Date):</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.dateTextInput} 
                value={tempFrom} 
                onChangeText={setTempFrom}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <Text style={styles.inputLabel}>දක්වා (To Date):</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.dateTextInput} 
                value={tempTo} 
                onChangeText={setTempTo}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRangeModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleApplyRange}>
                <Text style={styles.saveBtnText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a58e8e', paddingHorizontal: 20 },
  
  mainHeaderBox: { 
    backgroundColor: '#dbe5f9', 
    borderRadius: 16, 
    paddingVertical: 20, 
    alignItems: 'center', 
    marginTop: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c9daf8'
  },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  subTitle: { fontSize: 22, fontWeight: '600', color: '#222', marginTop: 2 },
  
  // Date Range Button Style
  dateRangePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
    width: '90%',
    borderWidth: 1,
    borderColor: '#b4c7ec',
    elevation: 1
  },
  dateRangeText: { fontSize: 13, fontWeight: 'bold', color: '#333' },

  sectionBanner: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    marginTop: 15,
    marginBottom: 10 
  },
  incomeBanner: { backgroundColor: '#a3e4d7' },
  expenseBanner: { backgroundColor: '#f5b7b1' },
  bannerText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  bannerSubText: { fontSize: 11, fontWeight: '600', color: '#333' },

  listItemRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#e8edf7', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    marginBottom: 8 
  },
  itemText: { fontSize: 13, fontWeight: '700', color: '#222' },
  amountText: { fontSize: 13, fontWeight: 'bold' },
  incomeColor: { color: '#196f3d' },
  expenseColor: { color: '#922b21' },
  emptyText: { fontSize: 12, color: '#777', fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#f3ecec', width: '85%', borderRadius: 18, padding: 20, elevation: 5 },
  modalContentTitle: { fontSize: 16, fontWeight: 'bold', color: '#2f5d98', marginBottom: 15, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
  inputContainer: { backgroundColor: '#f5f5f7', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  dateTextInput: { padding: 10, fontSize: 14, textAlign: 'center', fontWeight: 'bold', color: '#333' },
  modalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 5 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 15 },
  cancelBtnText: { color: '#666', fontWeight: '600' },
  saveBtn: { backgroundColor: '#2f5d98', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});