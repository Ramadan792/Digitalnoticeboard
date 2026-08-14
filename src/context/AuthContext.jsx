import { createContext, useContext, useState } from 'react';

// Hardcoded per the spec — no real backend auth yet. Students authenticate
// by ID only (no password); all admins share one password but differ in
// what they can do, tracked via each admin's `isMainAdmin` flag.
const STUDENTS = [
  { id: 'STU-2024-001', name: 'Chidi Okonkwo' },
  { id: 'STU-2024-002', name: 'Amaka Nwosu' },
  { id: 'STU-2024-003', name: 'Emeka Adeleke' },
  { id: 'STU-2024-004', name: 'Fatima Suleiman' },
];

const ADMINS = [
  { name: 'Mrs. Adaeze Okoro', isMainAdmin: false },
  { name: 'Mr. Tunde Bello', isMainAdmin: false },
  { name: 'Main Admin', isMainAdmin: true },
];

const ADMIN_PASSWORD = 'DigitalNoticeBoard';

const STORAGE_KEY = 'noticeboard_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // `user` is either null (signed out) or a shape like:
  //   { type: 'student', studentId, name }
  //   { type: 'admin', name, isMainAdmin }
  // Reading localStorage in the initializer (not an effect) avoids a
  // flash of "signed out" on refresh before rehydration runs.
  const [user, setUser] = useState(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    // Corrupted/invalid data from an older version or manual edit —
    // wipe it instead of crashing the whole app on mount.
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
});

  const persist = (nextUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  // Returns the matched student on success, null on failure — lets
  // Landing.jsx show an inline error without a try/catch.
  const loginStudent = (studentId) => {
    const match = STUDENTS.find(
      (s) => s.id.toLowerCase() === studentId.trim().toLowerCase()
    );
    if (!match) return null;
    const nextUser = { type: 'student', studentId: match.id, name: match.name };
    persist(nextUser);
    return nextUser;
  };
const loginAdmin = (name, password) => {
  const match = ADMINS.find(
    (a) => a.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (!match || password !== ADMIN_PASSWORD) return null;
  const nextUser = { type: 'admin', name: match.name, isMainAdmin: match.isMainAdmin };
  persist(nextUser);
  return nextUser;
};

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  // Derived role flags, computed here once so every component reads the
  // same boolean logic instead of re-deriving `user.type === 'admin'`
  // (and similar) in a dozen different places.
  //
  // Permission rule (per spec): isAdmin lets any admin log in and VIEW
  // all submitted notices. isMainAdmin is the only flag that unlocks
  // Approve/Reject/Delete — Mrs. Okoro and Mr. Bello are isAdmin but not
  // isMainAdmin, so AdminAllNews.jsx renders them a read-only table.
  const value = {
    user,
    isAuthenticated: !!user,
    isStudent: user?.type === 'student',
    isAdmin: user?.type === 'admin',
    isMainAdmin: user?.type === 'admin' && user.isMainAdmin === true,
    adminList: ADMINS.map((a) => a.name), // for populating the admin login dropdown
    loginStudent,
    loginAdmin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
