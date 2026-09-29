import { use, useState } from "react";
import {View,Text,StyleSheet,TextInput,Pressable,Alert,Platform,ScrollView, KeyboardAvoidingView} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import {styles }from "../styles/registerStyles";
import { colors } from "../styles/theme";
import Field from "../components/Field";
import { validateForm,hasErrors } from "../untils/validate";
import { registerStudent } from "../db/database";

const EMPTY_FORM = {
    name : '',
    surname : '',
    studentId : '',
    username : '',
    password : '',
    confirm : '',

}

const RegisterScreen = ({onRegister}) => {
        const db = useSQLiteContext();

        const [form,setForm] = useState(EMPTY_FORM);
        const [errors,setErrors] = useState({});
        const [saving,setSaving] = useState(false);
        const [success,setSuccess] = useState('');   

        function setField(field, value) {
            setForm((prev) => ({ ...prev, [field]: value }));
            if (errors[field]) {
                setErrors((prev) => {
                    const next = { ...prev };
                    delete next[field];
                    return next;
                });
            }
        }

        async function handledSummit(){
            setSuccess('');
            const found = validateForm(form);
            console.log('errors:', found); 
            if(hasErrors(found)){
                setErrors(found);
                return;
            }

            console.log('ไม่มี error')

            setSaving(true);
            const result = await registerStudent(db, {
                name: form.name.trim(),
                surname: form.surname.trim(),
                studentId: form.studentId.trim(),
                username: form.username.trim(),
                password: form.password
            });

            setSaving(false);

            if(!result.ok){
               if(result.field) setErrors({[result.field]: result.message});
               else Alert.alert('เกิดข้อผิดพลาด',result.message);
               return;
            }

            setForm(EMPTY_FORM);
            setErrors({});
            setSuccess('ลงทะเบียนสำเร็จ หมายเลขในระบบคือ ${result.id}');
        }

        async function handleSubmit(){
            console.log('press submit',form);
        }

        return(
            <KeyboardAvoidingView 
                style={{flex:1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined  }
                
            >

                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps='handled'
                >


              
                  <Text style={styles.intro}>กรุณากรอกข้อมูลให้ครบทุกช่อง</Text>

                  {success !== '' && (
                    <View style={styles.notice}>
                        <Text style={styles.noticeText}>{success}</Text>
                    </View>
                  )}
                  <View style={styles.row}>
                      <Field style={styles.half}
                            testID="input-name"
                            label = 'ชื่อ'
                            value={form.name}
                            onChangeText = {(text) => setField('name',text)}
                            error={errors.name}
                            placeholder = 'สุดหล่อพ่อรวย'

                      />
                      <Field style={styles.half}
                            testID="input-surname"
                            label = 'นามสกุล'
                            value={form.surname}
                            onChangeText = {(text) => setField('surname',text)}
                            error={errors.surname}
                            placeholder = 'ใครบอกว่าหนูไม่รวย'

                      />
                  </View>
                    <Field style={styles.full}
                            testID="input-student-id"
                            label = 'รหัสนักศึกษา'
                            placeholder = '1234567890'
                            keyboardType = 'number-pad'
                            value={form.studentId}
                            onChangeText = {(text) => setField('studentId',text)}
                            error={errors.studentId}
                            maxlength = {10}
                    />
                    <Field style={styles.full}
                            testID="input-username"
                            label = 'ขื่อผู้ใช้'
                            placeholder = 'somchai'
                            hint = ' ห้ามซ้ำกับผู้ใช้อื่น'
                            autoCapitalize = 'none'
                            value={form.username}
                            onChangeText = {(text) => setField('username',text)}
                            error={errors.username}
                            maxlength={20}
                    />
                    <Field
                        testID="input-password"
                        label = 'รหัสผ่าน'
                        hint = 'อย่างน้อย 8 ตัว มีทั้งตัวอักษรและตัวเลข'
                        placeholder = 'อย่างน้อย 8 ตัว'
                        secureTextEntry 
                        autoCapitalize  = 'none'
                        value={form.password}
                        onChangeText={(text) => setField('password',text)}
                        error={errors.password}
                    />
                      <Field
                        testID="input-confirm"
                        label = 'ยืนยันรหัสผ่าน'
                        placeholder = 'พิมพ์รหัสผ่านอีกครั้ง'
                        secureTextEntry 
                        autoCapitalize  = 'none'
                        value={form.confirm}
                        onChangeText={(text) => setField('confirm',text)}
                        error={errors.confirm}
                    />
                    <Pressable testID="btn-submit" style={[styles.submit,saving && styles.submitDisabled] } onPress={handledSummit} >
                        <Text style={styles.submitText}>{saving ? 'กำลังบันทึก....' : 'ลงทะเบียน'}</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        )
}
export default RegisterScreen;