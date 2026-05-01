// In-memory store cho demo (production thật sẽ dùng Database)

export type StatsData = {
  clickMiss: number;
  validationFail: number;
  hackAttempt: number;
  successCount: number;
  submissions: Array<{
    email: string;
    timestamp: string;
    isSecure: boolean;
  }>;
};

declare global {
  // eslint-disable-next-line no-var
  var __formBattleStore: StatsData | undefined;
}

// Lấy store instance (tạo mới nếu chưa có)
function getStore(): StatsData {
  if (!globalThis.__formBattleStore) {
    globalThis.__formBattleStore = {
      clickMiss: 0,
      validationFail: 0,
      hackAttempt: 0,
      successCount: 0,
      submissions: [],
    };
  }
  return globalThis.__formBattleStore;
}

// Đọc stats hiện tại
export function getStats(): StatsData {
  const store = getStore();
  return {
    ...store,
    submissions: [...store.submissions],
  };
}

// Tăng số liệu thống kê
export function incrementStat(key: keyof Omit<StatsData, 'submissions'>) {
  const store = getStore();
  (store[key] as number)++;
}

// Thêm submission vào danh sách
export function addSubmission(email: string, isSecure: boolean) {
  const store = getStore();
  store.submissions.push({
    email,
    timestamp: new Date().toISOString(),
    isSecure,
  });
}

// Reset toàn bộ stats
export function resetStats() {
  globalThis.__formBattleStore = {
    clickMiss: 0,
    validationFail: 0,
    hackAttempt: 0,
    successCount: 0,
    submissions: [],
  };
}
