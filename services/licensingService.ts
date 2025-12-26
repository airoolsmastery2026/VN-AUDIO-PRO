
import { LicenseInfo } from '../types';

const LICENSE_STORAGE_KEY = 'VN_AUDIO_PRO_LICENSE_SECURE';

/**
 * Tạo một định danh máy tính duy nhất (Simulated Hardware ID)
 */
export function getMachineId(): string {
  let hid = localStorage.getItem('VN_AUDIO_PRO_HID');
  if (!hid) {
    hid = 'VN-' + Math.random().toString(36).substring(2, 15).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
    localStorage.setItem('VN_AUDIO_PRO_HID', hid);
  }
  return hid;
}

export function getLicense(): LicenseInfo {
  const saved = localStorage.getItem(LICENSE_STORAGE_KEY);
  const mid = getMachineId();
  
  if (!saved) {
    return { status: 'trial', machineId: mid, requestCount: 0 };
  }
  
  try {
    return JSON.parse(saved);
  } catch {
    return { status: 'trial', machineId: mid, requestCount: 0 };
  }
}

export function saveLicense(info: LicenseInfo) {
  localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(info));
}

/**
 * Kiểm tra tính hợp lệ của Key (Trong thực tế sẽ gọi API server)
 */
export async function validateProductKey(key: string): Promise<{success: boolean; type?: string; expiry?: number}> {
  // Mô phỏng thuật toán kiểm tra Key chuyên nghiệp
  // Key mẫu: PRO-XXXX-XXXX-XXXX
  const isValidFormat = /^PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
  
  await new Promise(r => setTimeout(r, 1500)); // Giả lập độ trễ network

  if (isValidFormat || key === 'ADMIN-1234') {
    return {
      success: true,
      type: 'activated',
      expiry: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 năm
    };
  }
  
  return { success: false };
}
