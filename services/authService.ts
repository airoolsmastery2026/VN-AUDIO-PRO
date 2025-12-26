
import { UserProfile, Transaction } from '../types';

const USERS_STORAGE_KEY = 'VN_AUDIO_PRO_USERS';
const CURRENT_USER_KEY = 'VN_AUDIO_PRO_CURRENT_USER';
const TRANSACTIONS_KEY = 'VN_AUDIO_PRO_TRANSACTIONS';

export function getUsers(): UserProfile[] {
  const saved = localStorage.getItem(USERS_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function getCurrentUser(): UserProfile | null {
  const saved = localStorage.getItem(CURRENT_USER_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function register(email: string, username: string, fullName: string, password: string, phoneNumber: string): { success: boolean; message: string; user?: UserProfile } {
  const users = getUsers();
  
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Email này đã được đăng ký.' };
  }

  if (users.find(u => u.username === username)) {
    return { success: false, message: 'Tên đăng nhập này đã tồn tại.' };
  }

  const isFirstUser = users.length === 0;
  const isAdmin = isFirstUser || username === 'admin' || email.includes('admin@vnaudiopro.com');

  const newUser: any = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    username,
    fullName,
    phoneNumber,
    password, 
    joinedAt: Date.now(),
    lastActive: Date.now(),
    requestCount: 0,
    accountType: isAdmin ? 'enterprise' : 'free',
    isAdmin: isAdmin
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  const { password: _, ...profile } = newUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  
  return { success: true, message: 'Đăng ký thành công!', user: profile as UserProfile };
}

export function login(loginIdentifier: string, password: string): { success: boolean; message: string; user?: UserProfile } {
  const users = getUsers() as any[];
  const user = users.find(u => (u.email === loginIdentifier || u.username === loginIdentifier) && u.password === password);
  
  if (!user) {
    return { success: false, message: 'Thông tin đăng nhập hoặc mật khẩu không chính xác.' };
  }

  user.lastActive = Date.now();
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const { password: _, ...profile } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  
  return { success: true, message: 'Đăng nhập thành công!', user: profile as UserProfile };
}

export function updateUserAccountType(userId: string, newType: 'free' | 'pro' | 'enterprise'): boolean {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].accountType = newType;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  }
  return false;
}

export function deleteUser(userId: string): boolean {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);
  if (filtered.length !== users.length) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
  return false;
}

export function getTransactions(): Transaction[] {
  const saved = localStorage.getItem(TRANSACTIONS_KEY);
  if (!saved) {
    // Tạo dữ liệu mẫu nếu chưa có
    const mockTransactions: Transaction[] = [
      { id: 'tx1', userId: 'u1', userEmail: 'demo@pro.com', amount: 199000, planName: 'Chuyên nghiệp', status: 'completed', timestamp: Date.now() - 86400000, referenceCode: 'VNAUDIO-9821' },
      { id: 'tx2', userId: 'u2', userEmail: 'test@user.vn', amount: 499000, planName: 'Doanh nghiệp', status: 'pending', timestamp: Date.now() - 3600000, referenceCode: 'VNAUDIO-9822' }
    ];
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(mockTransactions));
    return mockTransactions;
  }
  return JSON.parse(saved);
}

export function updateTransactionStatus(txId: string, status: 'completed' | 'failed'): boolean {
  const txs = getTransactions();
  const index = txs.findIndex(t => t.id === txId);
  if (index !== -1) {
    txs[index].status = status;
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
    
    // Nếu hoàn thành, tự động nâng cấp user (giả lập)
    if (status === 'completed') {
      const users = getUsers();
      const userIdx = users.findIndex(u => u.id === txs[index].userId);
      if (userIdx !== -1) {
        users[userIdx].accountType = txs[index].planName === 'Doanh nghiệp' ? 'enterprise' : 'pro';
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
    }
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
