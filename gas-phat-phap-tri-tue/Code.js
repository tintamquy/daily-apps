/**
 * GOOGLE APPS SCRIPT BACKEND
 * LỜI PHẬT DẠY & VẤN ĐÁP TRÍ TUỆ (PHẬT PHÁP 24/7)
 * Tự động kết nối Google Sheets, Gmail và kích hoạt Time-driven Triggers
 */

const SPREADSHEET_NAME = "Dữ Liệu Cộng Đồng Phật Tử - Lời Phật Dạy";

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Lời Phật Dạy & Vấn Đáp Trí Tuệ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Lấy hoặc tạo Google Spreadsheet lưu trữ Phật tử
 */
function getOrCreateSheet() {
  var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  var ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  }
  
  var sheet = ss.getSheetByName("DanhSachPhatTu") || ss.insertSheet("DanhSachPhatTu");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Thời Gian", "Họ Và Tên", "Email", "Chủ Đề Quan Tâm", "Trạng Thái"]);
    sheet.getRange(1, 1, 1, 5).setBackground("#b45309").setFontColor("#ffffff").setFontWeight("bold");
  }
  return { ss: ss, sheet: sheet };
}

/**
 * Đăng ký nhận lời dạy Phật qua Gmail và gửi email hoan hỷ chào mừng ngay lập tức
 */
function registerDailyWisdom(fullName, email, topic) {
  try {
    if (!email || email.indexOf('@') === -1) {
      return { success: false, message: "Email không hợp lệ!" };
    }

    var db = getOrCreateSheet();
    var sheet = db.sheet;
    
    // Ghi vào Google Sheet
    sheet.appendRow([
      new Date(),
      fullName || "Đạo Hữu",
      email.trim(),
      topic || "Tâm An & Trí Tuệ",
      "Đang Đăng Ký"
    ]);

    // Gửi email chào mừng bằng GmailApp
    var subject = "🌸 Lành thay! Chúc mừng bạn đã đăng ký nhận Lời Dạy Đức Phật Mỗi Ngày";
    var htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 24px; color: #292524;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #b45309; margin: 0;">☸️ PHẬT PHÁP NHIỆM MÀU</h2>
          <p style="color: #78716c; font-size: 13px; margin-top: 4px;">Lời Phật Dạy & Nuôi Dưỡng Chánh Niệm Hằng Ngày</p>
        </div>
        
        <p>Nam Mô Bổn Sư Thích Ca Mâu Ni Phật,</p>
        <p>Kính gửi Đạo Hữu <strong>${fullName || "Đạo Hữu"}</strong>,</p>
        <p>Ban Điều Hành hoan hỷ chúc mừng bạn đã đăng ký thành công chuỗi gửi lời Phật dạy hàng ngày vào mỗi buổi sáng.</p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 6px; margin: 20px 0;">
          <p style="font-style: italic; color: #92400e; margin: 0 0 8px 0; font-weight: bold;">
            "Tâm dẫn đầu các pháp, tâm làm chủ tạo tác. Nếu với tâm thanh tịnh, nói năng hay hành động, an lạc sẽ theo ta, như bóng chẳng rời hình."
          </p>
          <p style="margin: 0; font-size: 12px; color: #b45309;">— Kinh Pháp Cú, Kệ số 2 (Dhammapada)</p>
        </div>

        <p>Mỗi buổi sáng lúc 06:00, hòm thư của bạn sẽ nhận được một bài học ngắn cùng phương pháp quán chiếu giúp một ngày mới tràn đầy hỷ lạc và trí tuệ.</p>
        
        <p style="margin-top: 24px;">Kính chúc bạn và gia đình thân tâm an lạc, vạn sự cát tường!</p>
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;">
        <p style="font-size: 11px; color: #a8a29e; text-align: center;">Hệ thống Lời Phật Dạy 24/7 • Tra cứu & Nuôi dưỡng Tuệ Giác</p>
      </div>
    `;

    GmailApp.sendEmail(email, subject, "", { htmlBody: htmlBody });

    // Tự động kích hoạt trigger gửi email hàng ngày nếu chưa có
    setupDailyWisdomTrigger();

    return {
      success: true,
      message: "Đã đăng ký thành công! Hãy kiểm tra hòm thư Gmail của bạn để nhận lời chúc mừng đầu tiên.",
      sheetUrl: db.ss.getUrl()
    };
  } catch (err) {
    return { success: false, message: "Lỗi hệ thống: " + err.toString() };
  }
}

/**
 * Cài đặt Trigger tự động gửi email hàng ngày lúc 6h sáng
 */
function setupDailyWisdomTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var exists = false;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "sendDailyWisdomBroadcast") {
      exists = true;
      break;
    }
  }
  if (!exists) {
    ScriptApp.newTrigger("sendDailyWisdomBroadcast")
      .timeBased()
      .everyDays(1)
      .atHour(6)
      .create();
  }
}

/**
 * Hàm tự động phát sóng lời dạy Phật mỗi sáng tới danh sách trong Google Sheets
 */
function sendDailyWisdomBroadcast() {
  try {
    var db = getOrCreateSheet();
    var sheet = db.sheet;
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    var verses = [
      { text: "Hận thù diệt hận thù, đời này không thể có. Từ bi diệt hận thù, là định luật ngàn thu.", source: "Kinh Pháp Cú số 5" },
      { text: "Chiến thắng vạn quân giặc, không bằng tự thắng mình. Tự thắng là chiến công, oanh liệt nhất trần gian.", source: "Kinh Pháp Cú số 103" },
      { text: "Người siêng năng tỉnh giác, phòng hộ các căn lành, như biển không sóng dữ, an nhiên giữa cuộc đời.", source: "Kinh Pháp Cú số 25" }
    ];
    var randomVerse = verses[Math.floor(Math.random() * verses.length)];

    for (var r = 1; r < data.length; r++) {
      var recipientName = data[r][1];
      var recipientEmail = data[r][2];
      if (recipientEmail && recipientEmail.indexOf('@') > 0) {
        var subject = "🌸 Lời Phật Dạy Sáng Nay: Nuôi Dưỡng Tâm Thanh Tịnh";
        var body = `Chào Đạo Hữu ${recipientName},\n\nLời dạy Đức Phật buổi sáng hôm nay:\n"${randomVerse.text}"\n(${randomVerse.source})\n\nKính chúc ngày mới bình an và tinh tấn!`;
        GmailApp.sendEmail(recipientEmail, subject, body);
      }
    }
  } catch (e) {
    Logger.log("Broadcast error: " + e.toString());
  }
}
