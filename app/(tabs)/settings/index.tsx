import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // මුලින් දත්ත පූරණය කිරීම
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const name = await AsyncStorage.getItem('@user_name');
      const email = await AsyncStorage.getItem('@user_email');
      if (name) setUserName(name);
      if (email) setEmail(email);
    } catch (e) {
      console.log('දත්ත පූරණය කිරීමේදී දෝෂයක් සිදුවිය', e);
    }
  };

  // දත්ත සුරැකීම
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('@user_name', userName);
      await AsyncStorage.setItem('@user_email', email);
      await AsyncStorage.setItem('@user_phone', phone);
          alert('තොරතුරු සාර්ථකව සුරැකිනි!');
    } catch (e) {
      alert('සුරැකීමට නොහැකි විය.');
    }
  };

const resetAppData = async () => {
  Alert.alert(
    "සියලු දත්ත මකා දමන්නද?",
    "මෙම ක්‍රියාවෙන් ඔබේ නම, ඊමේල්, ගනුදෙනු සහ පැමිණීම් වාර්තා සියල්ල ස්ථිරවම මකා දමනු ඇත. ඔබට විශ්වාසද?",
    [
      { text: "නැත", style: "cancel" },
      { 
        text: "ඔව්, මකා දමන්න", 
        style: "destructive",
        onPress: async () => {
          // 1. AsyncStorage හි ඇති සියලු දත්ත මකන්න
          await AsyncStorage.clear(); 
          
          // 2. තිරයේ පෙන්වන State ද හිස් කරන්න (මෙය අනිවාර්යයි)
          setUserName('');
          setEmail('');
          setPhone('');
          
          Alert.alert("සාර්ථකයි", "ඇප් එකේ දත්ත සියල්ල ඉවත් කරන ලදී.");
        }
      }
    ]
  );
};


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>මගේ තොරතුරු</Text>
          
          <Text style={styles.label}>නම:</Text>
          <TextInput 
            style={styles.input} 
            value={userName} 
            onChangeText={setUserName} 
            placeholder="ඔබේ නම ඇතුළත් කරන්න" 
          />

          <Text style={styles.label}>ඊමේල් ලිපිනය:</Text>
          <TextInput 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            placeholder="ඔබේ ඊමේල් ලිපිනය" 
            keyboardType="email-address"
          />

<Text style={styles.label}>දුරකථන අංකය:</Text>
<TextInput 
  style={styles.input} 
  value={phone} 
  onChangeText={setPhone} 
  placeholder="ඔබේ දුරකථන අංකය" 
  keyboardType="phone-pad" // මෙය දුරකථන අංක සඳහා පමණක් වන keypad එක පෙන්වයි
/>


          <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
            <Text style={styles.saveBtnText}>සුරකින්න</Text>
          </TouchableOpacity>
        </View>





        {/* මෙතනට ඔබට අවශ්‍ය නම් BankDetails තිරයට යාමට බොත්තමක් එක් කළ හැක */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3ecec', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#2f5d98' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#555' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, backgroundColor: '#fafafa' },
  saveBtn: { backgroundColor: '#2f5d98', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});