import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View ,Pressable} from 'react-native';
import RegisterScreen from './src/screens/RegisterScreen';
import { SQLiteProvider } from 'expo-sqlite';
import { colors } from './src/styles/theme';
import {styles} from './src/styles/appStyles';
import { DATABASE_NAME ,initDb} from './src/db/database';
import StudentListScreen from './src/screens/StudentListScreens';
import { useState } from 'react';

export default function App() {
  return (
    <>
      <StatusBar barStyle='light-content' backgroundColor={colors.bg}/>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDb}>
        <Main/>
      </SQLiteProvider>
    </>
  );
}

function Main(){
  const [tab, setTab] = useState('register');
  const [reloadKey, setReloadKey] = useState(0);
  return (
      
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>ระบบลงทะเบียนนักศึกษา</Text>
          </View>
          <View style={styles.tabs}>
           <TabButton
            testID="tab-register"
            label={'ลงทะเบียน'}
            active={tab === 'register'}
            onPress={() => setTab('register') }
           />
            <TabButton
            testID="tab-list"
            label={'รายชื่อ'}
            active={tab === 'list'}
            onPress={() => setTab('list')}
           />

          </View>

          {tab === 'register' ? (
            <RegisterScreen onSuccess={() => setReloadKey((k) => k + 1)} />
          ) : (
            <StudentListScreen reloadKey={reloadKey} />
          )}
      
        
        </View>
   
  );
}

function TabButton({ testID, label, active, onPress }) {
  return (
    <Pressable testID={testID} style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}