import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  // States

const [isResetModalVisible, setIsResetModalVisible] = useState(false);
const [newPassword, setNewPassword] = useState('');


  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(true);
  const [password, setPassword] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState('');
  const [banks, setBanks] = useState(Array(6).fill({ bankName: '', accountNo: '', branch: '', isEditing: true }));
const [savedPassword, setSavedPassword] = useState(''); // මෙසේ අලුතින් එක් කරන්න

  const [inputPassword, setInputPassword] = useState('');
  // මුරපද පරීක්ෂාව
 const checkPassword = async () => {
  const storedValue = await AsyncStorage.getItem('@app_password');
    console.log("AsyncStorage එකේ දැනට තියෙන මුරපදය මෙයයි: ", storedValue);

    console.log("Saved Password in state:", savedPassword); // මෙය ටර්මිනල් එකේ බලාගන්න
    console.log("Input Password:", inputPassword);
   // 2. ඔබ Default මුරපදය ලෙස '1234' භාවිතා කරනවා නම්:
     
console.log("Active Password:", activePassword);

  if (inputPassword.trim() === activePassword) {
        setIsPasswordModalVisible(false); // මෙතන නිවැරදි නම යොදන්න
    } else {
        Alert.alert('මුරපදය වැරදියි!');
    }
};
const activePassword = savedPassword || '1234';
    // 1. AsyncStorage එකෙන් මේ වන විට ගබඩා වී ඇති මුරපදය ලබා ගන්න
const loadPassword = async () => {
    const password = await AsyncStorage.getItem('@app_password');
    console.log("Storage එකෙන් ලැබුණු මුරපදය: ", password);
    if (password) {
        setSavedPassword(password);
    }
};
    // මෙය හරිදැයි බලාගන්න
console.log("Input Password:", inputPassword);
console.log("Saved Password:", activePassword)

// මුරපදය අලුත් කරන function එක
const handlePasswordReset = async (newPassword: string) => {
    await AsyncStorage.setItem('@app_password', newPassword);
    setSavedPassword(newPassword); // මෙය අනිවාර්යයෙන්ම කරන්න
    Alert.alert('මුරපදය සාර්ථකව වෙනස් විය!');
};
useEffect(() => {
    loadPassword();
}, []);

  // දත්ත පූරණය
  useEffect(() => {
    const loadData = async () => {
      const bankData = await AsyncStorage.getItem('@bank_details_list');
      if (bankData) setBanks(JSON.parse(bankData));

      const savedName = await AsyncStorage.getItem('@user_name');
      if (savedName) setName(savedName);
    };
    loadData();
  }, []);

  // Reset function
  const resetAppData = async () => {
    Alert.alert("අවවාදයයි", "සියලු දත්ත මකා දමන්නද?", [
      { text: "නැත" },
      { text: "ඔව්", onPress: async () => {
          await AsyncStorage.clear();
          setName('');
          setBanks(Array(6).fill({ bankName: '', accountNo: '', branch: '', isEditing: true }));
          setIsPasswordModalVisible(true);
          Alert.alert("සාර්ථකයි", "දත්ත මකා දමන ලදී.");
        }
      }
    ]);
  };

  const onShare = async (bank: any) => {
    const message = `මගේ බැංකු විස්තර:\n\nනම: ${name}\nබැංකුව: ${bank.bankName}\nගිණුම් අංකය: ${bank.accountNo}\nශාඛාව: ${bank.branch}`;
    try {
      await Share.share({ message });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

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


       <Modal visible={isPasswordModalVisible} transparent={true}>
  <View style={styles.modalView}>
    <Text>මුරපදය ඇතුළත් කරන්න:</Text>
    <TextInput 
      secureTextEntry 
      value={inputPassword} 
      onChangeText={setInputPassword} 
      style={[styles.input, { color: 'blue' }]} // මෙතනදී ඔබට අවශ්‍ය පාට ලබා දෙන්න
    />
    <Button title="ඇතුළු වන්න" onPress={checkPassword} />
  </View>
</Modal>


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



{/* Reset Password බොත්තම */}
<TouchableOpacity style={styles.resetBtn} onPress={() => setIsResetModalVisible(true)}>
  <Text style={styles.btnText}>Reset Password</Text>
</TouchableOpacity>

{/* Reset Password සඳහා Modal එක */}
<Modal visible={isResetModalVisible} transparent={true}>
  <View style={styles.modalView}>
    <Text style={{ fontSize: 18, marginBottom: 10 }}>නව මුරපදය ඇතුළත් කරන්න:</Text>
    <TextInput 
      secureTextEntry 
      value={newPassword} 
      onChangeText={setNewPassword} 
      style={styles.input} 
      placeholder="නව මුරපදය"
    />
    <View style={styles.buttonContainer}>
  {/* සුරකින්න බොත්තම */}
  <TouchableOpacity style={styles.saveButton} // මෙසේ වෙනස් කරන්න:
onPress={() => handlePasswordReset(newPassword)}>
    <Text style={styles.btnText}>සුරකින්න</Text>
  </TouchableOpacity>

  {/* අවලංගු කරන්න බොත්තම */}
  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsResetModalVisible(false)}>
    <Text style={styles.btnText}>අවලංගු කරන්න</Text>
  </TouchableOpacity>
  </View>
</View>
</Modal>


       {/* Reset App බොත්තම */}
<TouchableOpacity style={styles.resetBtn} onPress={resetAppData}>
  <Text style={styles.btnText}>සියලු දත්ත Reset කරන්න</Text>
</TouchableOpacity>
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
  
  // මෙන්න නිවැරදි කළ එකම input ස්ටයිල් එක
  input: { 
    borderBottomWidth: 1, 
    borderColor: '#ccc', 
    marginBottom: 10, 
    padding: 5, 
    backgroundColor: 'white',
    color: 'blue' // ඔබට අවශ්‍ය වර්ණය මෙතැනින් වෙනස් කරන්න
  },
  
  infoText: { fontSize: 14, marginBottom: 5 },
  saveBtn: { backgroundColor: '#27ae60', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  editBtn: { backgroundColor: '#3498db', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  resetBtn: { backgroundColor: '#ff4d4d', padding: 15, borderRadius: 8, marginTop: 10, marginBottom: 50, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  modalView: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f2f2f2' },

  buttonContainer: { marginTop: 0 },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#da5d4f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
});