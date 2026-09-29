import { remote } from 'webdriverio';

const driver = await remote({
  hostname: '127.0.0.1',
  port: 4723,
  logLevel: 'error', // ไม่ต้องพิมพ์ log ของ webdriver ให้รก
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.anonymous.RegisBasic',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': true,
  },
});

const VALID = {
  name: 'สมชาย',
  surname: 'ทดสอบ',
  studentId: '6512345678',
  username: 'somchai01',
  password: 'abc12345',
  confirm: 'abc12345',
};

// ชื่อช่องในฟอร์ม -> testID ในแอป
const INPUT_ID = {
  name: 'input-name',
  surname: 'input-surname',
  studentId: 'input-student-id',
  username: 'input-username',
  password: 'input-password',
  confirm: 'input-confirm',
};

// หา element จาก testID (เลื่อนจอหาให้ด้วย ถ้าอยู่นอกจอ)
// ใช้ resourceIdMatches เพราะบางเครื่อง Android จะเติมชื่อ package ข้างหน้า
// เช่น "com.anonymous.RegisBasic:id/tab-list" แทน "tab-list" เฉยๆ
function idSelector(id) {
  return `new UiSelector().resourceIdMatches(".*${id}$")`;
}

async function byId(id) {
  const el = await driver.$(`android=${idSelector(id)}`);
  if (await el.isExisting()) return el;
  return driver.$(
    `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(${idSelector(id)})`
  );
}

// เช็คว่ามีข้อความนี้บนหน้าจอไหม (เลื่อนจอหาให้ด้วย)
async function hasText(text) {
  const el = await driver.$(`android=new UiSelector().textContains("${text}")`);
  if (await el.isExisting()) return true;
  try {
    const scrolled = await driver.$(
      `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("${text}"))`
    );
    return await scrolled.isExisting();
  } catch {
    return false; // หน้านี้ไม่มีส่วนที่เลื่อนได้ หรือหาไม่เจอจริงๆ
  }
}

async function tap(id) {
  await (await byId(id)).click();
  await driver.pause(500); // รอหน้าจออัปเดต
}

async function hideKeyboard() {
  try {
    await driver.hideKeyboard();
  } catch {
    // ไม่มีคีย์บอร์ดเปิดอยู่ ไม่เป็นไร
  }
}

// เปิดหน้าลงทะเบียนแบบฟอร์มว่างใหม่
// (สลับไปแท็บรายชื่อแล้วกลับมา ฟอร์มจะถูกสร้างใหม่ ค่าเก่าหายหมด)
async function openEmptyForm() {
  await tap('tab-list');
  await tap('tab-register');
}

// กรอกฟอร์ม: data = { name: '...', studentId: '...', ... } ช่องไหนไม่ใส่ก็ข้าม
async function fillForm(data) {
  for (const field of Object.keys(data)) {
    const input = await byId(INPUT_ID[field]);
    await input.setValue(data[field]);
  }
  await hideKeyboard();
}

async function submit() {
  await hideKeyboard();
  await tap('btn-submit');
  await driver.pause(1000); // รอแอป hash รหัสผ่าน + บันทึก DB
}

// ล้างข้อมูลนักศึกษาทั้งหมดผ่านปุ่มในแอป
async function clearAllStudents() {
  await tap('tab-list');
  const clearBtn = await driver.$(`android=${idSelector('btn-clear')}`);
  if (!(await clearBtn.isExisting()) && !(await hasText('ล้างข้อมูลทั้งหมด'))) {
    return; // ไม่มีข้อมูลอยู่แล้ว (ปุ่มล้างจะไม่แสดง)
  }
  await tap('btn-clear');
  await driver.$('android=new UiSelector().text("ล้าง")').click(); // ปุ่มยืนยันใน Alert
  await driver.pause(500);
  await driver.$('android=new UiSelector().text("OK")').click();   // ปิด Alert "เสร็จแล้ว"
  await driver.pause(500);
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`✅ PASS  ${name}`);
  } catch (e) {
    failed++;
    console.log(`❌ FAIL  ${name}`);
    console.log(`         → ${e.message}`);
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------
try {
 

  console.log('เตรียมข้อมูล: ล้างรายชื่อนักศึกษาทั้งหมด...\n');
  await clearAllStudents();

  // ----- กรอกไม่ครบ / ผิดรูปแบบ -----

  await test('TC01 กดลงทะเบียนโดยไม่กรอกอะไรเลย ต้องขึ้น error ทุกช่อง', async () => {
    await openEmptyForm();
    await submit();
    // ใช้ exact เพราะ 'กรุณากรอกชื่อ' เป็นส่วนหนึ่งของ error ช่องชื่อผู้ใช้ด้วย
    const nameError = await driver.$('android=new UiSelector().text("กรุณากรอกชื่อ")');
    expect(await nameError.isExisting(), 'ไม่เจอ error ช่องชื่อ');
    expect(await hasText('กรุณากรอกนามสกุล'), 'ไม่เจอ error ช่องนามสกุล');
    expect(await hasText('รหัสนักศึกษาให้ครบ 10 หลัก'), 'ไม่เจอ error ช่องรหัสนักศึกษา');
    expect(await hasText('กรุณากรอกชื่อผู้ใช้'), 'ไม่เจอ error ช่องชื่อผู้ใช้');
    expect(await hasText('กรุณากรอกรหัสผ่าน'), 'ไม่เจอ error ช่องรหัสผ่าน');
  });

  await test('TC02 รหัสนักศึกษาไม่ครบ 10 หลัก', async () => {
    await openEmptyForm();
    await fillForm({ ...VALID, studentId: '123456789' });
    await submit();
    expect(await hasText('รหัสนักศึกษาให้ครบ 10 หลัก'), 'ไม่เจอ error รหัสนักศึกษา');
  });

  await test('TC03 ชื่อผู้ใช้สั้นกว่า 4 ตัว', async () => {
    await openEmptyForm();
    await fillForm({ ...VALID, username: 'ab' });
    await submit();
    expect(await hasText('กรุณากรอกชื่อผู้ใช้'), 'ไม่เจอ error ชื่อผู้ใช้');
  });

  await test('TC04 ชื่อผู้ใช้มีภาษาไทย', async () => {
    await openEmptyForm();
    await fillForm({ ...VALID, username: 'สมชาย' });
    await submit();
    expect(await hasText('กรุณากรอกชื่อผู้ใช้'), 'ไม่เจอ error ชื่อผู้ใช้');
  });

  await test('TC05 รหัสผ่านสั้นกว่า 8 ตัว', async () => {
    await openEmptyForm();
    await fillForm({ ...VALID, password: 'abc123', confirm: 'abc123' });
    await submit();
    expect(await hasText('อย่างน้อย 8 ตัวอักษร'), 'ไม่เจอ error รหัสผ่านสั้น');
  });

 
} finally {
  console.log(`\nสรุป: ผ่าน ${passed} / ไม่ผ่าน ${failed} / ทั้งหมด ${passed + failed}`);
  await driver.deleteSession();
}
