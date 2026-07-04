import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BankDetails from './bank'; // BankDetails ලෙස export කර ඇති බව සහතික කරගන්න



export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile සඳහා අවශ්‍ය States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
// 1. අලුතින් state එකක් එකතු කරන්න
  const [phone, setPhone] = useState('');


useEffect(() => {
  const loadProfile = async () => {
    const savedName = await AsyncStorage.getItem('@user_name');
    const savedEmail = await AsyncStorage.getItem('@user_email');
    const savedPhone = await AsyncStorage.getItem('@user_phone');
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
    if (savedPhone) setPhone(savedPhone);
  };
  loadProfile();
}, []);


const handleSaveProfile = async () => {
  try {
    await AsyncStorage.setItem('@user_name', name);
    await AsyncStorage.setItem('@user_email', email);
    await AsyncStorage.setItem('@user_phone', phone);
    alert("දත්ත සාර්ථකව සුරකින ලදී!");
  } catch (error) {
    alert("දත්ත සුරැකීමේදී දෝෂයක් ඇතිවිය.");
  }
  
};


  return (
    <View style={styles.container}>
      {/* Custom Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]} 
          onPress={() => setActiveTab('profile')}
        >
          <Text style={activeTab === 'profile' ? styles.activeText : styles.inactiveText}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bank' && styles.activeTab]} 
          onPress={() => setActiveTab('bank')}
        >
          <Text style={activeTab === 'bank' ? styles.activeText : styles.inactiveText}>Bank Card</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' ? (
          <View style={styles.profileContent}>
            <Text style={styles.title}>Edit Profile</Text>
            
            <Text style={styles.label}>නම (Name)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ඔබේ නම ඇතුළත් කරන්න" 
              value={name} 
              onChangeText={setName} 
            />

            <Text style={styles.label}>ඊමේල් (Email)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ඔබේ ඊමේල් ලිපිනය" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address"
            />
            
            <Text style={styles.label}>දුරකතන අංකය (Phone Number)</Text>
            <TextInput 
              style={styles.input} 
      placeholder="07xxxxxxxx" 
              value={phone} 
              onChangeText={setPhone} 
      keyboardType="phone-pad" // මෙය දුරකතන අංක සඳහා පමණක් විශේෂිත වූ keyboard එකකි
            />

   <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
  <Text style={styles.btnText}>සුරකින්න (Save)</Text>
</TouchableOpacity>
          </View>
) : (
  <View>
    <BankDetails />
  </View>
)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
    paddingTop: 10 
  },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    marginHorizontal: 15, 
    marginVertical: 10,
    borderRadius: 10, 
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center',
    borderRadius: 8
  },
  activeTab: { backgroundColor: '#2f5d98' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  inactiveText: { color: '#666', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 15 },
  profileContent: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, marginBottom: 5, color: '#555', fontWeight: '500' },
  input: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  saveButton: {
    backgroundColor: '#2f5d98',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  btnText: { color: '#fff', fontWeight: 'bold' }
});