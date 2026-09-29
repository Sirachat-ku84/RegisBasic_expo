export function validateForm({name, surname, studentId, username, password, confirm}) {
    const errors = {};

    if (!name.trim()) errors.name = 'กรุณากรอกชื่อ';
    if (!surname.trim()) errors.surname = 'กรุณากรอกนามสกุล';
    if (!/^\d{10}$/.test(studentId.trim())) {
        errors.studentId = 'กรุณากรอกรหัสนักศึกษาให้ครบ 10 หลัก';
    }
    if(!/^[a-zA-Z0-9]{4,20}$/.test(username.trim())){
        errors.username = 'กรุณากรอกชื่อผู้ใช้ อย่างน้อย 4 - 20 ตัวอักษร ใช้ได้เฉพาะ a-z A-Z 0-9';
    }
    if (!password || password.length < 8) {
        errors.password = 'กรุณากรอกรหัสผ่าน อย่างน้อย 8 ตัวอักษร';
    } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        errors.password = 'รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข';
    }

    if (confirm !== password) errors.confirm = 'ยืนยันรหัสผ่านไม่ตรงกัน';

    return errors;
}

export function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}