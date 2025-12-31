
import { Voice } from './types';

// Short dummy base64 strings to represent "provided" reference audio samples
// In a production app, these would be high-quality 10-15s samples.
const DUMMY_MALE_REF = "UklGRiSDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQCBAAAAAAA=";
const DUMMY_FEMALE_REF = "UklGRiSDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQCBAAAAAAA=";

export const VOICES: Voice[] = [
  // --- New Pite Voice (Standard) ---
  { 
    id: 'pite', 
    name: 'Pite', 
    region: 'International', 
    gender: 'Male', 
    description: 'Trợ lý ảo vui vẻ, năng động', 
    geminiVoice: 'Puck', 
    category: 'Standard',
    styleDescription: 'giọng nam trẻ trung, năng lượng cao, vui vẻ, tốc độ nhanh, phong cách trợ lý ảo hiện đại'
  },

  // --- Standard Voices (Narration & Regional) ---
  { 
    id: 'binh', 
    name: 'Bình', 
    region: 'North', 
    gender: 'Male', 
    description: 'Nam miền Bắc, trầm ấm', 
    geminiVoice: 'Kore', 
    category: 'Standard',
    styleDescription: 'giọng nam miền Bắc, âm sắc trầm, ấm áp, đọc chậm rãi, tin cậy, phù hợp tin tức'
  },
  { 
    id: 'doan', 
    name: 'Đoan', 
    region: 'South', 
    gender: 'Female', 
    description: 'Nữ miền Nam, dịu dàng', 
    geminiVoice: 'Puck', 
    category: 'Standard',
    styleDescription: 'giọng nữ miền Nam, nhẹ nhàng, dịu dàng, ngọt ngào, cảm xúc'
  },
  { 
    id: 'ngoc', 
    name: 'Ngọc', 
    region: 'North', 
    gender: 'Female', 
    description: 'Nữ miền Bắc, trong trẻo', 
    geminiVoice: 'Kore', 
    category: 'Standard',
    styleDescription: 'giọng nữ miền Bắc, cao, trong trẻo, tươi sáng, phát âm chuẩn Hà Nội'
  },
  { 
    id: 'huong', 
    name: 'Hương', 
    region: 'North', 
    gender: 'Female', 
    description: 'Nữ miền Bắc, truyền cảm', 
    geminiVoice: 'Puck', 
    category: 'Standard',
    styleDescription: 'giọng nữ miền Bắc, truyền cảm, sâu lắng, kể chuyện, tâm tình'
  },
  { 
    id: 'dung', 
    name: 'Dung', 
    region: 'South', 
    gender: 'Female', 
    description: 'Nữ miền Nam, ngọt ngào', 
    geminiVoice: 'Puck', 
    category: 'Standard',
    styleDescription: 'giọng nữ miền Nam, rất ngọt ngào, dễ thương, thân thiện, tươi vui'
  },
  { 
    id: 'nguyen', 
    name: 'Nguyên', 
    region: 'South', 
    gender: 'Male', 
    description: 'Nam miền Nam, mạnh mẽ', 
    geminiVoice: 'Charon', 
    category: 'Standard',
    styleDescription: 'giọng nam miền Nam, mạnh mẽ, dứt khoát, nam tính, âm vực rộng'
  },
  { 
    id: 'son', 
    name: 'Sơn', 
    region: 'South', 
    gender: 'Male', 
    description: 'Nam miền Nam, ấm áp', 
    geminiVoice: 'Zephyr', 
    category: 'Standard',
    styleDescription: 'giọng nam miền Nam, ấm áp, nhẹ nhàng, tình cảm, phù hợp đọc truyện'
  },
  { 
    id: 'tuyen', 
    name: 'Tuyên', 
    region: 'North', 
    gender: 'Male', 
    description: 'Nam miền Bắc, đĩnh đạc', 
    geminiVoice: 'Charon', 
    category: 'Standard',
    styleDescription: 'giọng nam miền Bắc, đĩnh đạc, nghiêm túc, chính luận, giọng phát thanh viên'
  },
  { 
    id: 'vinh', 
    name: 'Vĩnh', 
    region: 'South', 
    gender: 'Male', 
    description: 'Nam miền Nam, truyền thống', 
    geminiVoice: 'Zephyr', 
    category: 'Standard',
    styleDescription: 'giọng nam miền Nam, chất giọng xưa, truyền thống, chậm rãi, kể chuyện lịch sử'
  },
  { 
    id: 'ngan', 
    name: 'Nguyễn Ngọc Ngạn', 
    region: 'North', 
    gender: 'Male', 
    description: 'Giọng kể chuyện huyền thoại', 
    geminiVoice: 'Charon', 
    category: 'Standard',
    styleDescription: 'giọng nam già, kể chuyện ma mị, huyền bí, nhấn nhá đặc trưng, tốc độ chậm'
  },
  
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
    id: 'pite-pro', 
    name: 'Pite (Vocal)', 
    region: 'International', 
    gender: 'Male', 
    description: 'Giọng hát AI Pite năng động', 
    geminiVoice: 'Puck', 
    isLegend: true,
    category: 'VN-Artist',
    styleDescription: 'giọng nam cao vui vẻ, năng lượng tích cực, phong cách hoạt hình hiện đại'
  },
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
