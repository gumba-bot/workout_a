const DB_NAME = 'WorkoutLogDB';
const DB_VERSION = 1;

export const dbInfo = {
  db: null
};

// Returns a promise that resolves when DB is open
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject(event.target.error);

    request.onsuccess = (event) => {
      dbInfo.db = event.target.result;
      resolve(dbInfo.db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Exercises Store: id, name, bodyPart, defaultRestTime
      if (!db.objectStoreNames.contains('exercises')) {
        const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
        exerciseStore.createIndex('bodyPart', 'bodyPart', { unique: false });
        exerciseStore.createIndex('name', 'name', { unique: false });
      }

      // Groups Store: id, name, exerciseIds
      if (!db.objectStoreNames.contains('groups')) {
        db.createObjectStore('groups', { keyPath: 'id', autoIncrement: true });
      }

      // Workouts Store: date (YYYY-MM-DD), exercises (Array)
      if (!db.objectStoreNames.contains('workouts')) {
        db.createObjectStore('workouts', { keyPath: 'date' });
      }
    };
  });
}

// Generic add
export async function addRecord(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = dbInfo.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic put (add or update)
export async function putRecord(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = dbInfo.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic get
export async function getRecord(storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = dbInfo.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic getAll
export async function getAllRecords(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = dbInfo.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Ensure default exercises exist for testing
export async function seedDefaults() {
  const exercises = await getAllRecords('exercises');
  if (exercises.length === 0) {
    await addRecord('exercises', { name: '레그 컬', bodyPart: '하체', defaultRestTime: 90 });
    await addRecord('exercises', { name: '바벨 스쾃', bodyPart: '하체', defaultRestTime: 90 });
    await addRecord('exercises', { name: '벤치 프레스', bodyPart: '가슴', defaultRestTime: 90 });
    await addRecord('exercises', { name: '랫 풀 다운', bodyPart: '등', defaultRestTime: 90 });
    await addRecord('exercises', { name: '데드리프트', bodyPart: '등', defaultRestTime: 90 });
    await addRecord('exercises', { name: '레그 익스텐션', bodyPart: '하체', defaultRestTime: 90 });
    await addRecord('exercises', { name: '덤벨 컬', bodyPart: '이두', defaultRestTime: 90 });
    await addRecord('exercises', { name: '해머 컬', bodyPart: '이두', defaultRestTime: 90 });
    await addRecord('exercises', { name: '로프 케이블 푸시다운', bodyPart: '삼두', defaultRestTime: 90 });
    await addRecord('exercises', { name: '시티드 익스텐션 머신(핀)', bodyPart: '삼두', defaultRestTime: 90 });
    await addRecord('exercises', { name: '시티드 컬 머신(핀)', bodyPart: '이두', defaultRestTime: 90 });
    await addRecord('exercises', { name: '바벨 로우', bodyPart: '등', defaultRestTime: 90 });
    await addRecord('exercises', { name: '바벨 스플릿 스쾃', bodyPart: '하체', defaultRestTime: 90 });
    await addRecord('exercises', { name: '카프 레이즈', bodyPart: '하체', defaultRestTime: 90 });
    await addRecord('exercises', { name: '인클라인 덤벨 프레스', bodyPart: '가슴', defaultRestTime: 90 });
    await addRecord('exercises', { name: '체스트 프레스(원판)', bodyPart: '가슴', defaultRestTime: 90 });
    await addRecord('exercises', { name: '케이블 컬', bodyPart: '이두', defaultRestTime: 90 });
    await addRecord('exercises', { name: '딥스', bodyPart: '삼두', defaultRestTime: 90 });
    await addRecord('exercises', { name: '풀업', bodyPart: '등', defaultRestTime: 90 });
    await addRecord('exercises', { name: '암풀 다운', bodyPart: '등', defaultRestTime: 90 });
    await addRecord('exercises', { name: '밀리터리 프레스', bodyPart: '어깨', defaultRestTime: 90 });
    await addRecord('exercises', { name: '사이드 레터럴 레이즈', bodyPart: '어깨', defaultRestTime: 90 });
    await addRecord('exercises', { name: '벤트 오버 레터럴 레이즈', bodyPart: '어깨', defaultRestTime: 90 });
  }
}
