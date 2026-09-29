import * as Crypto from 'expo-crypto'


export const DATABASE_NAME = 'register_basic.db';

async function hashPassword(password, salt) {
    const passwordWithSalt = password + salt;
    const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        passwordWithSalt
    );
    return hash;
}


export async function initDb(db) {
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS students (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT NOT NULL,
            surname       TEXT NOT NULL,
            student_id    TEXT NOT NULL UNIQUE,
            username      TEXT NOT NULL UNIQUE,
            password_salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            create_at     TEXT NOT NULL
        )`
    );
}

export function listStudents(db){
    return db.getAllAsync(`
        SELECT id,name,surname,student_id,username,substr(password_hash, 1, 16) AS hash_review
        FROM students ORDER BY id DESC
    `);
}

export async function findDuplicate(db, studentId, username) {
    const row = await db.getFirstAsync(
        `SELECT student_id, username FROM students WHERE student_id = ? OR username = ?`,
        [studentId, username]
    );
    if(!row) return null;
    if(row.student_id === studentId) return 'studentId';
    return 'username' ;
}

export async function registerStudent(db, { name, surname, studentId, username, password }) {
    
    console.log('1. findDuplicate');
    const duplicate = await findDuplicate(db, studentId, username);
    console.log('2. duplicate:', duplicate);

    if (duplicate === 'studentId') {
        return {ok:false, field: 'studentId', message:'รหัสนักศึกษานี้มีผู้ใช้แล้ว'};
    }
    if (duplicate === 'username') {
        return {ok:false, field: 'username', message:'ชื่อผู้ใช้นี้มีผู้ใช้แล้ว'};
    }

    console.log('3. randomUUID');
    const salt = Crypto.randomUUID();  // ← แก้ randomUIID → randomUUID ด้วย
    
    console.log('4. hashPassword');
    const hash = await hashPassword(password, salt);
    
    console.log('5. INSERT');
    try {
        const result = await db.runAsync(
            `INSERT INTO students (name, surname, student_id, username, password_salt, password_hash, create_at)
            VALUES (?, ?, ?, ?, ?, ?,?)`,
            [name, surname, studentId, username, salt, hash, new Date().toISOString()]
        );
        console.log('6. success:', result.insertId);
        return { ok: true, id: result.insertId };
    } catch (e) {
        console.warn('registerStudent error', e);
        return { ok: false, field: null , message: 'บันทึกไม่สำเร็จ กรุณาลองใหม่' };   
    }
}
export async function countStudent(db){
    const row = await db.getFirstAsync(`SELECT COUNT(*) AS count FROM students`);
    return row?.count ?? 0;
}

export async function clearStudent(db){
    const result = await db.runAsync(`DELETE FROM students`);
    return result.changes;
}

export async function loginStudent(db,username,password){
    const row = await db.getFirstAsync(
        `SELECT id, name, surname, student_id, username, password_salt,password_hash FROM students WHERE username = ?`,[username]
    )
    const fail =   {ok:false, message:'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้้อง'};
    if(!row) return fail

    const hash = await hashPassword(password,row.password_salt)
    if(hash !== row.password_hash) return fail
    
    return{
        ok:true,
        user:{
            id:row.id,
            name:row.name,
            student_id:row.student_id,
            username: row.username
        }
    }
}

export function getStudents(db,id){
    return db.getFirstAsync(
        `SELECT id, name, surname, students_id,username, create_at FROM students WHERE id = ?`,[id]
    )
}

