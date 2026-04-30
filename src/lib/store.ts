// In-memory store cho demo — dữ liệu sẽ mất khi restart server
// Trong production thật sẽ dùng Database (Prisma, Drizzle...)
// Dùng globalThis để đảm bảo CÙNG instance giữa Server Actions và API Routes

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

// Extend globalThis type
declare global {
  // eslint-disable-next-line no-var
  var __formBattleStore: StatsData | undefined;
}

// Dùng globalThis để persist state giữa hot reloads và module boundaries
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

export function getStats(): StatsData {
  const store = getStore();
  return {
    ...store,
    submissions: [...store.submissions],
  };
}

export function incrementStat(key: keyof Omit<StatsData, 'submissions'>) {
  const store = getStore();
  (store[key] as number)++;
}

export function addSubmission(email: string, isSecure: boolean) {
  const store = getStore();
  store.submissions.push({
    email,
    timestamp: new Date().toISOString(),
    isSecure,
  });
}

export function resetStats() {
  globalThis.__formBattleStore = {
    clickMiss: 0,
    validationFail: 0,
    hackAttempt: 0,
    successCount: 0,
    submissions: [],
  };
}
