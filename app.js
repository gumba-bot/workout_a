// --- Database Operations ---
const DB_NAME = 'WorkoutLogDB';
const DB_VERSION = 3; // Bumped to 3 to ensure InBody store creation for all users

let dbInfo = { db: null };

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => reject(event.target.error);

    request.onsuccess = (event) => {
      dbInfo.db = event.target.result;
      resolve(dbInfo.db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('exercises')) {
        const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
        exerciseStore.createIndex('bodyPart', 'bodyPart', { unique: false });
        exerciseStore.createIndex('name', 'name', { unique: false });
      }
      if (!db.objectStoreNames.contains('groups')) {
        db.createObjectStore('groups', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('workouts')) {
        db.createObjectStore('workouts', { keyPath: 'date' });
      }
      // Add InBody store (v2/v3 requirement)
      if (!db.objectStoreNames.contains('inbody')) {
        db.createObjectStore('inbody', { keyPath: 'date' });
      }
    };
  });
}

async function addRecord(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = dbInfo.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putRecord(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = dbInfo.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getRecord(storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = dbInfo.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllRecords(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = dbInfo.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function seedDefaults() {
  const exercises = await getAllRecords('exercises');
  if (exercises.length === 0) {
    const defaultExercises = [
      { id: 1, name: '레그 컬', bodyPart: '하체', defaultRestTime: 90 },
      { id: 2, name: '바벨 스쾃', bodyPart: '하체', defaultRestTime: 180 },
      { id: 3, name: '벤치 프레스', bodyPart: '가슴', defaultRestTime: 180 },
      { id: 4, name: '랫 풀 다운', bodyPart: '등', defaultRestTime: 90 },
      { id: 5, name: '데드리프트', bodyPart: '등', defaultRestTime: 180 },
      { id: 6, name: '레그 익스텐션', bodyPart: '하체', defaultRestTime: 90 },
      { id: 7, name: '덤벨 컬', bodyPart: '이두', defaultRestTime: 90 },
      { id: 8, name: '해머 컬', bodyPart: '이두', defaultRestTime: 90 },
      { id: 9, name: '로프 케이블 푸시다운', bodyPart: '삼두', defaultRestTime: 90 },
      { id: 10, name: '시티드 익스텐션 머신(핀)', bodyPart: '삼두', defaultRestTime: 90 },
      { id: 11, name: '시티드 컬 머신(핀)', bodyPart: '이두', defaultRestTime: 90 },
      { id: 12, name: '바벨 로우', bodyPart: '등', defaultRestTime: 90 },
      { id: 13, name: '바벨 스플릿 스쾃', bodyPart: '하체', defaultRestTime: 90 },
      { id: 14, name: '카프 레이즈', bodyPart: '하체', defaultRestTime: 90 },
      { id: 15, name: '인클라인 덤벨 프레스', bodyPart: '가슴', defaultRestTime: 90 },
      { id: 16, name: '체스트 프레스(원판)', bodyPart: '가슴', defaultRestTime: 90 },
      { id: 17, name: '케이블 컬', bodyPart: '이두', defaultRestTime: 90 },
      { id: 18, name: '딥스', bodyPart: '삼두', defaultRestTime: 90 },
      { id: 19, name: '풀업', bodyPart: '등', defaultRestTime: 90 },
      { id: 20, name: '암풀 다운', bodyPart: '등', defaultRestTime: 90 },
      { id: 21, name: '밀리터리 프레스', bodyPart: '어깨', defaultRestTime: 90 },
      { id: 22, name: '사이드 레터럴 레이즈', bodyPart: '어깨', defaultRestTime: 90 },
      { id: 23, name: '벤트 오버 레터럴 레이즈', bodyPart: '어깨', defaultRestTime: 90 },
      { id: 24, name: 'ITY 레이즈', bodyPart: '어깨', defaultRestTime: 90 },
      { id: 25, name: '팔로프 프레스', bodyPart: '코어', defaultRestTime: 90 },
      { id: 26, name: '캣-카우', bodyPart: '코어', defaultRestTime: 90 },
      { id: 27, name: '숄더 브릿지 로테이션', bodyPart: '코어', defaultRestTime: 90 },
      { id: 28, name: '스레드 더 니들', bodyPart: '코어', defaultRestTime: 90 },
      { id: 29, name: '프론트 익스텐션', bodyPart: '코어', defaultRestTime: 90 },
      { id: 30, name: '월 윈드밀', bodyPart: '코어', defaultRestTime: 90 },
      { id: 31, name: '밴드 암풀 다운', bodyPart: '등', defaultRestTime: 90 },
      { id: 32, name: '시티드 로우', bodyPart: '등', defaultRestTime: 90 }
    ];
    for (const ex of defaultExercises) {
      await addRecord('exercises', ex);
    }
  }

  const groups = await getAllRecords('groups');
  if (groups.length === 0) {
    const defaultGroups = [
      { id: 1, name: '하체', exerciseIds: [2, 13, 1, 6, 14, 25] },
      { id: 2, name: '어깨', exerciseIds: [21] },
      { id: 3, name: '등', exerciseIds: [19, 5, 12, 32, 31] },
      { id: 4, name: '가슴/팔', exerciseIds: [3, 15, 18, 8, 11, 10, 24] },
      { id: 5, name: 'YAMAMOTO', exerciseIds: [26, 30, 27, 28, 29] }
    ];
    for (const g of defaultGroups) {
      await addRecord('groups', g);
    }
  }
}
// --- End Database Operations ---

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    // Some mobile browsers might not have Notification but have serviceWorker and showNotification
    if (!('serviceWorker' in navigator)) {
      alert("이 브라우저는 알림 기능을 지원하지 않습니다.\n(iOS 사용자의 경우 '홈 화면에 추가'를 통해 앱을 설치한 뒤 시도해 주세요.)");
      return;
    }
  }

  // Ensure Service Worker is ready before asking for permission on mobile
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.ready;
    } catch (e) {
      console.warn("Service Worker ready wait failed:", e);
    }
  }

  const currentPermission = Notification.permission;
  
  if (currentPermission === 'granted') {
    alert("이미 알림 권한이 허용되어 있습니다.");
    renderSettings();
    return;
  }

  if (currentPermission === 'denied') {
    alert("알림 권한이 '거부(Denied)' 상태입니다. 팝업이 뜨지 않으므로 직접 권한을 재설정해야 합니다.\n\n[해결 방법]\n1. 주소창 옆의 '설정(아이콘)' 클릭\n2. '권한 재설정' 또는 '알림 허용'으로 변경\n3. 앱을 껐다 다시 켜주세요.");
    return;
  }

  // Request permission
  try {
    let result;
    // Check if the modern promise-based API is supported
    const promise = Notification.requestPermission();
    if (promise && promise.then) {
      result = await promise;
    } else {
      // Fallback for very old callback-style environments
      result = await new Promise(resolve => {
        Notification.requestPermission(resolve);
      });
    }

    if (result === "granted") {
      alert("알림 권한이 허용되었습니다!");
      // Show a test notification to ensure it's working
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("굼바의 운동일지", { body: "알림이 성공적으로 설정되었습니다.", icon: "icon.svg" });
      }
    } else if (result === "denied") {
      alert("알림 권한이 거부되었습니다. 설정에서 직접 변경해야 알림을 받을 수 있습니다.");
    }
    renderSettings();
  } catch (err) {
    console.error("Notification permission request error:", err);
    alert("알림 권한 요청 중 오류가 발생했습니다. 브라우저 설정을 확인해 주세요.");
  }
}

function applyTheme() {
  const mode = localStorage.getItem('themeMode') || 'dark';
  const color = localStorage.getItem('themeColor') || 'blue';
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.setAttribute('data-color', color);
}
applyTheme();

let state = {
  view: 'calendar', // calendar, workout, add-exercise, execution, settings, create-group, edit-group, exercise-report-list, workout-report
  date: null,
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  exercises: [],
  workouts: {},
  groups: [],
  addExerciseTab: 'recent', // recent, part, group
  activeExerciseIndex: 0,
  activeSetIndex: 0,
  editingExerciseId: null,
  editingGroupId: null,
  reportExerciseId: null,
  workoutReportTab: 'month',
  timerInterval: null,
  timerTime: 0,
  timerState: 'stopped',
  timerExerciseId: null, // Track which exercise the current timer belongs to

  // Temporary editing state
  tempGroupEditingId: null,
  tempGroupExerciseIds: [],
  tempGroupName: '',

  // 5/3/1 Calculator state
  fiveThreeOneRms: JSON.parse(localStorage.getItem('fiveThreeOneRms')) || { squat: 0, deadlift: 0, bench: 0, ohp: 0 },
  fiveThreeOneOption: localStorage.getItem('fiveThreeOneOption') || 'A', // A: 4주, B: 7주

  inbodyRecords: [], // { date, height, weight, skeletalMuscle, bodyFatMass, bodyFatPercent, bmi, score }
  oneRmInput: JSON.parse(localStorage.getItem('oneRmInput')) || { weight: 0, reps: 0 }
};

function getHistoryState() {
  return {
    view: state.view,
    date: state.date,
    calendarYear: state.calendarYear,
    calendarMonth: state.calendarMonth,
    addExerciseTab: state.addExerciseTab,
    addExerciseSourceView: state.addExerciseSourceView,
    activeExerciseIndex: state.activeExerciseIndex,
    activeSetIndex: state.activeSetIndex,
    editingExerciseId: state.editingExerciseId,
    editingGroupId: state.editingGroupId,
    reportExerciseId: state.reportExerciseId,
    workoutReportTab: state.workoutReportTab,
    reportDate: state.reportDate
  };
}

function navigateTo(view, params = {}, push = true) {
  state.view = view;
  if (params) {
    Object.assign(state, params);
  }
  if (push) {
    history.pushState(getHistoryState(), '', '#' + view);
  }
  render();
}

window.addEventListener('popstate', (event) => {
  if (event.state) {
    Object.assign(state, event.state);
  } else {
    // Fallback: If state is missing, try to determine view from hash
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      state.view = hash;
    } else {
      state.view = 'calendar';
    }
  }
  render();
});

let dragData = {
  dragEl: null,
  placeholder: null,
  dragTimer: null,
  isDragging: false,
  offsetY: 0,
  offsetX: 0
};

document.addEventListener('touchmove', handleGlobalMove, { passive: false });
document.addEventListener('mousemove', handleGlobalMove, { passive: false });
document.addEventListener('touchend', handleGlobalEnd);
document.addEventListener('mouseup', handleGlobalEnd);

function handleGlobalMove(e) {
  if (!dragData.isDragging || !dragData.dragEl || !dragData.placeholder) return;
  e.preventDefault();
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  dragData.dragEl.style.top = (clientY - dragData.offsetY) + 'px';
  dragData.dragEl.style.left = (clientX - dragData.offsetX) + 'px';
  const list = document.querySelector('.workout-list');
  const siblings = [...list.querySelectorAll('.exercise-card:not(.placeholder)')].filter(c => c !== dragData.dragEl);
  const nextSibling = siblings.find(sibling => {
    const box = sibling.getBoundingClientRect();
    return clientY < box.top + box.height / 2;
  });
  if (nextSibling) {
    list.insertBefore(dragData.placeholder, nextSibling);
  } else {
    list.appendChild(dragData.placeholder);
  }
}

async function handleGlobalEnd(e) {
  if (!dragData.isDragging || !dragData.dragEl) return;
  const list = document.querySelector('.workout-list');
  if (dragData.placeholder && dragData.placeholder.parentNode) {
    dragData.placeholder.parentNode.insertBefore(dragData.dragEl, dragData.placeholder);
    dragData.placeholder.remove();
  }
  dragData.dragEl.style.position = '';
  dragData.dragEl.style.margin = '';
  dragData.dragEl.style.width = '';
  dragData.dragEl.style.left = '';
  dragData.dragEl.style.top = '';
  dragData.dragEl.style.zIndex = '';
  dragData.dragEl.style.boxShadow = '';
  dragData.dragEl.style.opacity = '';
  dragData.dragEl.style.transform = '';
  dragData.dragEl.style.transition = '';

  if (list && state.workouts[state.date]) {
    const newCards = [...list.querySelectorAll('.exercise-card')];
    const newOrderIndices = newCards.map(c => parseInt(c.getAttribute('data-ex'))).filter(n => !isNaN(n));
    const w = state.workouts[state.date];
    const oldExercises = [...w.exercises];
    w.exercises = newOrderIndices.map(idx => oldExercises[idx]);
    await saveCurrentWorkout();
    renderWorkout();
  }
  dragData.isDragging = false;
  dragData.dragEl = null;
  dragData.placeholder = null;
}

const appEl = document.getElementById('app');

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function roundToStep(value, step = 2.5) {
  return Math.round(value / step) * step;
}

async function loadData() {
  await initDB();
  await seedDefaults();
  state.exercises = await getAllRecords('exercises');
  state.groups = await getAllRecords('groups');
  state.inbodyRecords = await getAllRecords('inbody');
  state.inbodyRecords.sort((a, b) => b.date.localeCompare(a.date)); // Newest first by default
  const allWorkouts = await getAllRecords('workouts');
  allWorkouts.forEach(w => {
    state.workouts[w.date] = w;
  });
}

async function startApp() {
  await loadData();
  state.date = formatDate(new Date());

  // Initialize from hash if present, otherwise default to calendar
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) state.view = initialHash;

  // Set initial history state
  history.replaceState(getHistoryState(), '', '#' + state.view);
  render();
}

// ----- RENDERING ROUTER -----
function render() {
  appEl.innerHTML = '';
  appEl.className = 'fade-enter'; // trigger animation
  setTimeout(() => appEl.classList.remove('fade-enter'), 300);

  if (state.view === 'calendar') renderCalendar();
  else if (state.view === 'workout') renderWorkout();
  else if (state.view === 'add-exercise') renderAddExercise();
  else if (state.view === 'execution') renderExecution();
  else if (state.view === 'settings') renderSettings();
  else if (state.view === 'create-group') renderCreateGroup();
  else if (state.view === 'edit-group') renderEditGroup();
  else if (state.view === 'edit-exercise') renderEditExercise();
  else if (state.view === 'report') renderReport();
  else if (state.view === 'exercise-report-list') renderExerciseReportList();
  else if (state.view === 'workout-report') renderWorkoutReport();
  else if (state.view === 'tutorial') renderTutorial();
  else if (state.view === 'five-three-one') renderFiveThreeOne();
  else if (state.view === 'one-rm-calculator') renderOneRmCalculator();
  else if (state.view === 'inbody-list') renderInBodyList();
  else if (state.view === 'add-inbody') renderAddInBody();

  setTimeout(autoFitText, 0); // Allow DOM to paint before measuring
}

function autoFitText() {
  // Target all text-heavy or button elements
  const selectors = 'button, h1, h2, h3, .exercise-item-title, .exercise-item-subtitle, .info-text, .rest-timer-text, .tab, .calendar-day, label';
  document.querySelectorAll(selectors).forEach(el => {
    el.style.whiteSpace = 'nowrap';
    el.style.fontSize = ''; // reset to original CSS size

    let size = parseFloat(window.getComputedStyle(el).fontSize);
    let loops = 0;

    // Prevent infinite loop, scale down 0.5px at a time until fits
    while (el.scrollWidth > el.clientWidth && size > 8 && loops < 50) {
      size -= 0.5;
      el.style.fontSize = size + 'px';
      loops++;
    }
  });
}

// ----- VIEWS -----

// 1. Settings View
// --- Data Export/Import (Android 앱 호환 JSON 포맷) ---
async function exportAllData() {
  const exercises = await getAllRecords('exercises');
  const groups = await getAllRecords('groups');
  const workouts = await getAllRecords('workouts');

  const exportObj = {
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises,
    groups,
    workouts
  };

  const jsonStr = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const today = formatDate(new Date());
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout_backup_${today}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert('백업 파일이 다운로드되었습니다.');
}

async function importAllData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.exercises || !data.workouts) {
        alert('유효하지 않은 백업 파일입니다.');
        return;
      }

      if (!confirm('기존 데이터를 모두 덮어씁니다. 계속하시겠습니까?')) return;

      // Clear and restore each store
      const storeNames = ['exercises', 'groups', 'workouts'];
      for (const storeName of storeNames) {
        await new Promise((resolve, reject) => {
          const tx = dbInfo.db.transaction([storeName], 'readwrite');
          const store = tx.objectStore(storeName);
          const clearReq = store.clear();
          clearReq.onsuccess = () => resolve();
          clearReq.onerror = () => reject(clearReq.error);
        });

        const records = data[storeName] || [];
        for (const record of records) {
          await putRecord(storeName, record);
        }
      }

      // Reload state
      await loadData();
      alert('데이터가 복원되었습니다.');
      navigateTo('calendar');
    } catch (err) {
      alert('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
    }
  });

  input.click();
}
// --- End Data Export/Import ---

function renderSettings() {
  const currentMode = localStorage.getItem('themeMode') || 'dark';
  const currentColor = localStorage.getItem('themeColor') || 'blue';

  const colors = [
    { id: 'red', hex: '#EF4444' },
    { id: 'orange', hex: '#F97316' },
    { id: 'yellow', hex: '#EAB308' },
    { id: 'green', hex: '#10B981' },
    { id: 'blue', hex: '#3B82F6' },
    { id: 'indigo', hex: '#6366F1' },
    { id: 'violet', hex: '#8B5CF6' }
  ];

  let colorsHtml = '';
  colors.forEach(c => {
    colorsHtml += `<div class="color-swatch ${currentColor === c.id ? 'active' : ''}" data-color="${c.id}" style="background-color: ${c.hex}"></div>`;
  });

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="closeSettingsBtn"><i class="ph ph-x"></i></button>
      <h1>설정</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-x"></i></button>
    </header>
    <main>
      <div class="glass-panel" style="padding: 20px;">
        <div class="settings-section">
          <div class="settings-title">테마 모드</div>
          <div class="mode-toggle">
            <div class="mode-btn ${currentMode === 'light' ? 'active' : ''}" data-mode="light">라이트 모드</div>
            <div class="mode-btn ${currentMode === 'dark' ? 'active' : ''}" data-mode="dark">다크 모드</div>
          </div>
        </div>
        <div class="settings-section">
          <div class="settings-title">테마 색상 (무지개 7원색)</div>
          <div class="color-picker-grid">
            ${colorsHtml}
          </div>
        </div>
        <div class="settings-section">
          <div class="settings-title">운동 설정 및 통계</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-secondary" id="manageExGrpBtn" style="justify-content: flex-start; padding: 10px; font-size: 0.95rem;">
              <i class="ph ph-list-dashes" style="font-size: 1.2rem; min-width: 24px;"></i> 종목 / 그룹 관리
            </button>
            <button class="btn btn-secondary" id="openFiveThreeOneBtn" style="justify-content: flex-start; padding: 10px; font-size: 0.95rem;">
              <i class="ph ph-calculator" style="font-size: 1.2rem; min-width: 24px;"></i> 5/3/1 계산기
            </button>
            <button class="btn btn-secondary" id="openOneRmCalcBtn" style="justify-content: flex-start; padding: 10px; font-size: 0.95rem;">
              <i class="ph ph-target" style="font-size: 1.2rem; min-width: 24px;"></i> 1RM 추정
            </button>
            <button class="btn btn-secondary" id="openInBodyBtn" style="justify-content: flex-start; padding: 10px; font-size: 0.95rem;">
              <i class="ph ph-heartbeat" style="font-size: 1.2rem; min-width: 24px;"></i> 인바디 기록 관리
            </button>
            <button class="btn btn-secondary" id="openWorkoutReportBtn" style="justify-content: flex-start; padding: 10px; font-size: 0.95rem;">
              <i class="ph ph-chart-bar" style="font-size: 1.2rem; min-width: 24px;"></i> 종합 운동 리포트
            </button>
            <button class="btn btn-secondary" id="openExerciseReportBtn" style="justify-content: flex-start; padding: 10px; font-size: 0.95rem;">
              <i class="ph ph-chart-line-up" style="font-size: 1.2rem; min-width: 24px;"></i> 개별 종목 리포트
            </button>
          </div>
        </div>
        <div class="settings-section">
          <div class="settings-title">데이터 관리</div>
          <div class="data-mgmt-buttons">
            <button class="btn data-mgmt-btn" id="exportDataBtn">
              <i class="ph ph-download-simple"></i> 데이터 백업
            </button>
            <button class="btn data-mgmt-btn" id="importDataBtn">
              <i class="ph ph-upload-simple"></i> 데이터 복원
            </button>
          </div>
        </div>
        <div class="settings-section">
          <div class="settings-title">알림 및 소리</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.9rem; color: var(--text-primary);">알림 권한 상태</span>
              <span style="font-size: 0.85rem; font-weight: bold; color: ${Notification.permission === 'granted' ? 'var(--success)' : 'var(--danger)'}">
                ${Notification.permission === 'granted' ? '허용됨' : (Notification.permission === 'denied' ? '거부됨' : '미정')}
              </span>
            </div>
            ${Notification.permission !== 'granted' ? `
              <button class="btn btn-secondary" id="requestNotiPermBtn" style="padding: 10px; font-size: 0.9rem;">
                알림 권한 요청하기
              </button>
            ` : ''}
            <button class="btn btn-secondary" id="testNotiBtn" style="padding: 10px; font-size: 0.9rem;">
              알림 및 비프음 테스트
            </button>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 4px 0 0 0; line-height: 1.4;">
              * 모바일에서 소리가 나지 않을 경우 기기의 무음 모드를 해제해 주세요.<br>
              * 백그라운드 알림을 위해 '홈 화면에 추가'하여 사용하는 것이 권장됩니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  `;

  document.getElementById('closeSettingsBtn').addEventListener('click', () => {
    navigateTo('calendar');
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = e.currentTarget.getAttribute('data-mode');
      localStorage.setItem('themeMode', mode);
      applyTheme();
      renderSettings();
    });
  });

  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      const col = e.currentTarget.getAttribute('data-color');
      localStorage.setItem('themeColor', col);
      applyTheme();
      renderSettings();
    });
  });

  document.getElementById('exportDataBtn').addEventListener('click', () => exportAllData());
  document.getElementById('importDataBtn').addEventListener('click', () => importAllData());

  document.getElementById('openTutorialBtn').addEventListener('click', () => {
    navigateTo('tutorial');
  });

  document.getElementById('manageExGrpBtn').addEventListener('click', () => {
    navigateTo('add-exercise', { addExerciseSourceView: 'settings' });
  });
  document.getElementById('openFiveThreeOneBtn').addEventListener('click', () => {
    navigateTo('five-three-one');
  });
  document.getElementById('openOneRmCalcBtn').addEventListener('click', () => {
    navigateTo('one-rm-calculator');
  });
  document.getElementById('openInBodyBtn').addEventListener('click', () => {
    navigateTo('inbody-list');
  });
  document.getElementById('openWorkoutReportBtn').addEventListener('click', () => {
    navigateTo('workout-report', { reportDate: toDateStr(new Date()) });
  });
  document.getElementById('openExerciseReportBtn').addEventListener('click', () => {
    navigateTo('exercise-report-list');
  });


  const requestNotiBtn = document.getElementById('requestNotiPermBtn');
  if (requestNotiBtn) {
    requestNotiBtn.addEventListener('click', () => {
      requestNotificationPermission();
    });
  }

  document.getElementById('testNotiBtn').addEventListener('click', () => {
    initAudio();
    playTimerEndNotification();
  });
}

// 2. Calendar View
function renderCalendar() {
  const year = state.calendarYear;
  const month = state.calendarMonth;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  let gridHtml = '';
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  daysOfWeek.forEach(day => {
    gridHtml += `<div class="calendar-day-label">${day}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    gridHtml += `<div class="calendar-day empty"></div>`;
  }

  const todayStr = formatDate(new Date());
  const now = new Date();
  const isCurrentMonth = (year === now.getFullYear() && month === now.getMonth());

  for (let day = 1; day <= daysInMonth; day++) {
    const curDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const w = state.workouts[curDateStr];
    const hasWorkout = !!(w && w.exercises && w.exercises.length > 0);

    let isWorkoutIncomplete = false;
    if (hasWorkout) {
      isWorkoutIncomplete = !w.exercises.every(ex => ex.sets.length > 0 && ex.sets.every(set => set.completed));
    }

    const isToday = isCurrentMonth && curDateStr === todayStr;
    const isSelected = curDateStr === state.date;

    const classes = `calendar-day ${isToday ? 'today' : ''} ${hasWorkout ? 'has-workout' : ''} ${isWorkoutIncomplete ? 'incomplete' : ''} ${isSelected ? 'selected' : ''}`;

    gridHtml += `<div class="calendar-day ${classes}" data-date="${curDateStr}">${day}</div>`;
  }

  const selectedWorkout = state.workouts[state.date];
  let previewHtml = '';
  if (selectedWorkout && selectedWorkout.exercises.length > 0) {
    previewHtml += `<div class="glass-panel" style="padding: 16px; margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 1rem; margin: 0;">오늘의 종목</h3>
        <div style="display: flex; gap: 4px;">
          <button class="icon-btn" id="calToggleAllBtn" aria-label="일괄 완료/취소" title="일괄 완료/취소" style="padding: 4px;">
            <i class="ph ph-check-square"></i>
          </button>
          <button class="icon-btn" id="calDeleteAllBtn" aria-label="전체 삭제" title="전체 삭제" style="padding: 4px;">
            <i class="ph ph-trash" style="color: var(--danger);"></i>
          </button>
        </div>
      </div>
      <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-primary); font-size: 0.95rem;">`;

    selectedWorkout.exercises.forEach(exItem => {
      const dictEx = state.exercises.find(e => e.id === exItem.exerciseId);
      const exName = dictEx ? dictEx.name : '알 수 없는 종목';
      const exCompleted = exItem.sets.length > 0 && exItem.sets.every(s => s.completed);
      const dotColor = exCompleted ? 'var(--success)' : 'var(--danger)';
      previewHtml += `<li style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
        <div style="background: ${dotColor}; width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 4px ${dotColor};"></div>
        <span style="flex: 1;">${exName}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">${exItem.sets.length}세트</span>
      </li>`;
    });
    previewHtml += `</ul></div>`;
  } else {
    previewHtml = `<div class="info-text" style="margin-top: 20px;">이 날짜에 기록된 운동이 없습니다.</div>`;
  }

  appEl.innerHTML = `
    <header>
      <div style="width:40px"></div>
      <h1>굼바의 운동일지</h1>
      <button class="icon-btn" id="settingsBtn"><i class="ph ph-gear"></i></button>
    </header>
    <main style="display: flex; flex-direction: column; height: 100%;">
      <div class="glass-panel" style="padding: 20px; flex-shrink: 0;">
        <div class="calendar-header">
          <button class="icon-btn cal-nav-btn" id="calPrevBtn"><i class="ph ph-caret-left"></i></button>
          <h2>${year}년 ${month + 1}월</h2>
          <button class="icon-btn cal-nav-btn" id="calNextBtn"><i class="ph ph-caret-right"></i></button>
        </div>
        <div class="calendar-grid" id="calendarGrid">
          ${gridHtml}
        </div>
      </div>
      
      <div style="flex: 1; overflow-y: auto;">
        ${previewHtml}
      </div>

      <div style="margin-top: auto; padding-top: 20px;">
        <button class="btn btn-primary" id="startWorkoutBtn">
          ${state.workouts[state.date] ? '운동 이어서 하기' : '새로운 루틴 시작'}
        </button>
      </div>
    </main>
  `;

  document.getElementById('calendarGrid').addEventListener('click', (e) => {
    if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('empty')) {
      const clickedDate = e.target.getAttribute('data-date');
      if (state.date === clickedDate) {
        // Double click (or click on already selected) -> Go to workout
        navigateTo('workout');
      } else {
        state.date = clickedDate;
        render(); // re-render to show selection
      }
    }
  });

  document.getElementById('startWorkoutBtn').addEventListener('click', () => {
    navigateTo('workout');
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    navigateTo('settings');
  });

  document.getElementById('calPrevBtn').addEventListener('click', () => {
    state.calendarMonth--;
    if (state.calendarMonth < 0) {
      state.calendarMonth = 11;
      state.calendarYear--;
    }
    renderCalendar();
  });

  document.getElementById('calNextBtn').addEventListener('click', () => {
    state.calendarMonth++;
    if (state.calendarMonth > 11) {
      state.calendarMonth = 0;
      state.calendarYear++;
    }
    renderCalendar();
  });

  const calToggleAllBtn = document.getElementById('calToggleAllBtn');
  if (calToggleAllBtn) {
    calToggleAllBtn.addEventListener('click', async () => {
      const w = state.workouts[state.date];
      if (!w) return;
      const hasIncomplete = w.exercises.some(ex => ex.sets.some(s => !s.completed));
      const targetState = hasIncomplete ? true : false;
      w.exercises.forEach(ex => ex.sets.forEach(s => s.completed = targetState));
      await saveCurrentWorkout();
      renderCalendar(); // Refresh calendar to update dots and preview
    });
  }

  const calDeleteAllBtn = document.getElementById('calDeleteAllBtn');
  if (calDeleteAllBtn) {
    calDeleteAllBtn.addEventListener('click', async () => {
      const w = state.workouts[state.date];
      if (!w) return;
      if (confirm('오늘 캘린더에 기록한 모든 종목을 일괄 삭제하시겠습니까?')) {
        w.exercises = [];
        await saveCurrentWorkout();
        renderCalendar(); // Refresh calendar to clear preview
      }
    });
  }
}

// 3. Workout View
async function saveCurrentWorkout() {
  if (state.workouts[state.date]) {
    await putRecord('workouts', state.workouts[state.date]);
  }
}

function renderWorkout() {
  let w = state.workouts[state.date];
  if (!w) {
    w = { date: state.date, exercises: [] };
    state.workouts[state.date] = w;
  }

  // Save scroll position before re-render
  const mainEl = appEl.querySelector('main');
  const scrollTop = mainEl ? mainEl.scrollTop : 0;

  let listHtml = '';

  if (w.exercises.length === 0) {
    listHtml = `<div class="info-text" style="margin: 40px 0;">아직 추가된 운동이 없습니다.</div>`;
  } else {
    w.exercises.forEach((exItem, exIdx) => {
      const dictEx = state.exercises.find(e => e.id === exItem.exerciseId);
      const exName = dictEx ? dictEx.name : '알 수 없는 종목';

      let setsHtml = '';
      exItem.sets.forEach((set, setIdx) => {
        let statusClass = set.completed ? 'completed' : 'pending';
        let statusIcon = set.completed ? '<i class="ph ph-check-bold"></i>' : '';

        setsHtml += `
          <div class="set-row">
            <div class="set-status ${statusClass}" data-ex="${exIdx}" data-set="${setIdx}">
              ${statusIcon}
            </div>
            <div class="set-number">${setIdx + 1}세트</div>
            <div class="inline-input-group">
              <input type="number" class="inline-input weight-input" data-ex="${exIdx}" data-set="${setIdx}" value="${set.weight}" step="2.5" min="0">
              <span class="unit-label">kg</span>
            </div>
            <div class="inline-input-group">
              <input type="number" class="inline-input reps-input" data-ex="${exIdx}" data-set="${setIdx}" value="${set.reps}" min="0">
              <span class="unit-label">회</span>
            </div>
            <button class="action-btn del-set-btn" data-ex="${exIdx}" data-set="${setIdx}">
              <i class="ph ph-minus-circle" style="font-size: 1.2rem; color: var(--danger); pointer-events: none;"></i>
            </button>
          </div>
        `;
      });

      listHtml += `
        <div class="glass-panel exercise-card" data-ex="${exIdx}">
          <div class="exercise-header">
            <div class="exercise-name" style="flex: 1;">
              ${exName}
            </div>
            <button class="action-btn report-ex-btn" data-ex="${exIdx}" style="margin-right: 8px;" aria-label="기록 보기">
              <i class="ph ph-chart-bar" style="font-size: 1.3rem; color: var(--accent-primary); pointer-events: none;"></i>
            </button>
            <button class="action-btn toggle-ex-sets-btn" data-ex="${exIdx}" style="margin-right: 8px;" aria-label="해당 종목 전체완료">
              <i class="ph ph-check-square-offset" style="font-size: 1.3rem; color: var(--success); pointer-events: none;"></i>
            </button>
            <button class="action-btn del-ex-btn" data-ex="${exIdx}" style="margin-right: 12px;" aria-label="종목 삭제">
              <i class="ph ph-trash" style="font-size: 1.3rem; color: var(--danger); pointer-events: none;"></i>
            </button>
            <button class="chevron-btn goto-exec-btn" data-ex="${exIdx}">
              <i class="ph ph-caret-right" style="pointer-events: none;"></i>
            </button>
          </div>
          <div class="sets-container">
            ${setsHtml}
            <div class="add-set-row">
              <button class="btn add-set-btn" data-ex="${exIdx}" style="width: auto; padding: 6px 16px;">
                <i class="ph ph-plus" style="pointer-events: none;"></i> 세트 추가
              </button>
            </div>
          </div>
        </div>
      `;
    });
  }

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="backToCalBtn"><i class="ph ph-arrow-left" style="pointer-events: none;"></i></button>
      <h1 style="flex: 1; text-align: center;">${state.date}</h1>
      <div style="display: flex; gap: 4px;">
        <button class="icon-btn" id="toggleAllBtn" aria-label="일괄 완료/취소" title="일괄 완료/취소">
          <i class="ph ph-check-square" style="pointer-events: none;"></i>
        </button>
        <button class="icon-btn" id="deleteAllBtn" aria-label="전체 삭제" title="전체 삭제">
          <i class="ph ph-trash" style="color: var(--danger); pointer-events: none;"></i>
        </button>
      </div>
    </header>
    <main>
      <div class="workout-list">
        ${listHtml}
      </div>
      <button class="btn btn-primary" id="addExBtn" style="margin-top: 20px;">
        <i class="ph ph-plus-circle" style="pointer-events: none;"></i> 종목 추가
      </button>
    </main>
  `;

  // Restore scroll position after re-render
  const newMainEl = appEl.querySelector('main');
  if (newMainEl) {
    newMainEl.scrollTop = scrollTop;
  }

  // Event Listeners
  document.getElementById('backToCalBtn').addEventListener('click', () => {
    navigateTo('calendar');
  });

  const addExBtn = document.getElementById('addExBtn');
  if (addExBtn) addExBtn.addEventListener('click', () => {
    navigateTo('add-exercise', { addExerciseSourceView: 'workout' });
  });

  const toggleAllBtn = document.getElementById('toggleAllBtn');
  if (toggleAllBtn) toggleAllBtn.addEventListener('click', async () => {
    const hasIncomplete = w.exercises.some(ex => ex.sets.some(s => !s.completed));
    const targetState = hasIncomplete ? true : false;
    w.exercises.forEach(ex => ex.sets.forEach(s => s.completed = targetState));
    await saveCurrentWorkout();
    renderWorkout();
  });

  const deleteAllBtn = document.getElementById('deleteAllBtn');
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', async () => {
      if (confirm('오늘 기록한 모든 종목을 일괄 삭제하시겠습니까?')) {
        w.exercises = [];
        await saveCurrentWorkout();
        renderWorkout();
      }
    });
  }

  // Adding Set
  document.querySelectorAll('.add-set-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const exIdx = parseInt(e.currentTarget.getAttribute('data-ex'));
      const ex = w.exercises[exIdx];
      let newWeight = 0; let newReps = 0;
      if (ex.sets.length > 0) {
        const last = ex.sets[ex.sets.length - 1];
        newWeight = last.weight; newReps = last.reps;
      }
      ex.sets.push({ weight: newWeight, reps: newReps, completed: null });
      await saveCurrentWorkout();
      renderWorkout();
    });
  });

  // Deleting Set
  document.querySelectorAll('.del-set-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const exIdx = parseInt(e.currentTarget.getAttribute('data-ex'));
      const setIdx = parseInt(e.currentTarget.getAttribute('data-set'));
      w.exercises[exIdx].sets.splice(setIdx, 1);
      await saveCurrentWorkout();
      renderWorkout();
    });
  });

  // Deleting Exercise
  document.querySelectorAll('.del-ex-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const exIdx = parseInt(e.currentTarget.getAttribute('data-ex'));
      if (confirm('이 종목을 오늘의 운동 일지에서 완전히 삭제하시겠습니까?')) {
        w.exercises.splice(exIdx, 1);
        await saveCurrentWorkout();
        renderWorkout();
      }
    });
  });

  // Open Exercise Report
  document.querySelectorAll('.report-ex-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const exIdx = parseInt(e.currentTarget.getAttribute('data-ex'));
      const activeEx = w.exercises[exIdx];
      navigateTo('report', { reportExerciseId: activeEx.exerciseId });
    });
  });

  // Toggle all sets inside an Exercise
  document.querySelectorAll('.toggle-ex-sets-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const exIdx = parseInt(e.currentTarget.getAttribute('data-ex'));
      const ex = w.exercises[exIdx];
      const hasIncomplete = ex.sets.some(s => !s.completed);
      const targetState = hasIncomplete ? true : false;
      ex.sets.forEach(s => s.completed = targetState);
      await saveCurrentWorkout();
      renderWorkout();
    });
  });

  // Toggle Status
  document.querySelectorAll('.set-status').forEach(el => {
    el.addEventListener('click', async (e) => {
      const exIdx = parseInt(e.currentTarget.getAttribute('data-ex'));
      const setIdx = parseInt(e.currentTarget.getAttribute('data-set'));
      const set = w.exercises[exIdx].sets[setIdx];

      set.completed = !set.completed;

      await saveCurrentWorkout();
      renderWorkout();
    });
  });

  // Input changes
  document.querySelectorAll('.weight-input, .reps-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const exIdx = parseInt(e.target.getAttribute('data-ex'));
      const setIdx = parseInt(e.target.getAttribute('data-set'));
      const val = parseFloat(e.target.value) || 0;
      if (e.target.classList.contains('weight-input')) {
        w.exercises[exIdx].sets[setIdx].weight = val;
      } else {
        w.exercises[exIdx].sets[setIdx].reps = val;
      }
      await saveCurrentWorkout();
    });
  });

  // Go to Execution
  document.querySelectorAll('.goto-exec-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exIdx = parseInt(e.currentTarget.getAttribute('data-ex'));
      const activeEx = state.workouts[state.date].exercises[exIdx];
      const firstIncompleteIdx = activeEx.sets.findIndex(s => !s.completed);

      state.activeExerciseIndex = exIdx;
      state.activeSetIndex = firstIncompleteIdx !== -1 ? firstIncompleteIdx : 0;
      state.timerState = 'stopped';
      navigateTo('execution');
    });
  });

  // Long press to drag
  document.querySelectorAll('.exercise-card').forEach(card => {
    let startY = 0, startX = 0;

    const handleStart = (e) => {
      if (['INPUT', 'BUTTON', 'I'].includes(e.target.tagName)) return;
      if (e.target.closest('.sets-container') || e.target.closest('.btn')) return;
      if (e.target.closest('.action-btn') || e.target.closest('.chevron-btn') || e.target.closest('.del-ex-btn') || e.target.closest('.del-set-btn') || e.target.closest('.toggle-ex-sets-btn')) return;

      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      startY = clientY; startX = clientX;

      dragData.dragTimer = setTimeout(() => {
        dragData.isDragging = true;
        dragData.dragEl = card;

        const rect = card.getBoundingClientRect();
        dragData.offsetX = clientX - rect.left;
        dragData.offsetY = clientY - rect.top;

        dragData.placeholder = document.createElement('div');
        dragData.placeholder.className = 'glass-panel exercise-card placeholder';
        dragData.placeholder.style.height = rect.height + 'px';
        dragData.placeholder.style.opacity = '0.3';
        dragData.placeholder.style.border = '2px dashed var(--accent-primary)';
        card.parentNode.insertBefore(dragData.placeholder, card);

        card.style.position = 'fixed';
        card.style.margin = '0';
        card.style.width = rect.width + 'px';
        card.style.left = rect.left + 'px';
        card.style.top = rect.top + 'px';
        card.style.zIndex = '9999';
        card.style.boxShadow = 'var(--shadow-glow)';
        card.style.opacity = '0.9';
        card.style.transform = 'scale(1.02)';
        card.style.transition = 'none';

        if ("vibrate" in navigator) navigator.vibrate(50);
      }, 500);
    };

    const handleCancel = () => {
      clearTimeout(dragData.dragTimer);
    };

    const handleMoveLocal = (e) => {
      if (dragData.isDragging) return;
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      if (Math.abs(currentY - startY) > 10 || Math.abs(currentX - startX) > 10) {
        clearTimeout(dragData.dragTimer);
      }
    };

    card.addEventListener('touchstart', handleStart, { passive: true });
    card.addEventListener('mousedown', handleStart);
    card.addEventListener('touchend', handleCancel);
    card.addEventListener('touchcancel', handleCancel);
    card.addEventListener('mouseup', handleCancel);
    card.addEventListener('mouseleave', handleCancel);
    card.addEventListener('touchmove', handleMoveLocal, { passive: true });
    card.addEventListener('mousemove', handleMoveLocal, { passive: true });
  });
}

// 4. Add Exercise View
function renderAddExercise() {
  let listHtml = '';

  if (state.addExerciseTab === 'recent') {
    // Show all exercises by recent creation (reverse order)
    const recentExercises = [...state.exercises].reverse();
    recentExercises.forEach(ex => {
      listHtml += `
        <div class="exercise-item" data-id="${ex.id}" data-type="single">
          <div>
            <div class="exercise-item-title">${ex.name}</div>
            <div class="exercise-item-subtitle">${ex.bodyPart || '미지정'}</div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="action-btn edit-ex-btn" data-id="${ex.id}" style="font-size:1.2rem; padding:4px;">
              <i class="ph ph-pencil-simple"></i>
            </button>
            <i class="ph ph-plus-circle" style="font-size: 1.5rem; color: var(--accent-primary);"></i>
          </div>
        </div>
      `;
    });
  } else if (state.addExerciseTab === 'part') {
    // Group by body part
    const bodyParts = {};
    state.exercises.forEach(ex => {
      if (!bodyParts[ex.bodyPart]) bodyParts[ex.bodyPart] = [];
      bodyParts[ex.bodyPart].push(ex);
    });

    Object.keys(bodyParts).forEach(part => {
      const partSafe = part.replace(/\s+/g, '-');
      listHtml += `
        <div class="part-header" data-target="part-${partSafe}" style="padding: 12px 16px; background: var(--surface-hover); font-weight: bold; color: var(--accent-primary); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
          <span>${part} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">(${bodyParts[part].length})</span></span>
          <i class="ph ph-caret-down part-chevron" style="transition: transform 0.2s;"></i>
        </div>
        <div class="part-content" id="part-${partSafe}" style="display: none;">
      `;
      bodyParts[part].forEach(ex => {
        listHtml += `
          <div class="exercise-item" data-id="${ex.id}" data-type="single">
            <div>
              <div class="exercise-item-title">${ex.name}</div>
              <div class="exercise-item-subtitle">${ex.bodyPart || '미지정'}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="action-btn edit-ex-btn" data-id="${ex.id}" style="font-size:1.2rem; padding:4px;">
                <i class="ph ph-pencil-simple"></i>
              </button>
              <i class="ph ph-plus-circle" style="font-size: 1.5rem; color: var(--accent-primary);"></i>
            </div>
          </div>
        `;
      });
      listHtml += `</div>`;
    });
  } else if (state.addExerciseTab === 'group') {
    // Show custom groups
    if (state.groups.length === 0) {
      listHtml += `<div class="info-text" style="padding: 20px;">만들어진 그룹이 없습니다.</div>`;
    } else {
      state.groups.forEach(group => {
        const exCount = group.exerciseIds ? group.exerciseIds.length : 0;
        listHtml += `
          <div class="exercise-item" data-id="${group.id}" data-type="group">
            <div>
              <div class="exercise-item-title">${group.name}</div>
              <div class="exercise-item-subtitle">${exCount}개 종목</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="action-btn edit-grp-btn" data-id="${group.id}" style="font-size:1.2rem; padding:4px;">
                <i class="ph ph-pencil-simple" style="pointer-events: none;"></i>
              </button>
              <i class="ph ph-plus-circle" style="font-size: 1.5rem; color: var(--accent-primary);"></i>
            </div>
          </div>
        `;
      });
    }
  }

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="closeAddBtn"><i class="ph ph-x"></i></button>
      <h1>운동 추가</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-x"></i></button>
    </header>
    <main>
      <div class="tabs">
        <div class="tab ${state.addExerciseTab === 'recent' ? 'active' : ''}" data-tab="recent">최근순</div>
        <div class="tab ${state.addExerciseTab === 'part' ? 'active' : ''}" data-tab="part">부위별</div>
        <div class="tab ${state.addExerciseTab === 'group' ? 'active' : ''}" data-tab="group">그룹별</div>
      </div>
      
      <div class="glass-panel" style="display:flex; flex-direction:column; max-height: 45vh; overflow: hidden;">
        <div style="overflow-y: auto; flex: 1;">
          ${listHtml}
        </div>
      </div>
      
      ${state.addExerciseTab === 'group' ? `
      <div class="glass-panel" style="padding: 16px; margin-top: 15px;">
        <button class="btn btn-primary" id="goCreateGroupBtn">새 그룹 만들기</button>
      </div>` : `
      <div class="glass-panel" style="padding: 16px; margin-top: 15px;">
        <h3 style="margin-bottom: 12px; font-size: 1rem;">새로운 종목 만들기</h3>
        <div class="form-group">
          <input type="text" id="newExName" class="form-control" placeholder="종목명">
        </div>
        <div class="form-group">
          <input type="text" id="newExPart" class="form-control" placeholder="부위 (예: 가슴, 하체)">
        </div>
        <button class="btn btn-primary" id="createNewExBtn">생성 및 추가</button>
      </div>`}
    </main>
  `;

  document.getElementById('closeAddBtn').addEventListener('click', () => {
    navigateTo(state.addExerciseSourceView === 'settings' ? 'settings' : 'workout');
  });

  // Tab clicks
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      state.addExerciseTab = e.currentTarget.getAttribute('data-tab');
      renderAddExercise();
    });
  });

  // Edit exercise
  document.querySelectorAll('.edit-ex-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent adding to workout
      navigateTo('edit-exercise', { editingExerciseId: parseInt(e.currentTarget.getAttribute('data-id')) });
    });
  });

  // Edit group
  document.querySelectorAll('.edit-grp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo('edit-group', { editingGroupId: parseInt(e.currentTarget.getAttribute('data-id')) });
    });
  });

  // Part toggle
  document.querySelectorAll('.part-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const targetId = header.getAttribute('data-target');
      const content = document.getElementById(targetId);
      const chevron = header.querySelector('.part-chevron');
      if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
      } else {
        content.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
      }
    });
  });

  // Select existing
  document.querySelectorAll('.exercise-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      if (state.addExerciseSourceView === 'settings') return;
      const type = e.currentTarget.getAttribute('data-type');
      const id = parseInt(e.currentTarget.getAttribute('data-id'));

      if (type === 'single') {
        await appendExerciseToWorkout(id);
      } else if (type === 'group') {
        const group = state.groups.find(g => g.id === id);
        if (group && group.exerciseIds) {
          for (let exId of group.exerciseIds) {
            await appendExerciseToWorkout(exId);
          }
        }
      }
      navigateTo('workout');
    });
  });

  // Create new exercise
  const createExBtn = document.getElementById('createNewExBtn');
  if (createExBtn) {
    createExBtn.addEventListener('click', async () => {
      const name = document.getElementById('newExName').value.trim();
      const part = document.getElementById('newExPart').value.trim();
      if (name && part) {
        if (state.exercises.some(e => e.name.trim().toLowerCase() === name.toLowerCase())) {
          alert('이미 존재하는 종목명입니다.');
          return;
        }
        const id = await addRecord('exercises', { name, bodyPart: part, defaultRestTime: 90 });
        state.exercises = await getAllRecords('exercises'); // refresh

        if (state.addExerciseSourceView === 'settings') {
          alert("종목이 성공적으로 추가되었습니다.");
          navigateTo('add-exercise');
        } else {
          await appendExerciseToWorkout(id);
          navigateTo('workout');
        }
      } else {
        alert('종목명과 부위를 모두 입력해주세요.');
      }
    });
  }

  // Go to Create Group (shows when group tab is active)
  const goCreateGroupBtn = document.getElementById('goCreateGroupBtn');
  if (goCreateGroupBtn) {
    goCreateGroupBtn.addEventListener('click', () => {
      navigateTo('create-group');
    });
  }
}

// 4.1 Create Group View
function renderCreateGroup() {
  let listHtml = '';
  state.exercises.forEach(ex => {
    listHtml += `
      <div class="exercise-item" style="justify-content: flex-start; gap: 12px;">
        <input type="checkbox" class="group-ex-check" value="${ex.id}" id="chk_${ex.id}" style="width: 20px; height: 20px; accent-color: var(--accent-primary);">
        <label for="chk_${ex.id}" style="flex:1; cursor:pointer;">
          <div class="exercise-item-title">${ex.name}</div>
          <div class="exercise-item-subtitle">${ex.bodyPart}</div>
        </label>
      </div>
    `;
  });

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="cancelCreateGrpBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>그룹 만들기</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main>
      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <div class="form-group" style="margin-bottom: 0;">
          <input type="text" id="newGroupName" class="form-control" placeholder="그룹명 (예: 하체루틴)">
        </div>
      </div>
      <div style="font-weight: 600; margin-bottom: 10px; padding-left: 5px;">종목 선택</div>
      <div class="glass-panel" style="max-height: 45vh; overflow-y: auto; margin-bottom: 20px;">
        ${listHtml}
      </div>
      <button class="btn btn-primary" id="saveGroupBtn">그룹 저장</button>
    </main>
  `;

  document.getElementById('cancelCreateGrpBtn').addEventListener('click', () => {
    navigateTo('add-exercise');
  });

  let checkedOrder = [];
  document.querySelectorAll('.group-ex-check').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const val = parseInt(e.target.value);
      if (e.target.checked) {
        checkedOrder.push(val);
      } else {
        checkedOrder = checkedOrder.filter(id => id !== val);
      }
    });
  });

  document.getElementById('saveGroupBtn').addEventListener('click', async () => {
    const name = document.getElementById('newGroupName').value.trim();
    if (name && checkedOrder.length > 0) {
      if (state.groups.some(g => g.name.trim().toLowerCase() === name.toLowerCase())) {
        alert('이미 존재하는 그룹명입니다.');
        return;
      }
      await addRecord('groups', { name, exerciseIds: checkedOrder });
      state.groups = await getAllRecords('groups'); // refresh
      navigateTo('add-exercise');
    } else {
      alert("그룹명과 최소 1개 이상의 종목을 선택해주세요.");
    }
  });
}

// 4.3 Edit Group View
function renderEditGroup() {
  const group = state.groups.find(g => g.id === state.editingGroupId);
  if (!group) { navigateTo('add-exercise'); return; }

  // Temporarily store edited exerciseIds before saving
  if (state.tempGroupEditingId !== state.editingGroupId) {
    state.tempGroupEditingId = state.editingGroupId;
    state.tempGroupExerciseIds = [...(group.exerciseIds || [])];
    state.tempGroupName = group.name;
  }

  // Sync temp variables with active inputs before re-rendering
  const nameInput = document.getElementById('editGroupName');
  if (nameInput) state.tempGroupName = nameInput.value;

  let listHtml = '';
  if (state.tempGroupExerciseIds.length === 0) {
    listHtml = `<div class="info-text" style="padding: 10px;">그룹에 종목이 없습니다.</div>`;
  } else {
    state.tempGroupExerciseIds.forEach((exId, idx) => {
      const ex = state.exercises.find(e => e.id === exId);
      const exName = ex ? ex.name : 'Unknown';
      const exPart = ex ? ex.bodyPart : '';
      listHtml += `
        <div class="exercise-item" style="display:flex; justify-content:space-between; align-items:center; padding-left: 12px; padding-right: 8px;">
          <div>
            <div class="exercise-item-title">${exName}</div>
            <div class="exercise-item-subtitle">${exPart}</div>
          </div>
          <div style="display:flex; gap: 2px; align-items:center;">
            <button class="icon-btn move-up-btn" data-idx="${idx}" style="padding:4px;"><i class="ph ph-caret-up"></i></button>
            <button class="icon-btn move-down-btn" data-idx="${idx}" style="padding:4px;"><i class="ph ph-caret-down"></i></button>
            <button class="icon-btn remove-ex-btn" data-idx="${idx}" style="padding:4px; margin-left: 8px;"><i class="ph ph-x" style="color:var(--danger)"></i></button>
          </div>
        </div>
      `;
    });
  }

  let checkboxListHtml = '';
  state.exercises.forEach(ex => {
    if (state.tempGroupExerciseIds.includes(ex.id)) return;

    checkboxListHtml += `
      <div class="exercise-item" style="justify-content: flex-start; gap: 12px; padding: 10px 12px;">
        <input type="checkbox" class="group-ex-check-add" value="${ex.id}" id="chk_add_${ex.id}" style="width: 20px; height: 20px; accent-color: var(--accent-primary);">
        <label for="chk_add_${ex.id}" style="flex:1; cursor:pointer; margin:0;">
          <div class="exercise-item-title">${ex.name}</div>
          <div class="exercise-item-subtitle">${ex.bodyPart}</div>
        </label>
      </div>
    `;
  });
  if (!checkboxListHtml) checkboxListHtml = `<div class="info-text" style="padding:10px;">추가할 수 있는 종목이 없습니다.</div>`;

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="cancelEditGrpBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>그룹 수정</h1>
      <button class="icon-btn" id="deleteGrpBtn"><i class="ph ph-trash" style="color:var(--danger);"></i></button>
    </header>
    <main>
      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <div class="form-group" style="margin-bottom: 0;">
          <input type="text" id="editGroupName" class="form-control" value="${state.tempGroupName}" placeholder="그룹명 (예: 하체루틴)">
        </div>
      </div>
      <div style="font-weight: 600; margin-bottom: 10px; padding-left: 5px;">종목 편집 (위/아래 화살표로 순서 변경)</div>
      <div class="glass-panel" style="max-height: 35vh; overflow-y: auto; margin-bottom: 15px;">
        ${listHtml}
      </div>
      <button class="btn btn-secondary" id="toggleAddExsBtn" style="margin-bottom: 15px; width:100%; font-size: 0.95rem; justify-content:center;">
        <i class="ph ph-plus-circle"></i> 목록에서 종목 추가하기
      </button>
      <div id="addExsContainer" style="display: none; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        <div style="font-weight: 600; padding-left: 5px;">추가할 종목 선택</div>
        <div class="glass-panel" style="max-height: 35vh; overflow-y: auto;">
          ${checkboxListHtml}
        </div>
        <button class="btn btn-primary" id="confirmAddExsBtn">선택 종목 추가</button>
      </div>
      <button class="btn btn-primary" id="saveEditGrpBtn">변경사항 저장</button>
    </main>
  `;

  document.getElementById('cancelEditGrpBtn').addEventListener('click', () => {
    navigateTo('add-exercise');
  });

  const delBtn = document.getElementById('deleteGrpBtn');
  if (delBtn) delBtn.addEventListener('click', async () => {
    if (confirm('이 그룹을 완전히 삭제하시겠습니까?')) {
      const transaction = dbInfo.db.transaction(['groups'], 'readwrite');
      const store = transaction.objectStore('groups');
      const req = store.delete(group.id);
      req.onsuccess = async () => {
        state.groups = await getAllRecords('groups');
        navigateTo('add-exercise');
      };
    }
  });

  document.getElementById('saveEditGrpBtn').addEventListener('click', async () => {
    const name = document.getElementById('editGroupName').value.trim();
    if (name && state.tempGroupExerciseIds.length > 0) {
      if (state.groups.some(g => g.id !== group.id && g.name.trim().toLowerCase() === name.toLowerCase())) {
        alert('이미 존재하는 그룹명입니다.');
        return;
      }
      group.name = name;
      group.exerciseIds = state.tempGroupExerciseIds;
      await putRecord('groups', group);
      state.groups = await getAllRecords('groups'); // refresh
      navigateTo('add-exercise');
    } else {
      alert("그룹명과 최소 1개 이상의 종목이 필요합니다.");
    }
  });

  const toggleBtn = document.getElementById('toggleAddExsBtn');
  const addContainer = document.getElementById('addExsContainer');
  if (toggleBtn && addContainer) {
    toggleBtn.addEventListener('click', () => {
      if (addContainer.style.display === 'none') {
        addContainer.style.display = 'flex';
        toggleBtn.innerHTML = '<i class="ph ph-minus-circle"></i> 종목 추가 접기';
      } else {
        addContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="ph ph-plus-circle"></i> 목록에서 종목 추가하기';
      }
    });
  }

  let checkedAddOrder = [];
  document.querySelectorAll('.group-ex-check-add').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const val = parseInt(e.target.value);
      if (e.target.checked) {
        checkedAddOrder.push(val);
      } else {
        checkedAddOrder = checkedAddOrder.filter(id => id !== val);
      }
    });
  });

  const confirmAddBtn = document.getElementById('confirmAddExsBtn');
  if (confirmAddBtn) {
    confirmAddBtn.addEventListener('click', () => {
      if (checkedAddOrder.length > 0) {
        state.tempGroupExerciseIds.push(...checkedAddOrder);
        renderEditGroup();
      } else {
        alert("추가할 종목을 선택해주세요.");
      }
    });
  }

  document.querySelectorAll('.move-up-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
      if (idx > 0) {
        const temp = state.tempGroupExerciseIds[idx];
        state.tempGroupExerciseIds[idx] = state.tempGroupExerciseIds[idx - 1];
        state.tempGroupExerciseIds[idx - 1] = temp;
        renderEditGroup();
      }
    });
  });

  document.querySelectorAll('.move-down-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
      if (idx < state.tempGroupExerciseIds.length - 1) {
        const temp = state.tempGroupExerciseIds[idx];
        state.tempGroupExerciseIds[idx] = state.tempGroupExerciseIds[idx + 1];
        state.tempGroupExerciseIds[idx + 1] = temp;
        renderEditGroup();
      }
    });
  });

  document.querySelectorAll('.remove-ex-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
      state.tempGroupExerciseIds.splice(idx, 1);
      renderEditGroup();
    });
  });
}

// 4.4 Edit Exercise View
function renderEditExercise() {
  const ex = state.exercises.find(e => e.id === state.editingExerciseId);
  if (!ex) { state.view = 'add-exercise'; return render(); }

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="cancelEditExBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>종목 수정</h1>
      <button class="icon-btn" id="deleteExBtn"><i class="ph ph-trash" style="color:var(--danger)"></i></button>
    </header>
    <main>
      <div class="glass-panel" style="padding: 16px; margin-top: 15px;">
        <div class="form-group">
          <label>종목명</label>
          <input type="text" id="editExName" class="form-control" value="${ex.name}">
        </div>
        <div class="form-group">
          <label>부위 (예: 가슴, 하체)</label>
          <input type="text" id="editExPart" class="form-control" value="${ex.bodyPart || ''}">
        </div>
        <div class="form-group">
          <label>기본 휴식시간(초)</label>
          <input type="number" id="editExRest" class="form-control" value="${ex.defaultRestTime || 90}">
        </div>
        <button class="btn btn-primary" id="saveEditExBtn" style="margin-top: 10px;">저장하기</button>
      </div>
    </main>
  `;

  document.getElementById('cancelEditExBtn').addEventListener('click', () => {
    navigateTo('add-exercise');
  });

  document.getElementById('saveEditExBtn').addEventListener('click', async () => {
    const name = document.getElementById('editExName').value.trim();
    const part = document.getElementById('editExPart').value.trim();
    const rest = parseInt(document.getElementById('editExRest').value) || 90;

    if (name && part) {
      if (state.exercises.some(e => e.id !== ex.id && e.name.trim().toLowerCase() === name.toLowerCase())) {
        alert('이미 존재하는 종목명입니다.');
        return;
      }
      ex.name = name;
      ex.bodyPart = part;
      ex.defaultRestTime = rest;
      await putRecord('exercises', ex);
      state.exercises = await getAllRecords('exercises'); // refresh
      navigateTo('add-exercise');
    } else {
      alert("종목명과 부위를 모두 입력해주세요.");
    }
  });

  const delExBtn = document.getElementById('deleteExBtn');
  if (delExBtn) {
    delExBtn.addEventListener('click', async () => {
      if (confirm('이 종목을 데이터베이스에서 완전히 삭제하시겠습니까? (과거 기록에서는 이름이 유지됩니다)')) {
        const transaction = dbInfo.db.transaction(['exercises'], 'readwrite');
        const store = transaction.objectStore('exercises');
        const req = store.delete(ex.id);
        req.onsuccess = async () => {
          state.exercises = await getAllRecords('exercises');

          for (let g of state.groups) {
            if (g.exerciseIds && g.exerciseIds.includes(ex.id)) {
              g.exerciseIds = g.exerciseIds.filter(id => id !== ex.id);
              await putRecord('groups', g);
            }
          }
          state.groups = await getAllRecords('groups');
          navigateTo('add-exercise');
        };
      }
    });
  }
}

async function appendExerciseToWorkout(exId) {
  let w = state.workouts[state.date];
  if (!w) {
    w = { date: state.date, exercises: [] };
    state.workouts[state.date] = w;
  }

  // Prevent duplicate exercises in the daily workout
  if (w.exercises.some(e => e.exerciseId === exId)) {
    return;
  }

  // Find the most recent previous configuration for this exercise
  let recentSets = null;
  const pastDates = Object.keys(state.workouts)
    .filter(d => d < state.date)
    .sort((a, b) => b.localeCompare(a));

  for (let date of pastDates) {
    const pastW = state.workouts[date];
    const pastEx = pastW.exercises.slice().reverse().find(e => e.exerciseId === exId);
    if (pastEx && pastEx.sets && pastEx.sets.length > 0) {
      // Copy sets, retaining weight/reps but resetting completed status
      recentSets = pastEx.sets.map(s => ({ weight: s.weight, reps: s.reps, completed: null }));
      break;
    }
  }

  if (!recentSets) {
    recentSets = [{ weight: 0, reps: 0, completed: null }];
  }

  w.exercises.push({
    exerciseId: exId,
    sets: recentSets
  });
  await saveCurrentWorkout();
}

// 5. Execution View
function setTimerText() {
  const inputEl = document.getElementById('restTimerInput');
  if (inputEl && document.activeElement !== inputEl) {
    inputEl.value = state.timerTime;
  }

  const pEl = document.getElementById('timerProgress');
  if (pEl) {
    if (state.timerState === 'stopped') {
      pEl.style.strokeDashoffset = 0;
    } else {
      const defaultTime = parseInt(inputEl ? inputEl.getAttribute('data-default') : 90);
      const pct = defaultTime > 0 ? (state.timerTime / defaultTime) : 0;
      pEl.style.strokeDashoffset = 440 - (440 * pct);
    }
  }
}

// --- Timer Audio & Notification ---
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTimerEndNotification() {
  if ("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 400]);

  if (audioCtx) {
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const playBeep = (freq, delay) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(1, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.5);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + 0.5);
      };
      playBeep(880, 0);
      playBeep(880, 0.2);
      playBeep(1100, 0.4);
    } catch (e) {
      console.warn("Audio Context playback failed", e);
    }
  }

  const title = "휴식 종료";
  const options = {
    body: "휴식시간이 끝났습니다! 다음 세트를 준비하세요.",
    vibrate: [200, 100, 200],
    tag: "rest-timer-notification",
    renotify: true
  };

  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) reg.showNotification(title, options);
      else if ("Notification" in window) new Notification(title, options);
    });
  } else if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, options);
  }

  setTimeout(() => {
    alert("🔔 휴식시간이 끝났습니다!\n다음 세트를 시작하세요.");
  }, 200);
}

function handleTimerTick() {
  if (state.timerState === 'running' && state.timerTime > 0) {
    state.timerTime--;
    setTimerText();
    if (state.timerTime === 0) {
      state.timerState = 'stopped';
      clearInterval(state.timerInterval);
      playTimerEndNotification();

      const w = state.workouts[state.date];
      const exItem = w.exercises[state.activeExerciseIndex];
      const dictEx = state.exercises.find(e => e.id === exItem.exerciseId);
      const defRest = dictEx ? dictEx.defaultRestTime : 90;
      state.timerTime = defRest;
      setTimerText();

      renderExecutionControls();
    }
  }
}

function renderExecutionControls() {
  const ctrlEl = document.getElementById('timerControlsRow');
  if (!ctrlEl) return;

  if (state.timerState === 'stopped' && state.timerTime > 0) {
    ctrlEl.innerHTML = `<button class="btn btn-primary" id="startRestBtn" style="width: 150px;">휴식</button>`;
    document.getElementById('startRestBtn').addEventListener('click', async () => {
      initAudio();
      // Only request if not granted and browser supports it
      if ("Notification" in window && Notification.permission === "default") {
        await requestNotificationPermission();
      }
      state.timerState = 'running';
      state.timerInterval = setInterval(handleTimerTick, 1000);
      renderExecutionControls();
    });
  } else if (state.timerState === 'running') {
    ctrlEl.innerHTML = `<button class="btn btn-danger" id="stopRestBtn" style="width: 150px;">정지</button>`;
    document.getElementById('stopRestBtn').addEventListener('click', () => {
      state.timerState = 'paused';
      clearInterval(state.timerInterval);
      renderExecutionControls();
    });
  } else if (state.timerState === 'paused') {
    ctrlEl.innerHTML = `
      <div style="display:flex; gap:10px;">
        <button class="btn btn-primary" id="restartRestBtn">재시작</button>
        <button class="btn" id="resetRestBtn">초기화</button>
      </div>
    `;
    document.getElementById('restartRestBtn').addEventListener('click', async () => {
      initAudio();
      if ("Notification" in window && Notification.permission === "default") {
        await requestNotificationPermission();
      }
      state.timerState = 'running';
      state.timerInterval = setInterval(handleTimerTick, 1000);
      renderExecutionControls();
    });
    document.getElementById('resetRestBtn').addEventListener('click', () => {
      state.timerState = 'stopped';
      const inputEl = document.getElementById('restTimerInput');
      state.timerTime = parseInt(inputEl ? inputEl.getAttribute('data-default') : 90);
      setTimerText();
      renderExecutionControls();
    });
  }
}

function renderExecution() {
  const w = state.workouts[state.date];
  const exItem = w.exercises[state.activeExerciseIndex];
  const dictEx = state.exercises.find(e => e.id === exItem.exerciseId);
  const exName = dictEx ? dictEx.name : '알 수 없는 종목';

  // Ensure set exists
  if (!exItem.sets[state.activeSetIndex]) {
    state.activeSetIndex = exItem.sets.length - 1;
    if (state.activeSetIndex < 0) state.activeSetIndex = 0;
  }
  const set = exItem.sets[state.activeSetIndex] || { weight: 0, reps: 0, completed: null };

  const totalSets = exItem.sets.length;
  const currentSetNum = state.activeSetIndex + 1;
  const defRest = dictEx ? dictEx.defaultRestTime : 90;

  // Reset timer if exercise switched or if it's currently stopped
  if (state.timerExerciseId !== exItem.exerciseId) {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.timerState = 'stopped';
    state.timerTime = defRest;
    state.timerExerciseId = exItem.exerciseId;
  } else if (state.timerState === 'stopped') {
    state.timerTime = defRest;
  }

  let dotsHtml = '';
  for (let i = 0; i < totalSets; i++) {
    const isCurrent = i === state.activeSetIndex;
    const s = exItem.sets[i];
    const isCompleted = s && s.completed;

    let boxStyle = '';
    let content = '';

    if (isCurrent) {
      boxStyle = 'background: var(--accent-primary); color: white; width: 36px; height: 36px; font-weight: 700; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); transform: scale(1.1); font-size: 1.1rem;';
      content = i + 1;
    } else if (isCompleted) {
      boxStyle = 'background: var(--surface-hover); color: var(--success); width: 32px; height: 32px; border: 1.5px solid var(--success); font-size: 1.1rem;';
      content = '<i class="ph-bold ph-check"></i>';
    } else {
      boxStyle = 'background: var(--surface); color: var(--text-muted); width: 32px; height: 32px; border: 1.5px solid var(--border-color); font-size: 0.95rem; font-weight: 600; opacity: 0.7;';
      content = i + 1;
    }

    dotsHtml += `
      <div class="set-indicator-chip" data-setidx="${i}" 
           style="display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); ${boxStyle}; flex-shrink: 0; scroll-snap-align: center;">
        ${content}
      </div>
    `;
  }

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="execBackBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>진행 중</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main style="display: flex; flex-direction: column; justify-content: space-between;">
      <div class="execution-container">
        <h2 class="execution-title">${exName}</h2>
        <div class="execution-set">${currentSetNum}세트</div>
        <div class="execution-metrics">
          <div class="metric-box">
            <div class="metric-value">
              <input type="number" id="execWeightInput" class="exec-input fit-text" value="${set.weight}" step="2.5" min="0">
              <span class="metric-unit">kg</span>
            </div>
          </div>
          <div style="font-size: 2rem; color: var(--text-muted);">/</div>
          <div class="metric-box">
            <div class="metric-value">
              <input type="number" id="execRepsInput" class="exec-input fit-text" value="${set.reps}" min="0">
              <span class="metric-unit">회</span>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 30px;">
          <div class="rest-timer-wrapper" style="margin: 10px auto;">
            <svg class="rest-timer-svg" viewBox="0 0 160 160" style="width: 120px; height: 120px;">
              <circle class="rest-timer-bg" cx="80" cy="80" r="70"></circle>
              <circle class="rest-timer-progress" cx="80" cy="80" r="70" id="timerProgress"></circle>
            </svg>
            <div class="rest-timer-text">
              <input type="number" id="restTimerInput" class="timer-input" value="${state.timerTime}" data-default="${defRest}">
            </div>
          </div>
          
          <div style="display: flex; justify-content: center; gap: 12px; margin-top: 15px;">
            <button class="action-btn" id="sub30Btn" style="background: var(--surface); border: 1px solid var(--border-color); border-radius: 20px; padding: 8px 16px; font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">-30초</button>
            <button class="action-btn" id="add30Btn" style="background: var(--surface); border: 1px solid var(--border-color); border-radius: 20px; padding: 8px 16px; font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">+30초</button>
          </div>

          <div id="timerControlsRow" style="min-height: 50px; display:flex; justify-content:center; margin-top: 15px;">
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
        <div class="dots-indicator" style="display: flex; gap: 12px; max-width: 100%; overflow-x: auto; padding: 10px 4px; scroll-snap-type: x mandatory; scrollbar-width: none;">
          ${dotsHtml}
        </div>
        <div class="exec-controls">
          <button class="exec-btn prev" id="execPrevBtn" ${state.activeSetIndex === 0 ? 'disabled' : ''}>이전</button>
          <button class="exec-btn complete" id="execCompBtn">완료</button>
          <button class="exec-btn next" id="execNextBtn" ${state.activeSetIndex === totalSets - 1 ? 'disabled' : ''}>다음</button>
        </div>
      </div>
    </main>
  `;

  // Row selection handler for indicators
  document.querySelectorAll('.set-indicator-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const targetSetIdx = parseInt(e.currentTarget.getAttribute('data-setidx'));
      if (targetSetIdx !== state.activeSetIndex) {
        state.activeSetIndex = targetSetIdx;
        renderExecution();
      }
    });
  });

  document.getElementById('execBackBtn').addEventListener('click', () => {
    clearInterval(state.timerInterval);
    navigateTo('workout');
  });

  renderExecutionControls();

  // Timer Adjustments
  const restInput = document.getElementById('restTimerInput');
  if (restInput) {
    restInput.addEventListener('change', async (e) => {
      let newTime = parseInt(e.target.value);
      if (isNaN(newTime) || newTime < 0) newTime = 0;
      state.timerTime = newTime;
      e.target.setAttribute('data-default', newTime);
      setTimerText();

      if (dictEx) {
        dictEx.defaultRestTime = newTime;
        await putRecord('exercises', dictEx);
      }
    });
  }

  const add30Btn = document.getElementById('add30Btn');
  if (add30Btn) {
    add30Btn.addEventListener('click', async () => {
      let currentDefault = parseInt(restInput ? restInput.getAttribute('data-default') : 90);
      let newDefault = currentDefault + 30;
      if (restInput) restInput.setAttribute('data-default', newDefault);
      state.timerTime += 30;
      setTimerText();

      if (dictEx) {
        dictEx.defaultRestTime = newDefault;
        await putRecord('exercises', dictEx);
      }
    });
  }

  const sub30Btn = document.getElementById('sub30Btn');
  if (sub30Btn) {
    sub30Btn.addEventListener('click', async () => {
      let currentDefault = parseInt(restInput ? restInput.getAttribute('data-default') : 90);
      let newDefault = Math.max(0, currentDefault - 30);
      if (restInput) restInput.setAttribute('data-default', newDefault);
      state.timerTime = Math.max(0, state.timerTime - 30);
      setTimerText();

      if (dictEx) {
        dictEx.defaultRestTime = newDefault;
        await putRecord('exercises', dictEx);
      }
    });
  }

  // Controls
  const moveToSet = (idx) => {
    state.activeSetIndex = idx;
    clearInterval(state.timerInterval);
    state.timerState = 'stopped';
    state.timerTime = defRest;
    render();
  };

  // Update Weight and Reps directly from Execution screen
  document.getElementById('execWeightInput').addEventListener('change', async (e) => {
    exItem.sets[state.activeSetIndex].weight = parseFloat(e.target.value) || 0;
    await saveCurrentWorkout();
  });

  document.getElementById('execRepsInput').addEventListener('change', async (e) => {
    exItem.sets[state.activeSetIndex].reps = parseFloat(e.target.value) || 0;
    await saveCurrentWorkout();
  });

  const prevBtn = document.getElementById('execPrevBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => moveToSet(state.activeSetIndex - 1));

  const nextBtn = document.getElementById('execNextBtn');
  if (nextBtn) nextBtn.addEventListener('click', () => moveToSet(state.activeSetIndex + 1));

  document.getElementById('execCompBtn').addEventListener('click', async () => {
    exItem.sets[state.activeSetIndex].completed = true;
    await saveCurrentWorkout();
    if (state.activeSetIndex < totalSets - 1) {
      moveToSet(state.activeSetIndex + 1);
    } else {
      // Completed last set, go back or show well done
      clearInterval(state.timerInterval);
      navigateTo('workout');
    }
  });
}

// 6. Report View
function renderReport() {
  const dictEx = state.exercises.find(e => e.id === state.reportExerciseId);
  const exName = dictEx ? dictEx.name : '알 수 없는 종목';

  // Gather all past workouts for this exercise
  const history = [];
  Object.keys(state.workouts).forEach(dateStr => {
    const w = state.workouts[dateStr];
    w.exercises.forEach(ex => {
      if (ex.exerciseId === state.reportExerciseId) {
        history.push({ date: dateStr, sets: ex.sets });
      }
    });
  });

  // Sort history descending by date (newest first)
  history.sort((a, b) => b.date.localeCompare(a.date));

  let historyHtml = '<div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">';

  if (history.length === 0) {
    historyHtml += `<div class="info-text">이전 기록이 없습니다.</div>`;
  } else {
    history.forEach(record => {
      let setsStr = '';
      let totalVolume = 0;

      record.sets.forEach((s, idx) => {
        if (s.completed && s.weight && s.reps) {
          totalVolume += (s.weight * s.reps);
        }
        const iconColor = s.completed ? 'var(--success)' : 'var(--text-muted)';
        const icon = s.completed ? '<i class="ph-fill ph-check-circle"></i>' : '<i class="ph ph-circle"></i>';
        setsStr += `
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-bottom: 1px solid var(--border-color);">
            <div style="color: var(--text-secondary);">${idx + 1}세트</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 500; font-size: 1.05rem;">${Number(s.weight).toLocaleString()}kg x ${Number(s.reps).toLocaleString()}회</span>
              <span style="color: ${iconColor}; font-size: 1.1rem; display: flex; align-items: center;">${icon}</span>
            </div>
          </div>
        `;
      });

      historyHtml += `
        <div class="glass-panel" style="padding: 12px; border-radius: var(--radius-md);">
          <div style="font-weight: 700; color: var(--accent-primary); margin-bottom: 8px; font-size: 1.1rem; display: flex; justify-content: space-between; align-items: flex-end;">
            <span><i class="ph-bold ph-calendar-blank"></i> ${record.date}</span>
            <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
              총 <span style="color:var(--text-primary); font-weight: bold; font-size: 1.05rem;">${totalVolume.toLocaleString()}kg</span>
            </span>
          </div>
          <div style="display: flex; flex-direction: column; font-size: 0.95rem;">
            ${setsStr}
          </div>
        </div>
      `;
    });
  }
  historyHtml += '</div>';

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="reportBackBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>${exName} 기록</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main style="overflow-y: auto;">
      ${historyHtml}
    </main>
  `;

  document.getElementById('reportBackBtn').addEventListener('click', () => {
    if (state.reportSourceView === 'exercise-report-list') {
      state.reportSourceView = null;
      navigateTo('exercise-report-list');
    } else {
      navigateTo('workout');
    }
  });
}

// 7. Exercise Report List View
function renderExerciseReportList() {
  let listHtml = '';
  const bodyParts = {};
  state.exercises.forEach(ex => {
    if (!bodyParts[ex.bodyPart]) bodyParts[ex.bodyPart] = [];
    bodyParts[ex.bodyPart].push(ex);
  });

  Object.keys(bodyParts).forEach(part => {
    const partSafe = part.replace(/\s+/g, '-');
    listHtml += `
      <div class="part-header" data-target="report-part-${partSafe}" style="padding: 12px 16px; background: var(--surface-hover); font-weight: bold; color: var(--accent-primary); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
        <span>${part} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">(${bodyParts[part].length})</span></span>
        <i class="ph ph-caret-down part-chevron" style="transition: transform 0.2s;"></i>
      </div>
      <div class="part-content" id="report-part-${partSafe}" style="display: none;">
    `;
    bodyParts[part].forEach(ex => {
      listHtml += `
        <div class="exercise-item report-ex-item" data-id="${ex.id}" style="cursor: pointer; padding-left: 16px;">
          <div>
            <div class="exercise-item-title">${ex.name}</div>
            <div class="exercise-item-subtitle">${ex.bodyPart || '미지정'}</div>
          </div>
          <i class="ph ph-caret-right" style="font-size: 1.2rem; color: var(--text-muted);"></i>
        </div>
      `;
    });
    listHtml += `</div>`;
  });

  if (state.exercises.length === 0) {
    listHtml = `<div class="info-text">등록된 종목이 없습니다.</div>`;
  }

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="exReportBackBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>개별 종목 리포트</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main>
      <div class="glass-panel" style="max-height: 80vh; overflow-y: auto;">
        ${listHtml}
      </div>
    </main>
  `;

  document.getElementById('exReportBackBtn').addEventListener('click', () => {
    navigateTo('settings');
  });

  document.querySelectorAll('.part-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const targetId = header.getAttribute('data-target');
      const content = document.getElementById(targetId);
      const chevron = header.querySelector('.part-chevron');
      if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
      } else {
        content.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
      }
    });
  });

  document.querySelectorAll('.report-ex-item').forEach(item => {
    item.addEventListener('click', (e) => {
      navigateTo('report', {
        reportExerciseId: parseInt(e.currentTarget.getAttribute('data-id')),
        reportSourceView: 'exercise-report-list'
      });
    });
  });
}

// 8. Workout Report View
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderWorkoutReport() {
  const tab = state.workoutReportTab || 'month'; // 'month', 'week', 'day'

  const ref = new Date(state.reportDate || toDateStr(new Date()));
  ref.setHours(0, 0, 0, 0);

  let currStart, currEnd, prevStart, prevEnd;
  let title = '';

  if (tab === 'month') {
    currStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
    currEnd = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    prevStart = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
    prevEnd = new Date(ref.getFullYear(), ref.getMonth(), 0);
    title = `${ref.getFullYear()}년 ${ref.getMonth() + 1}월`;
  } else if (tab === 'week') {
    const day = ref.getDay();
    const diffToMon = ref.getDate() - day + (day === 0 ? -6 : 1);
    currStart = new Date(ref.getFullYear(), ref.getMonth(), diffToMon);
    currEnd = new Date(currStart); currEnd.setDate(currEnd.getDate() + 6);
    prevStart = new Date(currStart); prevStart.setDate(prevStart.getDate() - 7);
    prevEnd = new Date(currStart); prevEnd.setDate(prevEnd.getDate() - 1);
    const w1 = `${currStart.getMonth() + 1}/${currStart.getDate()}`;
    const w2 = `${currEnd.getMonth() + 1}/${currEnd.getDate()}`;
    title = `${w1} ~ ${w2}`;
  } else if (tab === 'day') {
    currStart = new Date(ref);
    currEnd = new Date(ref);
    prevStart = new Date(ref); prevStart.setDate(prevStart.getDate() - 1);
    prevEnd = new Date(prevStart);
    title = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}-${String(ref.getDate()).padStart(2, '0')}`;
  }

  const sCurrStart = toDateStr(currStart);
  const sCurrEnd = toDateStr(currEnd);
  const sPrevStart = toDateStr(prevStart);
  const sPrevEnd = toDateStr(prevEnd);

  // Accumulators
  let currVol = 0;
  let prevVol = 0;
  let currDays = new Set();
  let prevDays = new Set();

  const currExMax = {}; // { exId: maxWeight }
  const prevExMax = {};

  Object.keys(state.workouts).forEach(dateStr => {
    const isCurr = dateStr >= sCurrStart && dateStr <= sCurrEnd;
    const isPrev = dateStr >= sPrevStart && dateStr <= sPrevEnd;
    if (!isCurr && !isPrev) return;

    const w = state.workouts[dateStr];
    if (w.exercises.length > 0) {
      // Check if it really has completed sets for 'worked out days'
      const hasRealWorkout = w.exercises.some(ex => ex.sets.some(s => s.completed));
      if (hasRealWorkout) {
        if (isCurr) currDays.add(dateStr);
        if (isPrev) prevDays.add(dateStr);
      }
    }

    w.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed && s.weight > 0 && s.reps > 0) {
          const vol = s.weight * s.reps;
          if (isCurr) {
            currVol += vol;
            if (!currExMax[ex.exerciseId] || s.weight > currExMax[ex.exerciseId]) currExMax[ex.exerciseId] = s.weight;
          }
          if (isPrev) {
            prevVol += vol;
            if (!prevExMax[ex.exerciseId] || s.weight > prevExMax[ex.exerciseId]) prevExMax[ex.exerciseId] = s.weight;
          }
        }
      });
    });
  });

  const volDiff = currVol - prevVol;
  let volDiffStr = '';
  if (volDiff > 0) volDiffStr = `<span style="color:var(--success);">+${volDiff.toLocaleString()}kg</span>`;
  else if (volDiff < 0) volDiffStr = `<span style="color:var(--danger);">${volDiff.toLocaleString()}kg</span>`;
  else volDiffStr = `<span style="color:var(--text-muted);">-</span>`;

  let daysDiffStr = '';
  if (tab === 'month') {
    const daysDiff = currDays.size - prevDays.size;
    if (daysDiff > 0) daysDiffStr = `<span style="color:var(--success);">+${daysDiff}일</span>`;
    else if (daysDiff < 0) daysDiffStr = `<span style="color:var(--danger);">${daysDiff}일</span>`;
    else daysDiffStr = `<span style="color:var(--text-muted);">-</span>`;
  }

  // Increased Exercises
  let increasedHtml = '';
  let increasedCount = 0;
  Object.keys(currExMax).forEach(exIdStr => {
    const exId = parseInt(exIdStr);
    const cMax = currExMax[exId];
    const pMax = prevExMax[exId] || 0;
    if (cMax > pMax) {
      increasedCount++;
      const dictEx = state.exercises.find(e => e.id === exId);
      const exName = dictEx ? dictEx.name : '알 수 없는 종목';
      let cmpStr = pMax === 0 ? `${cMax.toLocaleString()}kg` : `${pMax.toLocaleString()}kg → ${cMax.toLocaleString()}kg`;
      increasedHtml += `
        <div style="display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
          <span style="font-weight:600;">${exName}</span>
          <span style="color:var(--success); font-weight: 600; font-size: 0.95rem;">${cmpStr}</span>
        </div>
      `;
    }
  });

  if (increasedCount === 0) {
    increasedHtml = `<div class="info-text">이 기간 동안 최고 중량이 증량된 종목이 없습니다.</div>`;
  }

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="wReportBackBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>종합 리포트</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main>
      <div class="tabs">
        <div class="tab ${tab === 'month' ? 'active' : ''}" data-tab="month">월별</div>
        <div class="tab ${tab === 'week' ? 'active' : ''}" data-tab="week">주별</div>
        <div class="tab ${tab === 'day' ? 'active' : ''}" data-tab="day">일별</div>
      </div>
      
      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <div style="display:flex; justify-content:center; align-items:center; gap: 12px; margin-bottom: 16px;">
          <button class="icon-btn" id="prevReportPeriodBtn" style="padding: 4px; background:var(--surface); border:1px solid var(--border-color);"><i class="ph ph-caret-left"></i></button>
          <span style="font-size:1.1rem; font-weight:700; color: var(--accent-primary); min-width: 120px; text-align:center;">${title}</span>
          <button class="icon-btn" id="nextReportPeriodBtn" style="padding: 4px; background:var(--surface); border:1px solid var(--border-color);"><i class="ph ph-caret-right"></i></button>
        </div>
        
        <div style="display:flex; justify-content:space-between; margin-bottom: 12px;">
          <span style="color:var(--text-secondary);">총 볼륨(무게×횟수)</span>
          <span style="font-weight:bold; font-size:1.1rem;">${currVol.toLocaleString()} kg</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 12px;">
          <span style="color:var(--text-secondary);">전 기간 대비 추이</span>
          <span style="font-weight:bold; font-size:1.05rem;">${volDiffStr}</span>
        </div>
        ${tab === 'month' ? `
        <div style="display:flex; justify-content:space-between; margin-bottom: 12px;">
          <span style="color:var(--text-secondary);">운동한 일수</span>
          <span style="font-weight:bold; font-size:1.1rem;">${currDays.size}일</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 12px;">
          <span style="color:var(--text-secondary);">전월 대비 운동일</span>
          <span style="font-weight:bold; font-size:1.05rem;">${daysDiffStr}</span>
        </div>
        ` : ''}
      </div>

      <h3 style="margin-bottom:12px; font-size:1rem;">최고 중량 갱신 종목 (${increasedCount}개)</h3>
      <div class="glass-panel" style="padding: 8px 16px; margin-bottom: 20px;">
        ${increasedHtml}
      </div>
    </main>
  `;

  document.getElementById('wReportBackBtn').addEventListener('click', () => {
    navigateTo('settings');
  });

  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', (e) => {
      state.workoutReportTab = e.currentTarget.getAttribute('data-tab');
      renderWorkoutReport();
    });
  });

  document.getElementById('prevReportPeriodBtn').addEventListener('click', () => {
    const d = new Date(state.reportDate || toDateStr(new Date()));
    if (tab === 'month') {
      d.setDate(1);
      d.setMonth(d.getMonth() - 1);
    }
    else if (tab === 'week') d.setDate(d.getDate() - 7);
    else if (tab === 'day') d.setDate(d.getDate() - 1);
    state.reportDate = toDateStr(d);
    renderWorkoutReport();
  });

  document.getElementById('nextReportPeriodBtn').addEventListener('click', () => {
    const d = new Date(state.reportDate || toDateStr(new Date()));
    if (tab === 'month') {
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
    }
    else if (tab === 'week') d.setDate(d.getDate() + 7);
    else if (tab === 'day') d.setDate(d.getDate() + 1);
    state.reportDate = toDateStr(d);
    renderWorkoutReport();
  });
}

// 9. Tutorial View
function renderTutorial() {
  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="tutorialBackBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>앱 사용 튜토리얼</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main style="padding: 20px; font-size: 0.95rem; line-height: 1.6; overflow-y: auto;">
      
      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <h3 style="color: var(--accent-primary); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <i class="ph-fill ph-calendar-check" style="flex-shrink:0;"></i> 1. 진행 및 기본 흐름
        </h3>
        <p style="color: var(--text-secondary); margin: 0;">
          첫 화면의 달력에서 날짜를 선택한 뒤 <b>[새로운 루틴 시작]</b>을 누르면 해당 날짜의 운동 목록으로 이동합니다.<br><br>
          <b>이미 32개의 필수 종목과 5개의 부위별 그룹</b>이 기본으로 등록되어 있어, 바로 운동을 시작하거나 나만의 그룹을 만들어 관리할 수 있습니다.
        </p>
      </div>

      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <h3 style="color: var(--accent-primary); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <i class="ph-fill ph-barbell" style="flex-shrink:0;"></i> 2. 중량/세트 관리 및 수행
        </h3>
        <p style="color: var(--text-secondary); margin: 0;">
          추가된 운동의 바(Bar)에서 세트를 준비하고 목표 중량과 횟수를 기록하세요.<br><br>
          준비가 완료되면 종목 바 우측의 <b>[진행 아이콘(>)]</b>을 눌러 실행 화면으로 들어갑니다. 특정 세트 <b>[완료]</b> 시, 기록이 보존되며 다음 세트로 이동됩니다.
        </p>
      </div>

      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <h3 style="color: var(--accent-primary); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <i class="ph-fill ph-timer" style="flex-shrink:0;"></i> 3. 휴식 타이머 적극 활용
        </h3>
        <p style="color: var(--text-secondary); margin: 0;">
          세트를 완료한 뒤 <b>[휴식]</b> 버튼을 누르면 다음 세트를 위한 타이머가 작동합니다.<br><br>
          시간이 모두 초과되면 휴대폰 진동 및 소리, 푸시 알림으로 다음 세트 시작을 즉각적으로 알려줍니다!
        </p>
      </div>

      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <h3 style="color: var(--accent-primary); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <i class="ph-fill ph-chart-line-up" style="flex-shrink:0;"></i> 4. 꼼꼼한 통계 리포트
        </h3>
        <p style="color: var(--text-secondary); margin: 0;">
          설정 메뉴의 <b>[종합 운동 리포트]</b>와 <b>[개별 종목 리포트]</b>를 적극 활용해 보세요.<br><br>
          종합 운동 리포트에서는 월/주/일별 총 소화 볼륨(무게×횟수)과 최고 중량 갱신 여부를, 개별 종목 리포트에서는 내 과거 기록들을 한눈에 쉽게 비교할 수 있습니다.
        </p>
      </div>
      
      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <h3 style="color: var(--accent-primary); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <i class="ph-fill ph-calculator" style="flex-shrink:0;"></i> 5. 5/3/1 계산기 및 진행 상황 저장
        </h3>
        <p style="color: var(--text-secondary); margin: 0;">
          S, D, B, O의 1RM을 입력하면 일주일 단위의 체계적인 훈련 중량이 계산됩니다.<br><br>
          입력한 1RM과 선택한 디로딩 옵션은 <b>브라우저에 안전하게 저장</b>되어, 앱을 재시작해도 내 진행 상황을 그대로 이어갈 수 있습니다.
        </p>
      </div>

      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <h3 style="color: var(--accent-primary); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <i class="ph-fill ph-clock-counter-clockwise" style="flex-shrink:0;"></i> 6. 종목별 맞춤 휴식 시간
        </h3>
        <p style="color: var(--text-secondary); margin: 0;">
          이제 종목마다 서로 다른 휴식 시간을 가질 수 있습니다.<br><br>
          운동 중 수행 화면에서 휴식 시간을 수정하면 해당 종목의 <b>기본 설정</b>으로 저장되어, 다음번에 같은 운동을 할 때도 내가 설정한 맞춤 시간이 적용됩니다.
        </p>
      </div>

      <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
        <h3 style="color: var(--accent-primary); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <i class="ph-fill ph-floppy-disk" style="flex-shrink:0;"></i> 7. 기기 변경 시 백업 및 복원
        </h3>
        <p style="color: var(--text-secondary); margin: 0;">
          앱의 모든 기록은 브라우저 상에 안전하게 저장됩니다. 기기를 변경할 상황을 대비하여 설정에서 <b>[데이터 백업]</b> 파일을 다운로드해 두면, 새 기기에서 간편하게 복원할 수 있습니다.
        </p>
      </div>

      <div class="glass-panel" style="padding: 16px; margin-bottom: 30px;">
        <h3 style="color: var(--accent-primary); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          <i class="ph-fill ph-heartbeat" style="flex-shrink:0;"></i> 8. 인바디 기록 및 체성분 변화 추적
        </h3>
        <p style="color: var(--text-secondary); margin: 0;">
          설정 메뉴의 <b>[인바디 기록 관리]</b>를 통해 체성분 데이터를 체계적으로 관리해 보세요.<br><br>
          측정 데이터를 입력하면 BMI와 판정 가이드가 자동으로 제공되며, 이전 기록과 비교하여 각 지표의 <b>증감(+/-)을 색상(초록/빨강)</b>으로 알기 쉽게 표시해 줍니다. 또한, 기록이 쌓이면 <b>듀얼 축(좌/우) 그래프</b>를 통해 다채로운 색상으로 시각화된 성장 추이를 한눈에 확인할 수 있습니다.
        </p>
      </div>

    </main>
  `;

  document.getElementById('tutorialBackBtn').addEventListener('click', () => {
    navigateTo('settings');
  });
}

// 12. 5/3/1 Calculator View
function renderFiveThreeOne() {
  const rms = state.fiveThreeOneRms;
  const option = state.fiveThreeOneOption;

  const calculateSets = (tm, week) => {
    let percs = [];
    let reps = [];
    if (week === 1) { percs = [0.65, 0.75, 0.85]; reps = ['5', '5', '5+']; }
    else if (week === 2) { percs = [0.70, 0.80, 0.90]; reps = ['3', '3', '3+']; }
    else if (week === 3) { percs = [0.75, 0.85, 0.95]; reps = ['5', '3', '1+']; }
    else if (week === 4 && option === 'A') { percs = [0.40, 0.50, 0.60]; reps = ['5', '5', '5']; } // Deload
    else if (week >= 4 && week <= 6 && option === 'B') {
      const wMod = week - 3;
      if (wMod === 1) { percs = [0.65, 0.75, 0.85]; reps = ['5', '5', '5+']; }
      else if (wMod === 2) { percs = [0.70, 0.80, 0.90]; reps = ['3', '3', '3+']; }
      else if (wMod === 3) { percs = [0.75, 0.85, 0.95]; reps = ['5', '3', '1+']; }
    } else if (week === 7 && option === 'B') { percs = [0.40, 0.50, 0.60]; reps = ['5', '5', '5']; } // Deload B

    return percs.map((p, i) => ({ weight: roundToStep(tm * p), reps: reps[i] }));
  };

  const getWeekTable = (week) => {
    const allLifts = [
      { name: 'S', rm: rms.squat, type: 'lower' },
      { name: 'D', rm: rms.deadlift, type: 'lower' },
      { name: 'B', rm: rms.bench, type: 'upper' },
      { name: 'O', rm: rms.ohp, type: 'upper' }
    ];

    const lifts = allLifts.filter(l => l.rm > 0);
    const count = lifts.length;
    if (count === 0) return '';

    let html = `
      <div class="glass-panel pulse-enter" style="padding: 16px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px 0; color: var(--accent-primary); font-size: 1rem;">${week}주차${(option === 'A' && week === 4) || (option === 'B' && week === 7) ? ' (디로딩)' : ''}</h3>
        <div style="display: grid; grid-template-columns: repeat(${count === 1 ? 1 : (count === 4 ? 4 : count)}, 1fr); gap: 8px;">
    `;

    lifts.forEach(lift => {
      let currentTm = lift.rm * 0.9;
      if (option === 'B' && week >= 4) {
        currentTm += (lift.type === 'lower' ? 5 : 2.5);
      }
      const sets = calculateSets(currentTm, week);

      // Responsive sizing: Larger text if fewer columns
      const headerFs = count <= 2 ? '1rem' : '0.85rem';
      const setsFs = count <= 2 ? '0.9rem' : '0.8rem';
      const cardMaxWidth = count === 1 ? '200px' : 'none';
      const cardMargin = count === 1 ? '0 auto' : '0';

      html += `
        <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; border: 1px solid rgba(255,255,255,0.05); max-width: ${cardMaxWidth}; margin: ${cardMargin}; width: 100%;">
          <div style="font-weight: 700; font-size: ${headerFs}; margin-bottom: 8px; color: var(--accent-primary); text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">${lift.name}</div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${sets.map(s => `
              <div style="font-size: ${setsFs}; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 500;">${s.weight}kg</span>
                <span style="color: var(--text-muted); font-size: 0.9em;">x${s.reps}</span>
              </div>`).join('')}
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    return html;
  };

  const updateOnlyValues = () => {
    const resultsEl = document.getElementById('calcResults');
    if (!resultsEl) return;

    document.getElementById('rmSquat').value = state.fiveThreeOneRms.squat || '';
    document.getElementById('rmDead').value = state.fiveThreeOneRms.deadlift || '';
    document.getElementById('rmBench').value = state.fiveThreeOneRms.bench || '';
    document.getElementById('rmOhp').value = state.fiveThreeOneRms.ohp || '';

    const descEl = document.getElementById('calcStrategyDesc');
    if (descEl) descEl.innerText = state.fiveThreeOneOption === 'A' ? 'W1(5s), W2(3s), W3(531), W4(Deload) 순으로 진행됩니다.' : '3주 훈련 후 TM을 증량(+2.5/5kg)하여 3주 더 훈련하고 7주차에 디로딩합니다.';

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-opt') === state.fiveThreeOneOption);
    });

    const anyRmEntered = state.fiveThreeOneRms.squat > 0 || state.fiveThreeOneRms.deadlift > 0 || state.fiveThreeOneRms.bench > 0 || state.fiveThreeOneRms.ohp > 0;
    let weeksHtml = '';
    if (anyRmEntered) {
      const totalWeeks = state.fiveThreeOneOption === 'A' ? 4 : 7;
      for (let w = 1; w <= totalWeeks; w++) {
        weeksHtml += getWeekTable(w);
      }
      resultsEl.innerHTML = weeksHtml;
    } else {
      resultsEl.innerHTML = `
        <div class="glass-panel" style="padding: 40px 20px; text-align: center; opacity: 0.8; margin-bottom: 20px;">
          <i class="ph ph-info" style="font-size: 2.5rem; margin-bottom: 15px; display: block; color: var(--accent-primary);"></i>
          <div style="font-size: 1rem; line-height: 1.5; color: var(--text-primary);">
            S, D, B, O 중 <span style="color: var(--accent-primary); font-weight: 700;">하나 이상의 1RM</span>을<br>
            입력하면 일주일 단위 계산이 시작됩니다.
          </div>
        </div>
      `;
    }
    setTimeout(autoFitText, 0);
  };

  if (document.getElementById('calcResults')) {
    updateOnlyValues();
    return;
  }

  let weeksHtml = '';
  const anyRmEntered = rms.squat > 0 || rms.deadlift > 0 || rms.bench > 0 || rms.ohp > 0;
  if (anyRmEntered) {
    const totalWeeks = option === 'A' ? 4 : 7;
    for (let w = 1; w <= totalWeeks; w++) {
      weeksHtml += getWeekTable(w);
    }
  } else {
    weeksHtml = `
      <div class="glass-panel" style="padding: 40px 20px; text-align: center; opacity: 0.8; margin-bottom: 20px;">
        <i class="ph ph-info" style="font-size: 2.5rem; margin-bottom: 15px; display: block; color: var(--accent-primary);"></i>
        <div style="font-size: 1rem; line-height: 1.5; color: var(--text-primary);">
          S, D, B, O 중 <span style="color: var(--accent-primary); font-weight: 700;">하나 이상의 1RM</span>을<br>
          입력하면 일주일 단위 계산이 시작됩니다.
        </div>
      </div>
    `;
  }

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="calcBackBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>5/3/1 계산기</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main style="padding-bottom: 40px;">
      <div class="glass-panel" style="padding: 20px; margin-bottom: 25px;">
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1rem; margin-bottom: 15px;">1RM 입력</h3>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 15px;">
            <div class="form-group">
              <label style="font-size: 0.75rem;">S</label>
              <input type="number" id="rmSquat" class="form-control" value="${rms.squat || ''}" placeholder="0" step="2.5" style="padding: 8px 4px; text-align: center;">
            </div>
            <div class="form-group">
              <label style="font-size: 0.75rem;">D</label>
              <input type="number" id="rmDead" class="form-control" value="${rms.deadlift || ''}" placeholder="0" step="2.5" style="padding: 8px 4px; text-align: center;">
            </div>
            <div class="form-group">
              <label style="font-size: 0.75rem;">B</label>
              <input type="number" id="rmBench" class="form-control" value="${rms.bench || ''}" placeholder="0" step="2.5" style="padding: 8px 4px; text-align: center;">
            </div>
            <div class="form-group">
              <label style="font-size: 0.75rem;">O</label>
              <input type="number" id="rmOhp" class="form-control" value="${rms.ohp || ''}" placeholder="0" step="2.5" style="padding: 8px 4px; text-align: center;">
            </div>
          </div>

          <button class="btn btn-secondary" id="incCycleBtn" style="width: 100%; padding: 10px; font-size: 0.9rem; border-radius: 8px; background: rgba(var(--accent-primary-rgb), 0.15); border: 1px solid rgba(var(--accent-primary-rgb), 0.2); color: var(--accent-primary); font-weight: 600; justify-content: center; touch-action: manipulation;">
            <i class="ph ph-plus-circle" style="font-size: 1.1rem;"></i> 차기 사이클로 증량 (+2.5kg)
          </button>
        </div>
        
        <div>
          <h3 style="font-size: 1rem; margin-bottom: 15px;">디로딩 전략 선택</h3>
          <div class="mode-toggle">
            <div class="mode-btn ${option === 'A' ? 'active' : ''}" data-opt="A">Option A (4주)</div>
            <div class="mode-btn ${option === 'B' ? 'active' : ''}" data-opt="B">Option B (7주)</div>
          </div>
          <p id="calcStrategyDesc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 10px; line-height: 1.4;">
            ${option === 'A' ? 'W1(5s), W2(3s), W3(531), W4(Deload) 순으로 진행됩니다.' : '3주 훈련 후 TM을 증량(+2.5/5kg)하여 3주 더 훈련하고 7주차에 디로딩합니다.'}
          </p>
        </div>
      </div>

      <div id="calcResults">
        ${weeksHtml}
      </div>
    </main>
  `;

  document.getElementById('calcBackBtn').addEventListener('click', () => {
    navigateTo('settings');
  });

  document.getElementById('incCycleBtn').addEventListener('click', () => {
    state.fiveThreeOneRms.squat = (state.fiveThreeOneRms.squat || 0) + 2.5;
    state.fiveThreeOneRms.deadlift = (state.fiveThreeOneRms.deadlift || 0) + 2.5;
    state.fiveThreeOneRms.bench = (state.fiveThreeOneRms.bench || 0) + 2.5;
    state.fiveThreeOneRms.ohp = (state.fiveThreeOneRms.ohp || 0) + 2.5;
    localStorage.setItem('fiveThreeOneRms', JSON.stringify(state.fiveThreeOneRms));
    renderFiveThreeOne();
  });

  ['rmSquat', 'rmDead', 'rmBench', 'rmOhp'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      if (id === 'rmSquat') state.fiveThreeOneRms.squat = val;
      if (id === 'rmDead') state.fiveThreeOneRms.deadlift = val;
      if (id === 'rmBench') state.fiveThreeOneRms.bench = val;
      if (id === 'rmOhp') state.fiveThreeOneRms.ohp = val;
      localStorage.setItem('fiveThreeOneRms', JSON.stringify(state.fiveThreeOneRms));

      // Update results without full re-render to preserve focus
      const resultsEl = document.getElementById('calcResults');
      if (resultsEl) {
        const newRms = state.fiveThreeOneRms;
        const newOption = state.fiveThreeOneOption;
        const newAnyEntered = newRms.squat > 0 || newRms.deadlift > 0 || newRms.bench > 0 || newRms.ohp > 0;

        if (newAnyEntered) {
          let newHtml = '';
          const totalW = newOption === 'A' ? 4 : 7;
          for (let w = 1; w <= totalW; w++) {
            newHtml += getWeekTable(w);
          }
          resultsEl.innerHTML = newHtml;
        } else {
          resultsEl.innerHTML = `
            <div class="glass-panel" style="padding: 40px 20px; text-align: center; opacity: 0.8; margin-bottom: 20px;">
              <i class="ph ph-info" style="font-size: 2.5rem; margin-bottom: 15px; display: block; color: var(--accent-primary);"></i>
              <div style="font-size: 1rem; line-height: 1.5; color: var(--text-primary);">
                S, D, B, O 중 <span style="color: var(--accent-primary); font-weight: 700;">하나 이상의 1RM</span>을<br>
                입력하면 일주일 단위 계산이 시작됩니다.
              </div>
            </div>
          `;
        }
      }
    });
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.fiveThreeOneOption = e.target.getAttribute('data-opt');
      localStorage.setItem('fiveThreeOneOption', state.fiveThreeOneOption);
      renderFiveThreeOne();
    });
  });

  setTimeout(autoFitText, 0);
}

// 13. 1RM Calculator (Estimator) View
function renderOneRmCalculator() {
  const input = state.oneRmInput;
  const w = input.weight || 0;
  const r = input.reps || 0;

  let resultsHtml = '';
  if (w > 0 && r > 0) {
    // Epley: W * (1 + R/30)
    const epleyRaw = w * (1 + r / 30);
    // Brzycki: W / (1.0278 - (0.0278 * R))
    const brzyckiRaw = w / (1.0278 - (0.0278 * r));
    // Wendler: (W * R * 0.0333) + W
    const wendlerRaw = (w * r * 0.0333) + w;

    const averageRaw = (epleyRaw + brzyckiRaw + wendlerRaw) / 3;

    const epley = roundToStep(epleyRaw, 0.5);
    const brzycki = roundToStep(brzyckiRaw, 0.5);
    const wendler = roundToStep(wendlerRaw, 0.5);
    const average = roundToStep(averageRaw, 0.5);

    resultsHtml = `
      <div class="glass-panel" style="padding: 20px; margin-bottom: 20px;">
        <h3 style="font-size: 1.1rem; color: var(--accent-primary); margin: 0 0 20px 0; text-align: center;">추정 결과 (단위: kg)</h3>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: rgba(var(--accent-primary-rgb), 0.1); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid rgba(var(--accent-primary-rgb), 0.2);">
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;">최종 추천 1RM (평균값)</div>
            <div style="font-size: 2.5rem; font-weight: 800; color: var(--accent-primary);">${average.toFixed(1)}</div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Epley</div>
              <div style="font-size: 1.1rem; font-weight: 700;">${epley.toFixed(1)}</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Brzycki</div>
              <div style="font-size: 1.1rem; font-weight: 700;">${brzycki.toFixed(1)}</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Wendler</div>
              <div style="font-size: 1.1rem; font-weight: 700;">${wendler.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="glass-panel" style="padding: 16px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
        <i class="ph ph-info-circle" style="color: var(--accent-primary); margin-right: 4px;"></i>
        여러 공식을 평균낸 수치입니다. 고립 운동(머신)은 Brzycki, 전신 운동(바벨)은 Epley 공식을 더 신뢰할 수 있습니다.
      </div>
    `;
  } else {
    resultsHtml = `
      <div class="glass-panel" style="padding: 40px 20px; text-align: center; opacity: 0.7;">
        <i class="ph ph-calculator" style="font-size: 3rem; margin-bottom: 15px; display: block; color: var(--text-muted); margin-left: auto; margin-right: auto;"></i>
        데이터를 입력하면 추정 1RM이 실시간으로 계산됩니다.
      </div>
    `;
  }

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="oneRmBackBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>1RM 추정</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main>
      <div class="glass-panel" style="padding: 20px; margin-bottom: 25px;">
        <h3 style="font-size: 1rem; margin-bottom: 15px;">수행 데이터 입력</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label>수행 중량 (kg)</label>
            <input type="number" id="oneRmWeight" class="form-control" value="${input.weight || ''}" placeholder="0" step="0.5">
          </div>
          <div class="form-group">
            <label>반복 횟수 (회)</label>
            <input type="number" id="oneRmReps" class="form-control" value="${input.reps || ''}" placeholder="0" step="1">
          </div>
        </div>
      </div>
      
      <div id="oneRmResults">
        ${resultsHtml}
      </div>
    </main>
  `;

  document.getElementById('oneRmBackBtn').addEventListener('click', () => {
    navigateTo('settings');
  });

  const updateResults = () => {
    const freshW = parseFloat(document.getElementById('oneRmWeight').value) || 0;
    const freshR = parseInt(document.getElementById('oneRmReps').value) || 0;
    state.oneRmInput.weight = freshW;
    state.oneRmInput.reps = freshR;
    localStorage.setItem('oneRmInput', JSON.stringify(state.oneRmInput));

    // Partial update to avoid losing focus
    const container = document.getElementById('oneRmResults');
    if (!container) return;

    if (freshW > 0 && freshR > 0) {
      const eRaw = freshW * (1 + freshR / 30);
      const bRaw = freshW / (1.0278 - (0.0278 * freshR));
      const wRaw = (freshW * freshR * 0.0333) + freshW;
      const avgRaw = (eRaw + bRaw + wRaw) / 3;

      const e = roundToStep(eRaw, 0.5);
      const b = roundToStep(bRaw, 0.5);
      const w = roundToStep(wRaw, 0.5);
      const avg = roundToStep(avgRaw, 0.5);

      container.innerHTML = `
        <div class="glass-panel" style="padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 1.1rem; color: var(--accent-primary); margin: 0 0 20px 0; text-align: center;">추정 결과 (단위: kg)</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="background: rgba(var(--accent-primary-rgb), 0.1); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid rgba(var(--accent-primary-rgb), 0.2);">
              <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;">최종 추천 1RM (평균값)</div>
              <div style="font-size: 2.5rem; font-weight: 800; color: var(--accent-primary);">${avg.toFixed(1)}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Epley</div>
                <div style="font-size: 1.1rem; font-weight: 700;">${e.toFixed(1)}</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Brzycki</div>
                <div style="font-size: 1.1rem; font-weight: 700;">${b.toFixed(1)}</div>
              </div>
              <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Wendler</div>
                <div style="font-size: 1.1rem; font-weight: 700;">${w.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="glass-panel" style="padding: 16px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
          <i class="ph ph-info-circle" style="color: var(--accent-primary); margin-right: 4px;"></i>
          여러 공식을 평균낸 수치입니다. 고립 운동(머신)은 Brzycki, 전신 운동(바벨)은 Epley 공식을 더 신뢰할 수 있습니다.
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="glass-panel" style="padding: 40px 20px; text-align: center; opacity: 0.7;">
          <i class="ph ph-calculator" style="font-size: 3rem; margin-bottom: 15px; display: block; color: var(--text-muted); margin-left: auto; margin-right: auto;"></i>
          데이터를 입력하면 추정 1RM이 실시간으로 계산됩니다.
        </div>
      `;
    }
  };

  document.getElementById('oneRmWeight').addEventListener('input', updateResults);
  document.getElementById('oneRmReps').addEventListener('input', updateResults);

  setTimeout(autoFitText, 0);
}

// 14. InBody Views
function getBmiCategory(bmi) {
  if (bmi < 18.5) return { text: '표준 이하', color: 'var(--accent-primary)' };
  if (bmi < 25) return { text: '표준', color: 'var(--success)' };
  return { text: '표준 이상', color: 'var(--danger)' };
}

function renderAddInBody() {
  const today = formatDate(new Date());
  // Try to find previous height
  const lastHeight = state.inbodyRecords.length > 0 ? state.inbodyRecords[0].height : 175;

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="cancelInBodyBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>인바디 기록 추가</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main>
      <div class="glass-panel" style="padding: 20px; margin-top: 15px;">
        <div class="form-group">
          <label>측정 일자</label>
          <input type="date" id="inbodyDate" class="form-control" value="${today}">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label>신장 (cm)</label>
            <input type="number" id="inbodyHeight" class="form-control" value="${lastHeight}" step="0.1">
          </div>
          <div class="form-group">
            <label>체중 (kg)</label>
            <input type="number" id="inbodyWeight" class="form-control" placeholder="0.0" step="0.1">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label>골격근량 (kg)</label>
            <input type="number" id="inbodyMuscle" class="form-control" placeholder="0.0" step="0.1">
          </div>
          <div class="form-group">
            <label>체지방량 (kg)</label>
            <input type="number" id="inbodyFat" class="form-control" placeholder="0.0" step="0.1">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label>체지방률 (%)</label>
            <input type="number" id="inbodyFatPct" class="form-control" placeholder="0.0" step="0.1">
          </div>
          <div class="form-group">
            <label>인바디 점수 (점)</label>
            <input type="number" id="inbodyScore" class="form-control" placeholder="0" step="1">
          </div>
        </div>

        <div id="bmiPreview" style="margin: 20px 0; padding: 15px; border-radius: 12px; background: rgba(var(--accent-primary-rgb), 0.1); text-align: center; display: none;">
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">예상 BMI</div>
          <div id="bmiValText" style="font-size: 1.8rem; font-weight: 800; color: var(--accent-primary);">0.0</div>
          <div id="bmiCatText" style="font-size: 1rem; font-weight: 600; margin-top: 4px;">판정중...</div>
        </div>

        <button class="btn btn-primary" id="saveInBodyBtn" style="margin-top: 10px; width: 100%;">저장하기</button>
      </div>
    </main>
  `;

  const weightIn = document.getElementById('inbodyWeight');
  const heightIn = document.getElementById('inbodyHeight');
  const preview = document.getElementById('bmiPreview');

  const updateBmi = () => {
    const w = parseFloat(weightIn.value);
    const h = parseFloat(heightIn.value) / 100;
    if (w > 0 && h > 0) {
      const bmi = w / (h * h);
      const cat = getBmiCategory(bmi);
      preview.style.display = 'block';
      document.getElementById('bmiValText').innerText = bmi.toFixed(1);
      document.getElementById('bmiCatText').innerText = cat.text;
      document.getElementById('bmiCatText').style.color = cat.color;
    } else {
      preview.style.display = 'none';
    }
  };

  weightIn.addEventListener('input', updateBmi);
  heightIn.addEventListener('input', updateBmi);

  document.getElementById('cancelInBodyBtn').addEventListener('click', () => {
    navigateTo('inbody-list');
  });

  document.getElementById('saveInBodyBtn').addEventListener('click', async () => {
    const date = document.getElementById('inbodyDate').value;
    const height = parseFloat(document.getElementById('inbodyHeight').value);
    const weight = parseFloat(document.getElementById('inbodyWeight').value);
    const skeletalMuscle = parseFloat(document.getElementById('inbodyMuscle').value);
    const bodyFatMass = parseFloat(document.getElementById('inbodyFat').value);
    const bodyFatPercent = parseFloat(document.getElementById('inbodyFatPct').value);
    const score = parseInt(document.getElementById('inbodyScore').value) || 0;

    if (!date || !weight || !height) {
      alert("날짜, 신장, 체중은 필수 입력 항목입니다.");
      return;
    }

    const hM = height / 100;
    const bmi = weight / (hM * hM);

    const record = { date, height, weight, skeletalMuscle, bodyFatMass, bodyFatPercent, bmi, score };
    await putRecord('inbody', record);
    state.inbodyRecords = await getAllRecords('inbody');
    state.inbodyRecords.sort((a, b) => b.date.localeCompare(a.date));
    navigateTo('inbody-list');
  });
}

function renderInBodyList() {
  const records = [...state.inbodyRecords].sort((a, b) => b.date.localeCompare(a.date));

  let listHtml = '';
  if (records.length === 0) {
    listHtml = `<div class="info-text">측정 기록이 없습니다. 새로운 기록을 추가해보세요.</div>`;
  } else {
    records.forEach((rec, idx) => {
      const prev = records[idx + 1]; // Older record
      const cat = getBmiCategory(rec.bmi);

      const getDeltaHtml = (curr, prevVal, key) => {
        if (!prevVal) return '';
        const delta = curr - prevVal;

        // Color logic based on field type
        // Weight, Muscle, Score: Increase(+) is Green, Decrease(-) is Red
        // Fat Mass, Fat Pct, BMI: Increase(+) is Red, Decrease(-) is Green
        const positiveFields = ['weight', 'skeletalMuscle', 'score'];
        const negativeFields = ['bodyFatMass', 'bodyFatPercent', 'bmi'];

        let color;
        if (positiveFields.includes(key)) {
          color = delta > 0 ? 'var(--success)' : (delta < 0 ? 'var(--danger)' : 'var(--text-muted)');
        } else {
          color = delta > 0 ? 'var(--danger)' : (delta < 0 ? 'var(--success)' : 'var(--text-muted)');
        }

        const sign = delta > 0 ? '+' : '';
        return `<span style="font-size: 0.8rem; color: ${color}; margin-left: 6px; font-weight: 600;">(${sign}${delta.toFixed(1)})</span>`;
      };

      listHtml += `
        <div class="glass-panel" style="padding: 16px; margin-bottom: 12px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-weight: 700; color: var(--text-primary); font-size: 1rem;">
              <i class="ph ph-calendar-blank"></i> ${rec.date}
            </div>
            <div style="font-size: 0.85rem; padding: 4px 10px; border-radius: 12px; background: rgba(var(--accent-primary-rgb), 0.1); color: ${cat.color}; font-weight: 700;">
              ${cat.text}
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.95rem;">
            <div style="color: var(--text-secondary);">체중: <span style="color: var(--text-primary); font-weight: 600;">${rec.weight}kg</span>${getDeltaHtml(rec.weight, prev ? prev.weight : null, 'weight')}</div>
            <div style="color: var(--text-secondary);">BMI: <span style="color: var(--text-primary); font-weight: 600;">${rec.bmi.toFixed(1)}</span>${getDeltaHtml(rec.bmi, prev ? prev.bmi : null, 'bmi')}</div>
            <div style="color: var(--text-secondary);">골격근: <span style="color: var(--text-primary); font-weight: 600;">${rec.skeletalMuscle || 0}kg</span>${getDeltaHtml(rec.skeletalMuscle, prev ? prev.skeletalMuscle : null, 'skeletalMuscle')}</div>
            <div style="color: var(--text-secondary);">체지방: <span style="color: var(--text-primary); font-weight: 600;">${rec.bodyFatMass || 0}kg</span>${getDeltaHtml(rec.bodyFatMass, prev ? prev.bodyFatMass : null, 'bodyFatMass')}</div>
            <div style="color: var(--text-secondary);">지방률: <span style="color: var(--text-primary); font-weight: 600;">${rec.bodyFatPercent || 0}%</span>${getDeltaHtml(rec.bodyFatPercent, prev ? prev.bodyFatPercent : null, 'bodyFatPercent')}</div>
            <div style="color: var(--text-secondary);">점수: <span style="color: var(--text-primary); font-weight: 600;">${rec.score || 0}점</span>${getDeltaHtml(rec.score, prev ? prev.score : null, 'score')}</div>
          </div>
          <button class="icon-btn delete-inbody-btn" data-date="${rec.date}" style="position: absolute; bottom: 10px; right: 10px; opacity: 0.5;"><i class="ph ph-trash"></i></button>
        </div>
      `;
    });
  }

  appEl.innerHTML = `
    <header>
      <button class="icon-btn" id="inbodyBackBtn"><i class="ph ph-arrow-left"></i></button>
      <h1>인바디 기록</h1>
      <button class="icon-btn" style="visibility: hidden;"><i class="ph ph-arrow-left"></i></button>
    </header>
    <main>
      ${records.length >= 2 ? `
        <div class="glass-panel" style="padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 0.95rem; color: var(--accent-primary);">체성분 추이 그래프</h3>
          <div id="inbodyGraphContainer" style="height: 220px; width: 100%;"></div>
          <div style="display: flex; justify-content: center; gap: 15px; margin-top: 15px; font-size: 0.75rem;">
            <span style="display:flex; align-items:center; gap:4px;"><i class="ph-fill ph-circle" style="color:hsl(var(--accent-hue), 80%, 60%);"></i> 체중</span>
            <span style="display:flex; align-items:center; gap:4px;"><i class="ph-fill ph-circle" style="color:var(--success);"></i> 골격근</span>
            <span style="display:flex; align-items:center; gap:4px;"><i class="ph-fill ph-circle" style="color:var(--danger);"></i> 체지방</span>
          </div>
        </div>
      ` : ''}
      
      <div style="display: flex; flex-direction: column; padding-bottom: 80px;">
        ${listHtml}
      </div>

      <button class="fab" id="addInBodyFab" style="bottom: 20px; right: 20px;">
        <i class="ph-bold ph-plus"></i>
      </button>
    </main>
  `;

  document.getElementById('inbodyBackBtn').addEventListener('click', () => {
    navigateTo('settings');
  });

  document.getElementById('addInBodyFab').addEventListener('click', () => {
    navigateTo('add-inbody');
  });

  document.querySelectorAll('.delete-inbody-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const date = e.currentTarget.getAttribute('data-date');
      if (confirm(`${date} 기록을 삭제하시겠습니까?`)) {
        const tx = dbInfo.db.transaction(['inbody'], 'readwrite');
        tx.objectStore('inbody').delete(date);
        tx.oncomplete = async () => {
          state.inbodyRecords = await getAllRecords('inbody');
          state.inbodyRecords.sort((a, b) => b.date.localeCompare(a.date));
          renderInBodyList();
        };
      }
    });
  });

  if (records.length >= 2) {
    renderInBodyGraph('inbodyGraphContainer', [...records].reverse());
  }
}

function renderInBodyGraph(containerId, records) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;
  const padding = { top: 20, right: 35, bottom: 25, left: 35 };

  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;

  // Split keys by 50 threshold rule
  // Left Axis: Values >= 50
  // Right Axis: Values < 50
  const allPlotKeys = ['weight', 'skeletalMuscle', 'bodyFatMass'];
  const leftKeys = allPlotKeys.filter(k => (records[0][k] || 0) >= 50);
  const rightKeys = allPlotKeys.filter(k => (records[0][k] || 0) < 50);

  const getMinMax = (keys) => {
    const vals = records.flatMap(r => keys.map(k => r[k] || 0)).filter(v => v !== 0);
    if (vals.length === 0) return { min: 0, max: 100 };
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const margin = (max - min) * 0.15 || 10;
    return { min: Math.max(0, min - margin), max: max + margin };
  };

  const leftScale = getMinMax(leftKeys);
  const rightScale = getMinMax(rightKeys);

  const getX = (idx) => padding.left + (idx / (records.length - 1)) * usableWidth;
  const getY = (val, scale) => {
    const range = scale.max - scale.min || 1;
    return padding.top + usableHeight - ((val - scale.min) / range) * usableHeight;
  };

  // Helper for colors based on theme
  const hue = getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim() || '220';
  const colors = {
    weight: `hsl(${hue}, 80%, 60%)`,
    score: `hsl(${hue}, 40%, 75%)`,
    skeletalMuscle: 'var(--success)',
    bodyFatMass: 'var(--danger)',
    bodyFatPercent: 'var(--warning)'
  };

  const drawLine = (key, scale) => {
    const color = colors[key];
    let path = `M ${getX(0)} ${getY(records[0][key] || 0, scale)}`;
    let points = '';
    records.forEach((r, i) => {
      const x = getX(i);
      const y = getY(r[key] || 0, scale);
      if (i > 0) path += ` L ${x} ${y}`;
      points += `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--bg-card)" stroke="${color}" stroke-width="1.5" />`;
    });
    return `
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${points}
    `;
  };

  let linesHtml = '';
  leftKeys.forEach(k => linesHtml += drawLine(k, leftScale));
  rightKeys.forEach(k => linesHtml += drawLine(k, rightScale));

  // Grid Lines (based on left scale for consistency)
  let gridHtml = '';
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (usableHeight / 4) * i;
    gridHtml += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--border-color)" stroke-width="0.5" stroke-dasharray="4 4" />`;
  }

  container.innerHTML = `
    <svg width="${width}" height="${height}" style="overflow: visible; font-family: inherit;">
      ${gridHtml}
      
      <!-- Left Axis Labels (5 values) -->
      ${[0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const val = leftScale.max - (leftScale.max - leftScale.min) * ratio;
    const y = padding.top + usableHeight * ratio;
    return `<text x="${padding.left - 5}" y="${y}" font-size="8" fill="var(--text-muted)" text-anchor="end" alignment-baseline="middle">${val.toFixed(0)}</text>`;
  }).join('')}
      <text x="${padding.left - 5}" y="${padding.top - 12}" font-size="8" fill="var(--text-muted)" text-anchor="end" font-weight="bold">L (kg)</text>

      <!-- Right Axis Labels (5 values) -->
      ${[0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const val = rightScale.max - (rightScale.max - rightScale.min) * ratio;
    const y = padding.top + usableHeight * ratio;
    return `<text x="${width - padding.right + 5}" y="${y}" font-size="8" fill="var(--text-muted)" text-anchor="start" alignment-baseline="middle">${val.toFixed(0)}</text>`;
  }).join('')}
      <text x="${width - padding.right + 5}" y="${padding.top - 12}" font-size="8" fill="var(--text-muted)" text-anchor="start" font-weight="bold">R (kg)</text>
      
      ${linesHtml}
    </svg>
  `;
}
// Start
startApp();
