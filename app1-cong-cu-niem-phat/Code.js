/**
 * GOOGLE APPS SCRIPT WEB APP - SỔ CÔNG CỨ NIỆM PHẬT & NHẮC LỊCH
 * Tự động phục vụ Web App và đồng bộ công đức lên Google Sheets
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Sổ Công Cứ Niệm Phật & Nhắc Lịch Tu Học')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Lưu dữ liệu công cứ vào Google Sheets
 */
function recordMeritsToSheet(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create("Sổ Ghi Nhận Công Đức Niệm Phật");
    }
    var sheet = ss.getSheetByName("CongCu") || ss.insertSheet("CongCu");
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời Gian", "Danh Hiệu Niệm", "Số Câu Hoàn Thành", "Tổng Tích Lũy", "Ghi Chú Hồi Hướng"]);
      sheet.getRange(1, 1, 1, 5).setBackground("#f59e0b").setFontColor("#ffffff").setFontWeight("bold");
    }
    
    sheet.appendRow([
      new Date(),
      data.chantTitle || "Nam Mô A Di Đà Phật",
      data.todayCount || 0,
      data.totalCount || 0,
      data.note || "Nguyện vãng sanh Cực Lạc, hồi hướng an lành cho Cha Mẹ"
    ]);
    
    return { status: "SUCCESS", sheetUrl: ss.getUrl() };
  } catch (err) {
    return { status: "ERROR", message: err.toString() };
  }
}
