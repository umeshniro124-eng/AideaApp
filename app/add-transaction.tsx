import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddTransactionScreen() {
  const router = useRouter();


  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER WITH BACK BUTTON */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New (අලුත් සටහන)</Text>
      </View>

      {/* INPUT FORM */}
      <View style={styles.formContainer}>
        {/* Amount Input */}
        <Text style={styles.label}>Amount (මුදල)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Rs: 0.00" 
          keyboardType="numeric" 
          placeholderTextColor="#999"
        />

        {/* Note Input */}
        <Text style={styles.label}>Note / Description (විස්තරය)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="වැඩේ මොකක්ද කියලා ලියන්න..." 
          placeholderTextColor="#999"
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save (සුරකින්න)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#333',
  },
  formContainer: {
    padding: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#2f5d98',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#2f5d98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});