/**
 * GOOGLE APPS SCRIPT BACKEND
 * HỆ THỐNG CRM & BÁN HÀNG TỰ ĐỘNG CHO MẸ (MINI ERP ON GOOGLE SHEETS)
 * Tự động đồng bộ Google Sheets, lưu trữ đơn hàng, tính lãi biếu Mẹ và gửi Email xác nhận
 */

const CRM_SPREADSHEET_NAME = "CRM Bán Hàng & Quỹ Báo Hiếu Mẹ (Google Database)";

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('CRM Bán Hàng & Chăm Sóc Tự Động Cho Mẹ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Khởi tạo hoặc lấy Spreadsheet cơ sở dữ liệu
 */
function getOrCreateCRMDatabase() {
  var files = DriveApp.getFilesByName(CRM_SPREADSHEET_NAME);
  var ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(CRM_SPREADSHEET_NAME);
  }

  // 1. Sheet Đơn Hàng
  var sheetOrders = ss.getSheetByName("DonHang") || ss.insertSheet("DonHang");
  if (sheetOrders.getLastRow() === 0) {
    sheetOrders.appendRow(["Mã Đơn", "Thời Gian", "Khách Hàng", "SĐT", "Email", "Sản Phẩm", "Số Tiền", "Tiền Lãi Biếu Mẹ", "Trạng Thái"]);
    sheetOrders.getRange(1, 1, 1, 9).setBackground("#059669").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 2. Sheet Khách Hàng
  var sheetCustomers = ss.getSheetByName("KhachHang") || ss.insertSheet("KhachHang");
  if (sheetCustomers.getLastRow() === 0) {
    sheetCustomers.appendRow(["Họ Tên", "SĐT", "Email", "Tổng Chi Tiêu", "Số Đơn Mua", "Lần Mua Gần Nhất"]);
    sheetCustomers.getRange(1, 1, 1, 6).setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
  }

  return { ss: ss, sheetOrders: sheetOrders, sheetCustomers: sheetCustomers };
}

/**
 * Xử lý thêm đơn hàng mới từ Web App
 */
function processNewOrder(orderData) {
  try {
    var db = getOrCreateCRMDatabase();
    var sheetOrders = db.sheetOrders;
    
    var orderId = "DH" + Math.floor(100000 + Math.random() * 900000);
    var now = new Date();
    var customerName = orderData.name || "Khách lẻ";
    var phone = orderData.phone || "";
    var email = orderData.email || "";
    var product = orderData.product || "Hàng hóa";
    var amount = Number(orderData.amount) || 0;
    var profit = Number(orderData.profit) || Math.round(amount * 0.38); // Mặc định lãi ~38%

    // Ghi vào Sheet Đơn Hàng
    sheetOrders.appendRow([
      orderId,
      now,
      customerName,
      "'" + phone,
      email,
      product,
      amount,
      profit,
      "Đã Hoàn Thành"
    ]);

    // Cập nhật Sheet Khách Hàng
    var sheetCust = db.sheetCustomers;
    var custData = sheetCust.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < custData.length; i++) {
      if (custData[i][1] === phone && phone !== "") {
        var currentSpent = Number(custData[i][3]) || 0;
        var currentOrders = Number(custData[i][4]) || 0;
        sheetCust.getRange(i + 1, 4).setValue(currentSpent + amount);
        sheetCust.getRange(i + 1, 5).setValue(currentOrders + 1);
        sheetCust.getRange(i + 1, 6).setValue(now);
        found = true;
        break;
      }
    }
    if (!found) {
      sheetCust.appendRow([customerName, "'" + phone, email, amount, 1, now]);
    }

    // Tự động gửi Email xác nhận nếu khách có email
    if (email && email.indexOf('@') > 0) {
      var subject = "🌸 Xác nhận đơn hàng #" + orderId + " - Cảm ơn quý khách!";
      var html = `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 22px; color: #14532d;">
          <h2 style="color: #059669; text-align: center; margin-top: 0;">ĐƠN HÀNG ĐÃ ĐƯỢC XÁC NHẬN!</h2>
          <p>Kính chào quý khách <strong>${customerName}</strong>,</p>
          <p>Cảm ơn bạn đã tin tưởng ủng hộ sản phẩm của gia đình chúng tôi. Đơn hàng của bạn đã được tiếp nhận và chuẩn bị gửi đi:</p>
          <div style="background: #ffffff; border: 1px solid #dcfce7; padding: 14px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Mã đơn hàng:</strong> ${orderId}</p>
            <p><strong>Sản phẩm:</strong> ${product}</p>
            <p><strong>Tổng thanh toán:</strong> <span style="color: #059669; font-size: 16px; font-weight: bold;">${amount.toLocaleString('vi-VN')} VNĐ</span></p>
          </div>
          <p>Mỗi đơn hàng của bạn là niềm vui to lớn tiếp sức cho chúng tôi trên con đường làm ăn lương thiện phụng dưỡng Cha Mẹ. Xin chân thành cảm ơn bạn!</p>
        </div>
      `;
      GmailApp.sendEmail(email, subject, "", { htmlBody: html });
    }

    return {
      success: true,
      orderId: orderId,
      sheetUrl: db.ss.getUrl(),
      message: "Đã lưu đơn hàng #" + orderId + " thành công vào Google Sheet!"
    };
  } catch (err) {
    return { success: false, message: "Lỗi lưu đơn: " + err.toString() };
  }
}

/**
 * Lấy dữ liệu thống kê từ Google Sheets để hiển thị lên Dashboard
 */
function getDashboardMetrics() {
  try {
    var db = getOrCreateCRMDatabase();
    var sheetOrders = db.sheetOrders;
    var rows = sheetOrders.getDataRange().getValues();

    var totalRevenue = 0;
    var totalProfit = 0;
    var count = 0;
    var recentOrders = [];

    for (var i = 1; i < rows.length; i++) {
      var rev = Number(rows[i][6]) || 0;
      var prof = Number(rows[i][7]) || 0;
      totalRevenue += rev;
      totalProfit += prof;
      count++;

      if (i >= rows.length - 10) {
        recentOrders.unshift({
          id: rows[i][0],
          time: Utilities.formatDate(new Date(rows[i][1]), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm"),
          name: rows[i][2],
          phone: rows[i][3],
          product: rows[i][5],
          amount: rev,
          profit: prof,
          status: rows[i][8]
        });
      }
    }

    return {
      success: true,
      totalRevenue: totalRevenue,
      totalProfit: totalProfit,
      totalOrders: count,
      recentOrders: recentOrders,
      sheetUrl: db.ss.getUrl()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
