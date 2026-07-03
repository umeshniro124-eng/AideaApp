import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState } from 'react';
import { Alert, Button, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  date: string;
  category: string;
  amount: number;
  description: string;
}

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const isFocused = useIsFocused();

 // දිනය ලබා ගැනීමට එකම ෆන්ක්ෂන් එකක් පමණක් තබන්න
const getToday = () => {
  const d = new Date();
  // දේශීය වේලාවට අනුකූලව වසර, මාසය සහ දිනය ලබා ගැනීම
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// වත්මන් මාසයේ 01 වෙනිදා ලබා ගැනීමට
const getThisMonthStart = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};


 const [fromDate, setFromDate] = useState(() => getThisMonthStart());
const [toDate, setToDate] = useState(() => getToday());

  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [tempFrom, setTempFrom] = useState(fromDate);
  const [tempTo, setTempTo] = useState(toDate);

  // ඇප් එකේ History පිටුවට පැමිණි සැමවිටම අද දිනයට Update කිරීම
useFocusEffect(
  useCallback(() => {
    const today = getToday();
    const start = getThisMonthStart();
    console.log("Date Updated:", start, today); // මෙය Console එකේ පෙන්වයිද බලන්න

    // state එක යාවත්කාලීන කිරීම
    setFromDate(start);
    setToDate(today);
    
    loadTransactions();
  }, [])
);


  const loadTransactions = async () => {
    try {
      const savedTransactions = await AsyncStorage.getItem('@my_transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.log('Error loading:', error);
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
          setTransactions(filtered);
          await AsyncStorage.setItem('@my_transactions', JSON.stringify(filtered));
        }
      }
    ]);
  };

  const filteredTransactions = transactions.filter((t) => t.date >= fromDate && t.date <= toDate);
  const incomeTransactions = filteredTransactions.filter((t) => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);

  const createPDF = async (income: number, expense: number) => {
   const htmlContent = `
  <html>
    <body style="font-family: sans-serif; padding: 20px;">
      <h1 style="color: #2f5d98;">Income & Expense Report</h1>
      <p><strong>කාලසීමාව:</strong> ${fromDate} සිට ${toDate} දක්වා</p>
      
      <h3>ආදායම් (Income):</h3>
     <table width="100%" border="0" style="border-collapse: collapse; text-align: left; table-layout: fixed;">
  <tr>
    <th style="border-bottom: 1px solid #ddd; padding: 5px; width: 30%;">කාණ්ඩය</th>
    <th style="border-bottom: 1px solid #ddd; padding: 5px; width: 30%;">විස්තරය</th>
    <th style="border-bottom: 1px solid #ddd; padding: 5px; width: 20%;">දිනය</th>
    <th style="border-bottom: 1px solid #ddd; padding: 5px; width: 20%;">මුදල</th>
  </tr>
       ${incomeTransactions.map((item, i) => `
          <tr>
            <td style="padding: 5px;">${i + 1}. ${item.category}</td>
            <td style="padding: 5px;">${item.description || '-'}</td>
            <td style="padding: 5px;">${item.date ? item.date.substring(5) : '-'}</td> 
            <td style="padding: 5px;">Rs: ${item.amount.toFixed(2)}</td>
          </tr>`).join('')}
      </table>

      <h3 style="margin-top: 20px;">වියදම් (Expense):</h3>
     <table width="100%" border="0" style="border-collapse: collapse; text-align: left; table-layout: fixed;">
  <tr>
    <th style="border-bottom: 1px solid #ddd; padding: 5px; width: 30%;">කාණ්ඩය</th>
    <th style="border-bottom: 1px solid #ddd; padding: 5px; width: 30%;">විස්තරය</th>
    <th style="border-bottom: 1px solid #ddd; padding: 5px; width: 20%;">දිනය</th>
    <th style="border-bottom: 1px solid #ddd; padding: 5px; width: 20%;">මුදල</th>
  </tr>
       ${expenseTransactions.map((item, i) => `
          <tr>
            <td style="padding: 5px;">${i + 1}. ${item.category}</td>
            <td style="padding: 5px;">${item.description || '-'}</td>
            <td style="padding: 5px;">${item.date ? item.date.substring(5) : '-'}</td>
            <td style="padding: 5px;">Rs: ${item.amount.toFixed(2)}</td>
          </tr>`).join('')}
      </table>

      <div style="margin-top: 30px; border-top: 1px solid #b37c7c; padding-top: 10px;">
        <p><strong>මුළු ආදායම (Total Income):</strong> Rs: ${income.toFixed(2)}</p>
        <p><strong>මුළු වියදම (Total Expense):</strong> Rs: ${expense.toFixed(2)}</p>
      </div>

    </body>
  </html>
`;
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri);

try {
    // 1. ඇප් එක තුළම Preview එකක් පෙන්වීමට
    await Print.printAsync({
      html: htmlContent,
    });
  } catch (error) {
   console.error("PDF Preview දෝෂය:", error);
      Alert.alert("දෝෂයක්", "PDF එක උත්පාදනය කිරීමට නොහැකි විය.");
    }

    
  };

  const formatSinhalaDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    const months: any = { '01':'ජනවාරි','02':'පෙබරවාරි','03':'මාර්තු','04':'අප්‍රේල්','05':'මැයි','06':'ජූනි','07':'ජූලි','08':'අගෝස්තු','09':'සැප්තැම්බර්','10':'ඔක්තෝබර්','11':'නොවැම්බර්','12':'දෙසැම්බර්' };
    return `${parts[0]} ${months[parts[1]]} ${parts[2]}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.mainHeaderBox}>
          <Text style={styles.mainTitle}>ගනුදෙනු ඉතිහාසය</Text>
          <TouchableOpacity style={styles.dateRangePickerButton} onPress={() => { setTempFrom(fromDate); setTempTo(toDate); setRangeModalVisible(true); }}>
            <Ionicons name="calendar-outline" size={16} color="#2f5d98" />
            <Text style={styles.dateRangeText}>{fromDate.replace(/-/g, '.')} සිට {toDate.replace(/-/g, '.')}</Text>
          </TouchableOpacity>
        </View>

        <Button title="Download Report (PDF)" onPress={() => createPDF(totalIncome, totalExpense)} />

        <View style={[styles.sectionBanner, styles.incomeBanner]}><Text style={styles.bannerText}>Income</Text></View>
        {incomeTransactions.map((item, index) => (
          <TouchableOpacity key={item.id} style={styles.listItemRow} onLongPress={() => handleDeleteTransaction(item.id)}>
            <Text style={styles.itemText}>{index + 1}. {item.category} ({item.date})</Text>
            <Text style={[styles.amountText, styles.incomeColor]}>= Rs: {item.amount.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.sectionBanner, styles.expenseBanner]}><Text style={styles.bannerText}>Expense</Text></View>
        {expenseTransactions.map((item, index) => (
          <TouchableOpacity key={item.id} style={styles.listItemRow} onLongPress={() => handleDeleteTransaction(item.id)}>
            <Text style={styles.itemText}>{index + 1}. {item.category} ({item.date})</Text>
            <Text style={[styles.amountText, styles.expenseColor]}>= Rs: {item.amount.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={rangeModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput style={styles.dateTextInput} value={tempFrom} onChangeText={setTempFrom} />
            <TextInput style={styles.dateTextInput} value={tempTo} onChangeText={setTempTo} />
            <Button title="Apply Filter" onPress={() => { setFromDate(tempFrom); setToDate(tempTo); setRangeModalVisible(false); }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a58e8e', paddingHorizontal: 20 },
  mainHeaderBox: { backgroundColor: '#dbe5f9', borderRadius: 16, paddingVertical: 20, alignItems: 'center', marginTop: 15 },
  dateRangePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginTop: 15 },
  dateRangeText: { fontSize: 13, fontWeight: 'bold', marginLeft: 10 },
  sectionBanner: { padding: 10, borderRadius: 10, marginTop: 15 },
  incomeBanner: { backgroundColor: '#a3e4d7' },
  expenseBanner: { backgroundColor: '#f5b7b1' },
  bannerText: { fontWeight: 'bold' },
  listItemRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#e8edf7', padding: 12, borderRadius: 10, marginBottom: 8 },
  itemText: { fontWeight: '700' },
  amountText: { fontWeight: 'bold' },
  incomeColor: { color: '#196f3d' },
  expenseColor: { color: '#922b21' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  dateTextInput: { borderBottomWidth: 1, marginBottom: 20, padding: 5 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' }
});