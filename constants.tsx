
import { Voice } from './types';

// Short dummy base64 strings to represent "provided" reference audio samples
// In a production app, these would be high-quality 10-15s samples.
const DUMMY_MALE_REF = "UklGRiSDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQCBAAAAAAA=";
const DUMMY_FEMALE_REF = "UklGRiSDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQCBAAAAAAA=";

export const VOICES: Voice[] = [
  // --- Standard Voices (Narration & Regional) ---
  { id: 'binh', name: 'Bình', region: 'North', gender: 'Male', description: 'Nam miền Bắc, trầm ấm', geminiVoice: 'Kore', category: 'Standard' },
  { id: 'doan', name: 'Đoan', region: 'South', gender: 'Female', description: 'Nữ miền Nam, dịu dàng', geminiVoice: 'Puck', category: 'Standard' },
  { id: 'ngoc', name: 'Ngọc', region: 'North', gender: 'Female', description: 'Nữ miền Bắc, trong trẻo', geminiVoice: 'Kore', category: 'Standard' },
  { id: 'huong', name: 'Hương', region: 'North', gender: 'Female', description: 'Nữ miền Bắc, truyền cảm', geminiVoice: 'Puck', category: 'Standard' },
  { id: 'dung', name: 'Dung', region: 'South', gender: 'Female', description: 'Nữ miền Nam, ngọt ngào', geminiVoice: 'Puck', category: 'Standard' },
  { id: 'nguyen', name: 'Nguyên', region: 'South', gender: 'Male', description: 'Nam miền Nam, mạnh mẽ', geminiVoice: 'Charon', category: 'Standard' },
  { id: 'son', name: 'Sơn', region: 'South', gender: 'Male', description: 'Nam miền Nam, ấm áp', geminiVoice: 'Zephyr', category: 'Standard' },
  { id: 'tuyen', name: 'Tuyên', region: 'North', gender: 'Male', description: 'Nam miền Bắc, đĩnh đạc', geminiVoice: 'Charon', category: 'Standard' },
  { id: 'vinh', name: 'Vĩnh', region: 'South', gender: 'Male', description: 'Nam miền Nam, truyền thống', geminiVoice: 'Zephyr', category: 'Standard' },
  { id: 'ngan', name: 'Nguyễn Ngọc Ngạn', region: 'North', gender: 'Male', description: 'Giọng kể chuyện huyền thoại', geminiVoice: 'Charon', category: 'Standard' },
  
  // --- Core Reference Samples (New Cloning Templates) ---
  { 
    id: 'vn-male-core', 
    name: 'VN Core Male', 
    region: 'North', 
    gender: 'Male', 
    description: 'Giọng Nam chuẩn Studio (Clone Template)', 
    geminiVoice: 'cloned', 
    category: 'VN-Artist',
    styleDescription: 'giọng nam miền Bắc, phát âm chuẩn, âm sắc dày, chuyên nghiệp cho thuyết minh',
    referenceAudio: DUMMY_MALE_REF
  },
  { 
    id: 'vn-female-core', 
    name: 'VN Core Female', 
    region: 'North', 
    gender: 'Female', 
    description: 'Giọng Nữ chuẩn Studio (Clone Template)', 
    geminiVoice: 'cloned', 
    category: 'VN-Artist',
    styleDescription: 'giọng nữ miền Bắc, trong trẻo, nhịp điệu ôn hòa, chuyên nghiệp cho quảng cáo',
    referenceAudio: DUMMY_FEMALE_REF
  },

  // --- Vocal Legends (Music Studio Only) ---
  { 
    id: 'sontung', 
    name: 'Sơn Tùng M-TP', 
    region: 'North', 
    gender: 'Male', 
    description: 'Phong cách Sky, hiện đại', 
    geminiVoice: 'Zephyr', 
    isLegend: true,
    category: 'VN-Artist',
    styleDescription: 'giọng nam cao (tenor), độ sáng cao, nhấn nhá hiện đại, nhả chữ sắc sảo đặc trưng của Sơn Tùng M-TP'
  },
  { 
    id: 'mytam', 
    name: 'Mỹ Tâm', 
    region: 'South', 
    gender: 'Female', 
    description: 'Họa mi tóc nâu, nội lực', 
    geminiVoice: 'Puck', 
    isLegend: true,
    category: 'VN-Artist',
    styleDescription: 'giọng nữ trung dày, nồng nàn, độ rung cảm xúc mạnh mẽ, phong cách Diva Việt Nam'
  },
  { 
    id: 'denvau', 
    name: 'Đen Vâu', 
    region: 'North', 
    gender: 'Male', 
    description: 'Trải đời, mộc mạc', 
    geminiVoice: 'Charon', 
    isLegend: true,
    category: 'VN-Artist',
    styleDescription: 'giọng nam trầm đặc trưng, tốc độ chậm rãi, mang tính tự sự và chiều sâu của nhạc Rap Đen Vâu'
  },
  { 
    id: 'hongocha', 
    name: 'Hồ Ngọc Hà', 
    region: 'South', 
    gender: 'Female', 
    description: 'Khàn sang trọng, quyến rũ', 
    geminiVoice: 'Puck', 
    isLegend: true,
    category: 'VN-Artist',
    styleDescription: 'giọng nữ khàn (husky) đặc trưng, sang trọng, hơi thở airy gợi cảm của Hồ Ngọc Hà'
  },

  { 
    id: 'taylorswift', 
    name: 'Taylor Swift', 
    region: 'International', 
    gender: 'Female', 
    description: 'Storytelling, ngọt ngào', 
    geminiVoice: 'Kore', 
    isLegend: true,
    category: 'Global-Artist',
    styleDescription: 'giọng nữ cao ngọt ngào, phát âm cực kỳ rõ ràng, mang tính kể chuyện và tự sự của Taylor Swift'
  },
  { 
    id: 'adele', 
    name: 'Adele', 
    region: 'International', 
    gender: 'Female', 
    description: 'Quyền lực, linh hồn Soul', 
    geminiVoice: 'Puck', 
    isLegend: true,
    category: 'Global-Artist',
    styleDescription: 'giọng nữ trung dày, âm sắc cổ điển, quyền lực, mang đậm chất Soul và kịch tính'
  },
  { 
    id: 'brunomars', 
    name: 'Bruno Mars', 
    region: 'International', 
    gender: 'Male', 
    description: 'Rực rỡ, luyến láy R&B', 
    geminiVoice: 'Zephyr', 
    isLegend: true,
    category: 'Global-Artist',
    styleDescription: 'giọng nam cao năng lượng, luyến láy mượt mà, phong cách Funk và R&B của Bruno Mars'
  },
  { 
    id: 'justinbieber', 
    name: 'Justin Bieber', 
    region: 'International', 
    gender: 'Male', 
    description: 'Pop mượt mà, hơi thở airy', 
    geminiVoice: 'Fenrir', 
    isLegend: true,
    category: 'Global-Artist',
    styleDescription: 'giọng nam pop hiện đại, nhiều hơi (airy), cách nhả chữ phóng khoáng và mượt mà'
  },
];

export const APP_CONFIG = {
  TITLE: 'VN AUDIO PRO',
  SUBTITLE: 'Neural Voice & Music Studio'
};
