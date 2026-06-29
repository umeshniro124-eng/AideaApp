import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AttendanceRecord {
  date: string;
  type: 'work' | 'leave';
}

export default function CalendarScreen() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); 

  const fetchAttendance = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('@my_attendance');
      if (data) {
        const parsedData: AttendanceRecord[] = JSON.parse(data);
        setAttendanceRecords(parsedData);
      }
    } catch (e) {
      console.error("දත්ත ලබා ගැනීමේ දෝෂයක්:", e);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAttendance(); }, [fetchAttendance]));

  const filteredRecords = attendanceRecords.filter(r => r.date.startsWith(selectedMonth));
  const workDays = filteredRecords.filter(r => r.type.toLowerCase() === 'work');
  const leaveDays = filteredRecords.filter(r => r.type.toLowerCase() === 'leave');

  const markedDates = attendanceRecords.reduce((acc, record) => ({
    ...acc,
    [record.date]: {
      customStyles: {
        container: { backgroundColor: record.type === 'work' ? '#27ae60' : '#e74c3c', borderRadius: 20 },
        text: { color: 'white', fontWeight: 'bold' }
      }
    }
  }), {});

  const deleteAttendance = async (date: string) => {
    try {
      const updatedRecords = attendanceRecords.filter(r => r.date !== date);
      await AsyncStorage.setItem('@my_attendance', JSON.stringify(updatedRecords));
      setAttendanceRecords(updatedRecords);
      Alert.alert("සාර්ථකයි", "දත්ත මකා දමන ලදී.");
    } catch (error) {
      Alert.alert("දෝෂයක්", "දත්ත මැකීමට නොහැකි විය.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        markingType={'custom'}
        markedDates={markedDates}
        onDayPress={(day) => {
          const record = attendanceRecords.find(r => r.date === day.dateString);
          if (record) {
            Alert.alert("කළමනාකරණය", `${day.dateString} සඳහා ඇත්තේ: ${record.type.toUpperCase()}`, [
              { text: "මකන්න", onPress: () => deleteAttendance(day.dateString), style: 'destructive' },
              { text: "අවලංගු කරන්න" }
            ]);
          }
        }}
        onMonthChange={(month) => setSelectedMonth(month.dateString.slice(0, 7))}
        style={styles.calendar}
      />
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryBtn, { backgroundColor: '#2e7d32' }]}>
          <Text style={styles.btnText}>Work = {workDays.length}</Text>
        </View>
        <View style={[styles.summaryBtn, { backgroundColor: '#c62828' }]}>
          <Text style={styles.btnText}>Leave = {leaveDays.length}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a58e8e' },
  calendar: { margin: 20, borderRadius: 15 },
  summaryContainer: { paddingHorizontal: 20 },
  summaryBtn: { padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  btnText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' }
});