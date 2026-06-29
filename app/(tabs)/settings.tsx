import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [banks, setBanks] = useState(Array(6).fill({ bankName: '', accountNo: '', branch: '', isEditing: true }));
  const onShare = async (bank: any) => {
  const message = `මගේ බැංකු විස්තර:\n\nනම: ${name}\nබැංකුව: ${bank.bankName}\nගිණුම් අංකය: ${bank.accountNo}\nශාඛාව: ${bank.branch}`;

  try {
    const result = await Share.share({
      message: message,
    });
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // ශෙයා කළා (කිසියම් විශේෂ App එකකින්)
      } else {
        // ශෙයා කළා
      }
    } else if (result.action === Share.dismissedAction) {
      // අවලංගු කළා
    }
  } catch (error: any) {
    Alert.alert(error.message);
  }
};
  // නම සඳහා state
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState("R.K.Umesh Dulanjana Aberathna");

  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem('@bank_details_list');
      if (data) {
        setBanks(JSON.parse(data));
      }
    };
    loadData();
  }, []);

  const toggleEdit = (index: number) => {
    const newBanks = [...banks];
    newBanks[index].isEditing = !newBanks[index].isEditing;
    setBanks(newBanks);
  };

  const saveDetails = async (index: number) => {
    toggleEdit(index);
    await AsyncStorage.setItem('@bank_details_list', JSON.stringify(banks));
    Alert.alert('සාර්ථකයි', `බැංකුව ${index + 1} තොරතුරු සුරැකිනු ඇත.`);
  };

  const handleInputChange = (text: string, index: number, field: string) => {
    const newBanks = [...banks];
    newBanks[index] = { ...newBanks[index], [field]: text };
    setBanks(newBanks);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Settings</Text>

        {/* පරිශීලක නාමය සංස්කරණය කිරීම */}
        <View style={styles.nameContainer}>
          {isEditingName ? (
            <TextInput style={styles.inputName} value={name} onChangeText={setName} />
          ) : (
            <Text style={styles.userName}>{name}</Text>
          )}
          <TouchableOpacity onPress={() => setIsEditingName(!isEditingName)}>
            <Text style={styles.editLabel}>{isEditingName ? "Save Name" : "Edit Name"}</Text>
          </TouchableOpacity>
        </View>

        {/* බැංකු ලැයිස්තුව */}
        {banks.map((bank, index) => (
          <View key={index} style={styles.bankBox}>
            <Text style={styles.bankTitle}>බැංකුව {index + 1}</Text>
            
            {bank.isEditing ? (
              <>
                <TextInput style={styles.input} placeholder="බැංකුවේ නම" value={bank.bankName} onChangeText={(t) => handleInputChange(t, index, 'bankName')} />
                <TextInput style={styles.input} placeholder="ගිණුම් අංකය" keyboardType="numeric" value={bank.accountNo} onChangeText={(t) => handleInputChange(t, index, 'accountNo')} />
                <TextInput style={styles.input} placeholder="ශාඛාව" value={bank.branch} onChangeText={(t) => handleInputChange(t, index, 'branch')} />
                <TouchableOpacity style={styles.saveBtn} onPress={() => saveDetails(index)}><Text style={styles.btnText}>Save</Text></TouchableOpacity>
              </>
            ) : (
              <View>
                <Text style={styles.infoText}>බැංකුව: {bank.bankName}</Text>
                <Text style={styles.infoText}>ගිණුම් අංකය: {bank.accountNo}</Text>
                <Text style={styles.infoText}>ශාඛාව: {bank.branch}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => toggleEdit(index)}><Text style={styles.btnText}>Edit</Text></TouchableOpacity>

<TouchableOpacity style={[styles.editBtn, {backgroundColor: '#e67e22'}]} onPress={() => onShare(bank)}>
        <Text style={styles.btnText}>Share</Text>
      </TouchableOpacity>
                
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#a58e8e' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  nameContainer: { alignItems: 'center', marginBottom: 20, backgroundColor: '#fff', padding: 10, borderRadius: 10 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  inputName: { fontSize: 18, fontWeight: 'bold', color: '#000', borderBottomWidth: 1, width: '100%', textAlign: 'center' },
  editLabel: { color: 'blue', marginTop: 5 },
  bankBox: { backgroundColor: '#d2f0e9', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 3 },
  bankTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#2c3e50' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 5 },
  infoText: { fontSize: 14, marginBottom: 5 },
  saveBtn: { backgroundColor: '#27ae60', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  editBtn: { backgroundColor: '#3498db', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});