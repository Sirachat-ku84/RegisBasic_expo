import { useState,useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable,Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import { listStudents ,clearStudent } from "../db/database";
import { styles } from "../styles/studentListStyles";

export default function StudentListScreen({reloadKey}) {

    const db = useSQLiteContext();
    const [rows,setRows] = useState([]);

    const reload = useCallback(async () => {
       setRows(await listStudents(db));
    }, [db]);

    useEffect(() => {
        reload();
    }, [reload, reloadKey]);

    function handClear(){
        Alert.alert('ล่างข้อมูลทั้งหมด','ลบผู้ลงทะเบียนทั้งหมดและกู้คืนไม่ได้',[
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ล้าง',
                style: 'destructive',
                onPress: async () => {
                    const n = await clearStudent(db);
                    await reload();
                    Alert.alert('เสร็จแล้ว', `ลบไป ${n} รายการ`);
                    
                },
            }
        ])

    }
    return(
        <FlatList
        data={rows}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
            <Text style={styles.summary}>ลงทะเบียน {rows.length} คน</Text>
        }
        renderItem={({ item }) => (
            <View style={styles.card}>
                <Text style={styles.cardName}>
                    {item.name} {item.surname} 
                </Text>
                <Text style={styles.cardLine}> รหัสนักศึกษา: {item.student_id}  </Text>
                <Text style={styles.cardLine}> ชื่อผู้ใช้: {item.username}  </Text>
                <Text style={styles.hashLabel}> 
                    ค่าย่อยรหัสผ่าน{''}
                   <Text style={styles.hashValue}>
                    {item.hash_review}...
                   </Text>
                </Text>
            </View>
        )}
        ListEmptyComponent={
            <Text style={styles.empty}> ยังไม่มีผู้ลงทะเบียน</Text>
        }
        ListFooterComponent={ rows.length > 0 ? (
              <Pressable testID="btn-clear" style={styles.clearButton} onPress={handClear}>
                <Text style={styles.clearText}>ล้างข้อมูลทั้งหมด</Text>
              </Pressable>) : null }
        />
    )
}