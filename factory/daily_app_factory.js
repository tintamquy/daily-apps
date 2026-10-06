/**
 * DAILY APP FACTORY & AUTOMATION ENGINE
 * Hệ Thống Tự Động Hóa Sinh & Tối Ưu Hóa 2 Ứng Dụng Mỗi Ngày
 * 1. Ứng dụng Giáo Pháp Phật Pháp (Trí tuệ & Công đức)
 * 2. Ứng dụng Kinh Doanh Báo Hiếu (Tài chính & Phụng dưỡng Cha Mẹ)
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, 'apps_manifest.json');

// Danh mục định hướng lộ trình sáng tạo 30 ngày
const ROADMAP_CATALOG = [
  {
    day: 1,
    dharma: {
      name: "Sổ Công Cứ Niệm Phật & Nhắc Lịch Tu Học",
      folder: "app1-cong-cu-niem-phat",
      description: "Đếm tràng hạt 108, gõ mõ chuông bát Web Audio, nhắc lịch 4 khóa và hồi hướng công đức.",
      tags: ["Niệm Phật", "Tịnh Độ", "Mõ Điện Tử", "Công Cứ"]
    },
    monetization: {
      name: "Trợ Lý Bán Hàng & Video Triệu View Báo Hiếu Mẹ",
      folder: "app2-kinh-doanh-cho-me",
      description: "Sinh kịch bản video TikTok/Reels 45s, bài đăng Facebook/Zalo, tính lãi ròng và sổ đơn tích lũy quỹ mẹ.",
      tags: ["Bán Hàng", "TikTok Script", "Quỹ Báo Hiếu", "Lợi Nhuận"]
    }
  },
  {
    day: 2,
    dharma: {
      name: "Từ Điển Tra Cứu Thuật Ngữ Phật Pháp & Pāli Cư Sĩ",
      folder: "app3-tu-dien-pali",
      description: "Tra nhanh nghĩa gốc Pāli, Tam Tạng kinh điển, giải thích giới luật và giáo lý thực hành.",
      tags: ["Pāli", "Từ Điển", "Kinh Điển", "Giáo Pháp"]
    },
    monetization: {
      name: "Trình Tạo Landing Page Bán Nông Sản & Đặc Sản Cho Mẹ",
      folder: "app4-landing-page-nong-san",
      description: "Trang giới thiệu nông sản sạch của Mẹ với nút đặt hàng nhanh qua Zalo và tích hợp mã QR thanh toán.",
      tags: ["Landing Page", "Nông Sản", "Zalo Order", "QR VietQR"]
    }
  },
  {
    day: 3,
    dharma: {
      name: "Nhật Ký Tọa Thiền Vipassana & Âm Thanh Chuông Xả Thiền",
      folder: "app5-nhat-ky-toa-thien",
      description: "Hẹn giờ thiền tọa, âm thanh chuông bát ngân vang, ghi lại trạng thái định tâm và quán chiếu hơi thở.",
      tags: ["Vipassana", "Thiền Tọa", "Hẹn Giờ", "Chuông Bát"]
    },
    monetization: {
      name: "Sổ Thu Chi Gia Đình & Quỹ Tiết Kiệm Phụng Dưỡng Cha Mẹ",
      folder: "app6-thu-chi-phung-duong",
      description: "Quản lý dòng tiền cá nhân, tự động trích 15-20% thu nhập mỗi tháng vào Quỹ Biếu Mẹ an dưỡng tuổi già.",
      tags: ["Tài Chính", "Tiết Kiệm", "Quỹ Mẹ", "Thu Chi"]
    }
  }
];

function initManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    const initialData = {
      createdDate: new Date().toISOString(),
      currentDay: 1,
      totalGeneratedApps: 2,
      appsHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          dayIndex: 1,
          dharmaApp: ROADMAP_CATALOG[0].dharma,
          incomeApp: ROADMAP_CATALOG[0].monetization,
          status: "COMPLETED",
          sharedCommunity: true
        }
      ]
    };
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    console.log("✅ Đã khởi tạo apps_manifest.json thành công!");
  } else {
    console.log("ℹ️ Manifest đã tồn tại, sẵn sàng cho chu kỳ tối ưu kế tiếp.");
  }
}

function runDailyIteration() {
  initManifest();
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(raw);
  
  console.log(`🚀 [DAILY FACTORY] Tiến độ hiện tại: Ngày ${manifest.currentDay} | Đã tạo ${manifest.totalGeneratedApps} ứng dụng.`);
  console.log(`🌸 Ứng dụng Phật Pháp: ${manifest.appsHistory[0].dharmaApp.name}`);
  console.log(`❤️ Ứng dụng Báo Hiếu Mẹ: ${manifest.appsHistory[0].incomeApp.name}`);
}

runDailyIteration();
