import { useTheme, type LanguageKey } from "@/contexts/ThemeContext";

export type TranslationKey =
  | "nav.home"
  | "nav.summary"
  | "nav.camera"
  | "nav.history"
  | "nav.settings"
  | "settings.title"
  | "settings.section.account"
  | "settings.section.appearance"
  | "settings.section.notifications"
  | "settings.section.language"
  | "settings.section.data"
  | "settings.item.personalInfo"
  | "personalInfo.save"
  | "personalInfo.saving"
  | "settings.item.password"
  | "settings.password.title"
  | "settings.password.currentPassword"
  | "settings.password.newPassword"
  | "settings.password.confirmPassword"
  | "settings.password.placeholder.current"
  | "settings.password.placeholder.new"
  | "settings.password.placeholder.confirm"
  | "settings.password.error.mismatch"
  | "settings.password.error.incorrect"
  | "settings.password.error.tooManyAttempts"
  | "settings.password.error.verifyFailed"
  | "settings.password.error.loginRequired"
  | "settings.password.error.missingInfo"
  | "settings.password.error.fillAllFields"
  | "settings.password.error.confirmFirst"
  | "settings.password.error.invalidPassword"
  | "settings.password.error.minLength"
  | "settings.password.error.cannotChange"
  | "settings.password.error.cannotChangeMessage"
  | "settings.password.error.updateFailed"
  | "settings.password.error.retryLogin"
  | "settings.password.success.title"
  | "settings.password.success.message"
  | "settings.password.button.cancel"
  | "settings.password.button.update"
  | "settings.item.signOut"
  | "settings.item.darkMode"
  | "settings.item.accentColor"
  | "settings.accentColor.title"
  | "settings.accentColor.done"
  | "settings.accentColor.yellow"
  | "settings.accentColor.green"
  | "settings.accentColor.pink"
  | "settings.accentColor.blue"
  | "settings.accentColor.red"
  | "settings.accentColor.orange"
  | "settings.item.pushNotifications"
  | "settings.item.appLanguage"
  | "settings.item.deleteAllData"
  | "summary.recentTransactions"
  | "summary.seeMore"
  | "summary.header.allTime"
  | "summary.header.today"
  | "summary.header.yesterday"
  | "summary.header.tomorrow"
  | "summary.dateRange.title"
  | "summary.dateRange.day"
  | "summary.dateRange.week"
  | "summary.dateRange.month"
  | "summary.dateRange.year"
  | "summary.dateRange.all"
  | "summary.dateRange.allTimeSelected"
  | "summary.dateRange.cancel"
  | "summary.dateRange.apply"
  | "summary.month.january"
  | "summary.month.february"
  | "summary.month.march"
  | "summary.month.april"
  | "summary.month.may"
  | "summary.month.june"
  | "summary.month.july"
  | "summary.month.august"
  | "summary.month.september"
  | "summary.month.october"
  | "summary.month.november"
  | "summary.month.december"
  | "summary.chart.breakdown"
  | "summary.chart.trends"
  | "summary.chart.income"
  | "summary.chart.spent"
  | "summary.chart.all"
  | "summary.chart.noData"
  | "summary.chart.others"
  | "summary.chart.legend.income"
  | "summary.chart.legend.spent"
  | "summary.chart.time.12am"
  | "summary.chart.time.3am"
  | "summary.chart.time.6am"
  | "summary.chart.time.9am"
  | "summary.chart.time.12pm"
  | "summary.chart.time.3pm"
  | "summary.chart.time.6pm"
  | "summary.chart.time.9pm"
  | "summary.account.saved"
  | "summary.account.spent"
  | "summary.account.allTimeBalance"
  | "summary.account.upToThisPoint"
  | "summary.account.period.today"
  | "summary.account.period.thisWeek"
  | "summary.account.period.thisMonth"
  | "summary.account.period.thisYear"
  | "summary.account.period.allTime"
  | "history.filter.title"
  // Add transaction
  | "add.title.add"
  | "add.title.edit"
  | "add.date.today"
  | "add.date.selectTitle"
  | "add.date.done"
  | "add.field.category"
  | "add.field.date"
  | "add.note.label"
  | "add.note.placeholder"
  | "add.category.selectTitle"
  | "add.category.searchPlaceholder"
  | "add.button.create"
  | "add.button.update"
  | "add.error.permissionTitle"
  | "add.error.permissionMessage"
  | "add.error.invalidAmountTitle"
  | "add.error.invalidAmountMessage"
  | "add.error.updateTitle"
  | "add.error.updateMessage"
  | "add.error.saveTitle"
  | "add.error.saveMessage"
  // Camera
  | "camera.preview.title.addIncome"
  | "camera.preview.title.addExpense"
  | "camera.preview.note.placeholder"
  | "camera.preview.type.spent"
  | "camera.preview.type.income"
  | "camera.preview.field.amount"
  | "camera.preview.field.category"
  | "camera.preview.button.save"
  | "camera.preview.category.selectTitle"
  | "camera.preview.category.searchPlaceholder"
  | "camera.preview.error.captionTitle"
  | "camera.preview.error.captionMessage"
  | "camera.preview.error.amountTitle"
  | "camera.preview.error.amountMessage"
  | "camera.preview.error.saveTitle"
  | "camera.preview.error.saveMessage"
  | "camera.detail.title.income"
  | "camera.detail.title.expense"
  | "camera.detail.field.amount"
  | "camera.detail.field.category"
  | "camera.calendar.filter.allTime"
  | "camera.calendar.filter.custom"
  | "camera.calendar.filter.reset"
  | "camera.calendar.filter.year"
  | "camera.calendar.filter.month"
  | "camera.calendar.filter.day"
  | "camera.calendar.filter.all"
  | "camera.calendar.select.year"
  | "camera.calendar.select.month"
  | "camera.calendar.select.day"
  | "camera.calendar.empty.noExpenses"
  | "camera.calendar.empty.addExpense"
  | "camera.calendar.empty.noExpensesMonth"
  | "camera.calendar.empty.tryAnotherMonth"
  | "camera.calendar.month.january"
  | "camera.calendar.month.february"
  | "camera.calendar.month.march"
  | "camera.calendar.month.april"
  | "camera.calendar.month.may"
  | "camera.calendar.month.june"
  | "camera.calendar.month.july"
  | "camera.calendar.month.august"
  | "camera.calendar.month.september"
  | "camera.calendar.month.october"
  | "camera.calendar.month.november"
  | "camera.calendar.month.december"
  // Home
  | "home.welcome"
  | "home.toolbar.history"
  | "home.toolbar.scanBill"
  | "home.toolbar.text"
  | "home.toolbar.camera"
  | "home.today.label"
  | "home.today.empty"
  | "home.today.income"
  | "home.today.spent"
  | "home.textModal.title"
  | "home.textModal.instruction"
  | "home.textModal.placeholder"
  | "home.textModal.cancel"
  | "home.textModal.create"
  | "home.textModal.creating"
  | "home.textModal.error.title"
  | "home.textModal.error.message"
  | "home.scanModal.title"
  | "home.scanModal.instruction"
  | "home.scanModal.uploadButton"
  | "home.scanModal.changeImage"
  | "home.scanModal.extractedText"
  | "home.scanModal.cancel"
  | "home.scanModal.extract"
  | "home.scanModal.creating"
  | "home.scanModal.error.cameraPermission"
  | "home.scanModal.error.photoFailed"
  | "home.scanModal.error.mediaPermission"
  | "home.scanModal.error.pickFailed"
  | "home.scanModal.error.scanFailed"
  | "home.scanModal.error.extractFailed"
  | "home.scanModal.selectSource.title"
  | "home.scanModal.selectSource.message"
  | "home.scanModal.selectSource.cancel"
  | "home.scanModal.selectSource.takePhoto"
  | "home.scanModal.selectSource.photoLibrary"
  | "home.error.createTransaction"
  // History
  | "history.title"
  | "history.filter.button"
  | "history.total"
  | "history.search.placeholder"
  | "history.loading"
  | "history.empty"
  | "history.filter.transactionType"
  | "history.filter.categories"
  | "history.filter.categoriesSubtitle"
  | "history.filter.amountRange"
  | "history.filter.amountRangeSubtitle"
  | "history.filter.dateRange"
  | "history.filter.dateRangeSubtitle"
  | "history.filter.groupBy"
  | "history.filter.groupBySubtitle"
  | "history.filter.type.all"
  | "history.filter.type.income"
  | "history.filter.type.spent"
  | "history.filter.groupBy.day"
  | "history.filter.groupBy.month"
  | "history.filter.groupBy.year"
  | "history.filter.minAmount"
  | "history.filter.maxAmount"
  | "history.filter.startDate"
  | "history.filter.endDate"
  | "history.filter.noLimit"
  | "history.filter.selectStartDate"
  | "history.filter.selectEndDate"
  | "history.filter.today"
  | "history.filter.reset"
  | "history.filter.cancel"
  | "history.filter.apply"
  | "history.transaction.deleteTitle"
  | "history.transaction.deleteMessage"
  | "history.transaction.deleteCancel"
  | "history.transaction.deleteConfirm"
  | "history.transaction.deleteError"
  | "history.transaction.edit"
  | "history.transaction.delete";

type TranslationDict = Record<TranslationKey, string>;

const en: TranslationDict = {
  "nav.home": "Home",
  "nav.summary": "Summary",
  "nav.camera": "Camera",
  "nav.history": "History",
  "nav.settings": "Settings",

  "settings.title": "Settings",
  "settings.section.account": "Account",
  "settings.section.appearance": "Appearance",
  "settings.section.notifications": "Notifications",
  "settings.section.language": "Language & Region",
  "settings.section.data": "Data",

  "settings.item.personalInfo": "Personal Info",
  "personalInfo.save": "Save",
  "personalInfo.saving": "Saving…",
  "settings.item.password": "Password",
  "settings.password.title": "Change password",
  "settings.password.currentPassword": "Current password",
  "settings.password.newPassword": "New password",
  "settings.password.confirmPassword": "Confirm new password",
  "settings.password.placeholder.current": "Enter current password",
  "settings.password.placeholder.new": "Enter new password",
  "settings.password.placeholder.confirm": "Re-enter new password",
  "settings.password.error.mismatch": "New passwords do not match.",
  "settings.password.error.incorrect": "Current password is incorrect.",
  "settings.password.error.tooManyAttempts":
    "Too many attempts. Please wait a few minutes and try again.",
  "settings.password.error.verifyFailed": "Could not verify current password.",
  "settings.password.error.loginRequired":
    "Please log in again to verify password.",
  "settings.password.error.missingInfo": "Missing info",
  "settings.password.error.fillAllFields":
    "Please fill in all password fields.",
  "settings.password.error.confirmFirst":
    "Please confirm your current password first.",
  "settings.password.error.invalidPassword": "Invalid password",
  "settings.password.error.minLength":
    "New password must be at least 6 characters.",
  "settings.password.error.cannotChange": "Error",
  "settings.password.error.cannotChangeMessage":
    "Your account cannot change password right now. Please log in again.",
  "settings.password.error.updateFailed":
    "Could not update password. Please try again.",
  "settings.password.error.retryLogin":
    "Please log in again and retry changing password.",
  "settings.password.success.title": "Success",
  "settings.password.success.message": "Password updated successfully.",
  "settings.password.button.cancel": "Cancel",
  "settings.password.button.update": "Update",
  "settings.item.signOut": "Sign Out",
  "settings.item.darkMode": "Dark Mode",
  "settings.item.accentColor": "Accent Color",
  "settings.accentColor.title": "Accent Color",
  "settings.accentColor.done": "Done",
  "settings.accentColor.yellow": "Yellow",
  "settings.accentColor.green": "Green",
  "settings.accentColor.pink": "Pink",
  "settings.accentColor.blue": "Blue",
  "settings.accentColor.red": "Red",
  "settings.accentColor.orange": "Orange",
  "settings.item.pushNotifications": "Push Notifications",
  "settings.item.appLanguage": "App Language",
  "settings.item.deleteAllData": "Delete All Data",

  "summary.recentTransactions": "Recent Transactions",
  "summary.seeMore": "See More",
  "summary.header.allTime": "All time",
  "summary.header.today": "Today",
  "summary.header.yesterday": "Yesterday",
  "summary.header.tomorrow": "Tomorrow",
  "summary.dateRange.title": "Select Date Range",
  "summary.dateRange.day": "Day",
  "summary.dateRange.week": "Week",
  "summary.dateRange.month": "Month",
  "summary.dateRange.year": "Year",
  "summary.dateRange.all": "All",
  "summary.dateRange.allTimeSelected": "All time range selected",
  "summary.dateRange.cancel": "Cancel",
  "summary.dateRange.apply": "Apply",
  "summary.month.january": "January",
  "summary.month.february": "February",
  "summary.month.march": "March",
  "summary.month.april": "April",
  "summary.month.may": "May",
  "summary.month.june": "June",
  "summary.month.july": "July",
  "summary.month.august": "August",
  "summary.month.september": "September",
  "summary.month.october": "October",
  "summary.month.november": "November",
  "summary.month.december": "December",
  "summary.chart.breakdown": "Breakdown",
  "summary.chart.trends": "Trends",
  "summary.chart.income": "Income",
  "summary.chart.spent": "Spent",
  "summary.chart.all": "All",
  "summary.chart.noData": "No data",
  "summary.chart.others": "Others",
  "summary.chart.legend.income": "Income",
  "summary.chart.legend.spent": "Spent",
  "summary.chart.time.12am": "12 AM",
  "summary.chart.time.3am": "3 AM",
  "summary.chart.time.6am": "6 AM",
  "summary.chart.time.9am": "9 AM",
  "summary.chart.time.12pm": "12 PM",
  "summary.chart.time.3pm": "3 PM",
  "summary.chart.time.6pm": "6 PM",
  "summary.chart.time.9pm": "9 PM",
  "summary.account.saved": "Saved",
  "summary.account.spent": "Spent",
  "summary.account.allTimeBalance": "All time balance",
  "summary.account.upToThisPoint": "Up to this point",
  "summary.account.period.today": "Today",
  "summary.account.period.thisWeek": "This week",
  "summary.account.period.thisMonth": "This month",
  "summary.account.period.thisYear": "This year",
  "summary.account.period.allTime": "All time",

  "history.filter.title": "Filter Transactions",

  // Add transaction
  "add.title.add": "Add Transaction",
  "add.title.edit": "Edit Transaction",
  "add.date.today": "Today",
  "add.date.selectTitle": "Select Date",
  "add.date.done": "Done",
  "add.field.category": "Category",
  "add.field.date": "Date",
  "add.note.label": "Note",
  "add.note.placeholder": "Add a note...",
  "add.category.selectTitle": "Select Category",
  "add.category.searchPlaceholder": "Search category...",
  "add.button.create": "Create Transaction",
  "add.button.update": "Update",
  "add.error.permissionTitle": "Permission needed",
  "add.error.permissionMessage":
    "Please allow access to your photo library to attach an image.",
  "add.error.invalidAmountTitle": "Invalid amount",
  "add.error.invalidAmountMessage": "Please enter a valid amount.",
  "add.error.updateTitle": "Could not update",
  "add.error.updateMessage":
    "The transaction was not updated. Please try again.",
  "add.error.saveTitle": "Could not save",
  "add.error.saveMessage": "The transaction was not saved. Please try again.",

  // Camera
  "camera.preview.title.addIncome": "Add Income",
  "camera.preview.title.addExpense": "Add Expense",
  "camera.preview.note.placeholder": "Add a note...",
  "camera.preview.type.spent": "Spent",
  "camera.preview.type.income": "Income",
  "camera.preview.field.amount": "Amount",
  "camera.preview.field.category": "Category",
  "camera.preview.button.save": "Save Expense",
  "camera.preview.category.selectTitle": "Select Category",
  "camera.preview.category.searchPlaceholder": "Search category...",
  "camera.preview.error.captionTitle": "Error",
  "camera.preview.error.captionMessage":
    "Could not generate caption from image",
  "camera.preview.error.amountTitle": "Error",
  "camera.preview.error.amountMessage": "Please enter a valid amount",
  "camera.preview.error.saveTitle": "Error",
  "camera.preview.error.saveMessage": "Could not save expense",
  "camera.detail.title.income": "Income Detail",
  "camera.detail.title.expense": "Expense Detail",
  "camera.detail.field.amount": "Amount",
  "camera.detail.field.category": "Category",
  "camera.calendar.filter.allTime": "Filter: All time",
  "camera.calendar.filter.custom": "Filter: Custom",
  "camera.calendar.filter.reset": "Reset",
  "camera.calendar.filter.year": "Year",
  "camera.calendar.filter.month": "Month",
  "camera.calendar.filter.day": "Day",
  "camera.calendar.filter.all": "All",
  "camera.calendar.select.year": "Select year",
  "camera.calendar.select.month": "Select month",
  "camera.calendar.select.day": "Select day",
  "camera.calendar.empty.noExpenses": "No expenses yet",
  "camera.calendar.empty.addExpense": "Take a photo to add an expense!",
  "camera.calendar.empty.noExpensesMonth": "No expenses in this month",
  "camera.calendar.empty.tryAnotherMonth": "Try selecting another month",
  "camera.calendar.month.january": "January",
  "camera.calendar.month.february": "February",
  "camera.calendar.month.march": "March",
  "camera.calendar.month.april": "April",
  "camera.calendar.month.may": "May",
  "camera.calendar.month.june": "June",
  "camera.calendar.month.july": "July",
  "camera.calendar.month.august": "August",
  "camera.calendar.month.september": "September",
  "camera.calendar.month.october": "October",
  "camera.calendar.month.november": "November",
  "camera.calendar.month.december": "December",

  // Home
  "home.welcome": "Welcome, {name}!",
  "home.toolbar.history": "History",
  "home.toolbar.scanBill": "Scan bill",
  "home.toolbar.text": "Text",
  "home.toolbar.camera": "Camera",
  "home.today.label": "Today",
  "home.today.empty": "No photos today",
  "home.today.income": "Income",
  "home.today.spent": "Spent",
  "home.textModal.title": "Text to Transaction",
  "home.textModal.instruction": "Describe your expense or income.",
  "home.textModal.placeholder": "e.g. Coffee $4.50, Lunch $12...",
  "home.textModal.cancel": "Cancel",
  "home.textModal.create": "Create",
  "home.textModal.creating": "Creating...",
  "home.textModal.error.title": "Unable to parse",
  "home.textModal.error.message":
    "Could not understand this text. Please adjust it and try again.",
  "home.scanModal.title": "Scan bill to transaction",
  "home.scanModal.instruction":
    "Take a photo or upload a clear image of your bill.",
  "home.scanModal.uploadButton": "Upload Bill Image",
  "home.scanModal.changeImage": "Change image",
  "home.scanModal.extractedText": "Extracted text preview",
  "home.scanModal.cancel": "Cancel",
  "home.scanModal.extract": "Extract",
  "home.scanModal.creating": "Creating...",
  "home.scanModal.error.cameraPermission":
    "Camera permission is required to take a photo of your bill.",
  "home.scanModal.error.photoFailed": "Failed to take photo. Please try again.",
  "home.scanModal.error.mediaPermission":
    "Media library permission is required to upload a bill image.",
  "home.scanModal.error.pickFailed": "Failed to pick image. Please try again.",
  "home.scanModal.error.scanFailed":
    "Failed to scan bill. Please try again with a clearer image.",
  "home.scanModal.error.extractFailed":
    "Could not extract a transaction from this bill. Please try a clearer photo.",
  "home.scanModal.selectSource.title": "Select Image Source",
  "home.scanModal.selectSource.message": "Choose an option",
  "home.scanModal.selectSource.cancel": "Cancel",
  "home.scanModal.selectSource.takePhoto": "Take Photo",
  "home.scanModal.selectSource.photoLibrary": "Photo Library",
  "home.error.createTransaction":
    "Could not create transaction from this bill.",

  // History
  "history.title": "Transaction History",
  "history.filter.button": "Filter",
  "history.total": "Total",
  "history.search.placeholder": "Search",
  "history.loading": "Loading...",
  "history.empty": "No transactions found",
  "history.filter.transactionType": "Transaction Type",
  "history.filter.categories": "Categories",
  "history.filter.categoriesSubtitle": "Select one or more categories",
  "history.filter.amountRange": "Amount Range",
  "history.filter.amountRangeSubtitle":
    "Optional: Set minimum and maximum amounts",
  "history.filter.dateRange": "Date Range",
  "history.filter.dateRangeSubtitle": "Optional: Filter by date range",
  "history.filter.groupBy": "Group By",
  "history.filter.groupBySubtitle": "Choose how transactions are grouped",
  "history.filter.type.all": "All",
  "history.filter.type.income": "Income",
  "history.filter.type.spent": "Spent",
  "history.filter.groupBy.day": "By Day",
  "history.filter.groupBy.month": "By Month",
  "history.filter.groupBy.year": "By Year",
  "history.filter.minAmount": "Min Amount",
  "history.filter.maxAmount": "Max Amount",
  "history.filter.startDate": "Start Date",
  "history.filter.endDate": "End Date",
  "history.filter.noLimit": "No limit",
  "history.filter.selectStartDate": "Select start date",
  "history.filter.selectEndDate": "Select end date",
  "history.filter.today": "Today",
  "history.filter.reset": "Reset",
  "history.filter.cancel": "Cancel",
  "history.filter.apply": "Apply",
  "history.transaction.deleteTitle": "Delete transaction",
  "history.transaction.deleteMessage":
    "Are you sure you want to delete this transaction?",
  "history.transaction.deleteCancel": "Cancel",
  "history.transaction.deleteConfirm": "Delete",
  "history.transaction.deleteError": "Could not delete the transaction.",
  "history.transaction.edit": "Edit",
  "history.transaction.delete": "Delete",
};

const vi: TranslationDict = {
  "nav.home": "Trang chủ",
  "nav.summary": "Tổng quan",
  "nav.camera": "Máy ảnh",
  "nav.history": "Lịch sử",
  "nav.settings": "Cài đặt",

  "settings.title": "Cài đặt",
  "settings.section.account": "Tài khoản",
  "settings.section.appearance": "Giao diện",
  "settings.section.notifications": "Thông báo",
  "settings.section.language": "Ngôn ngữ & vùng",
  "settings.section.data": "Dữ liệu",

  "settings.item.personalInfo": "Thông tin cá nhân",
  "personalInfo.save": "Lưu",
  "personalInfo.saving": "Đang lưu…",
  "settings.item.password": "Mật khẩu",
  "settings.password.title": "Đổi mật khẩu",
  "settings.password.currentPassword": "Mật khẩu hiện tại",
  "settings.password.newPassword": "Mật khẩu mới",
  "settings.password.confirmPassword": "Xác nhận mật khẩu mới",
  "settings.password.placeholder.current": "Nhập mật khẩu hiện tại",
  "settings.password.placeholder.new": "Nhập mật khẩu mới",
  "settings.password.placeholder.confirm": "Nhập lại mật khẩu mới",
  "settings.password.error.mismatch": "Mật khẩu mới không khớp.",
  "settings.password.error.incorrect": "Mật khẩu hiện tại không đúng.",
  "settings.password.error.tooManyAttempts":
    "Quá nhiều lần thử. Vui lòng đợi vài phút rồi thử lại.",
  "settings.password.error.verifyFailed":
    "Không thể xác minh mật khẩu hiện tại.",
  "settings.password.error.loginRequired":
    "Vui lòng đăng nhập lại để xác minh mật khẩu.",
  "settings.password.error.missingInfo": "Thiếu thông tin",
  "settings.password.error.fillAllFields":
    "Vui lòng điền đầy đủ các trường mật khẩu.",
  "settings.password.error.confirmFirst":
    "Vui lòng xác nhận mật khẩu hiện tại trước.",
  "settings.password.error.invalidPassword": "Mật khẩu không hợp lệ",
  "settings.password.error.minLength": "Mật khẩu mới phải có ít nhất 6 ký tự.",
  "settings.password.error.cannotChange": "Lỗi",
  "settings.password.error.cannotChangeMessage":
    "Tài khoản của bạn không thể đổi mật khẩu ngay bây giờ. Vui lòng đăng nhập lại.",
  "settings.password.error.updateFailed":
    "Không thể cập nhật mật khẩu. Vui lòng thử lại.",
  "settings.password.error.retryLogin":
    "Vui lòng đăng nhập lại và thử đổi mật khẩu.",
  "settings.password.success.title": "Thành công",
  "settings.password.success.message": "Mật khẩu đã được cập nhật thành công.",
  "settings.password.button.cancel": "Hủy",
  "settings.password.button.update": "Cập nhật",
  "settings.item.signOut": "Đăng xuất",
  "settings.item.darkMode": "Chế độ tối",
  "settings.item.accentColor": "Màu nhấn",
  "settings.accentColor.title": "Màu nhấn",
  "settings.accentColor.done": "Xong",
  "settings.accentColor.yellow": "Vàng",
  "settings.accentColor.green": "Xanh lá",
  "settings.accentColor.pink": "Hồng",
  "settings.accentColor.blue": "Xanh dương",
  "settings.accentColor.red": "Đỏ",
  "settings.accentColor.orange": "Cam",
  "settings.item.pushNotifications": "Thông báo đẩy",
  "settings.item.appLanguage": "Ngôn ngữ ứng dụng",
  "settings.item.deleteAllData": "Xóa toàn bộ dữ liệu",

  "summary.recentTransactions": "Giao dịch gần đây",
  "summary.seeMore": "Xem thêm",
  "summary.header.allTime": "Tất cả",
  "summary.header.today": "Hôm nay",
  "summary.header.yesterday": "Hôm qua",
  "summary.header.tomorrow": "Ngày mai",
  "summary.dateRange.title": "Chọn khoảng thời gian",
  "summary.dateRange.day": "Ngày",
  "summary.dateRange.week": "Tuần",
  "summary.dateRange.month": "Tháng",
  "summary.dateRange.year": "Năm",
  "summary.dateRange.all": "Tất cả",
  "summary.dateRange.allTimeSelected": "Đã chọn tất cả thời gian",
  "summary.dateRange.cancel": "Hủy",
  "summary.dateRange.apply": "Áp dụng",
  "summary.month.january": "Tháng Một",
  "summary.month.february": "Tháng Hai",
  "summary.month.march": "Tháng Ba",
  "summary.month.april": "Tháng Tư",
  "summary.month.may": "Tháng Năm",
  "summary.month.june": "Tháng Sáu",
  "summary.month.july": "Tháng Bảy",
  "summary.month.august": "Tháng Tám",
  "summary.month.september": "Tháng Chín",
  "summary.month.october": "Tháng Mười",
  "summary.month.november": "Tháng Mười Một",
  "summary.month.december": "Tháng Mười Hai",
  "summary.chart.breakdown": "Phân tích",
  "summary.chart.trends": "Xu hướng",
  "summary.chart.income": "Thu nhập",
  "summary.chart.spent": "Chi tiêu",
  "summary.chart.all": "Tất cả",
  "summary.chart.noData": "Không có dữ liệu",
  "summary.chart.others": "Khác",
  "summary.chart.legend.income": "Thu nhập",
  "summary.chart.legend.spent": "Chi tiêu",
  "summary.chart.time.12am": "12 SA",
  "summary.chart.time.3am": "3 SA",
  "summary.chart.time.6am": "6 SA",
  "summary.chart.time.9am": "9 SA",
  "summary.chart.time.12pm": "12 CH",
  "summary.chart.time.3pm": "3 CH",
  "summary.chart.time.6pm": "6 CH",
  "summary.chart.time.9pm": "9 CH",
  "summary.account.saved": "Tiết kiệm",
  "summary.account.spent": "Chi tiêu",
  "summary.account.allTimeBalance": "Số dư tất cả thời gian",
  "summary.account.upToThisPoint": "Đến thời điểm này",
  "summary.account.period.today": "Hôm nay",
  "summary.account.period.thisWeek": "Tuần này",
  "summary.account.period.thisMonth": "Tháng này",
  "summary.account.period.thisYear": "Năm này",
  "summary.account.period.allTime": "Tất cả thời gian",

  "history.filter.title": "Lọc giao dịch",

  // Add transaction
  "add.title.add": "Thêm giao dịch",
  "add.title.edit": "Chỉnh sửa giao dịch",
  "add.date.today": "Hôm nay",
  "add.date.selectTitle": "Chọn ngày",
  "add.date.done": "Xong",
  "add.field.category": "Danh mục",
  "add.field.date": "Ngày",
  "add.note.label": "Ghi chú",
  "add.note.placeholder": "Thêm ghi chú...",
  "add.category.selectTitle": "Chọn danh mục",
  "add.category.searchPlaceholder": "Tìm danh mục...",
  "add.button.create": "Tạo giao dịch",
  "add.button.update": "Cập nhật",
  "add.error.permissionTitle": "Cần quyền truy cập",
  "add.error.permissionMessage":
    "Vui lòng cho phép truy cập thư viện ảnh để đính kèm hình.",
  "add.error.invalidAmountTitle": "Số tiền không hợp lệ",
  "add.error.invalidAmountMessage": "Vui lòng nhập số tiền hợp lệ.",
  "add.error.updateTitle": "Không thể cập nhật",
  "add.error.updateMessage": "Giao dịch chưa được cập nhật. Vui lòng thử lại.",
  "add.error.saveTitle": "Không thể lưu",
  "add.error.saveMessage": "Giao dịch chưa được lưu. Vui lòng thử lại.",

  // Camera
  "camera.preview.title.addIncome": "Thêm thu nhập",
  "camera.preview.title.addExpense": "Thêm chi tiêu",
  "camera.preview.note.placeholder": "Thêm ghi chú...",
  "camera.preview.type.spent": "Chi tiêu",
  "camera.preview.type.income": "Thu nhập",
  "camera.preview.field.amount": "Số tiền",
  "camera.preview.field.category": "Danh mục",
  "camera.preview.button.save": "Lưu chi tiêu",
  "camera.preview.category.selectTitle": "Chọn danh mục",
  "camera.preview.category.searchPlaceholder": "Tìm danh mục...",
  "camera.preview.error.captionTitle": "Lỗi",
  "camera.preview.error.captionMessage": "Không thể tạo mô tả từ hình ảnh",
  "camera.preview.error.amountTitle": "Lỗi",
  "camera.preview.error.amountMessage": "Vui lòng nhập số tiền hợp lệ",
  "camera.preview.error.saveTitle": "Lỗi",
  "camera.preview.error.saveMessage": "Không thể lưu chi tiêu",
  "camera.detail.title.income": "Chi tiết thu nhập",
  "camera.detail.title.expense": "Chi tiết chi tiêu",
  "camera.detail.field.amount": "Số tiền",
  "camera.detail.field.category": "Danh mục",
  "camera.calendar.filter.allTime": "Lọc: Tất cả",
  "camera.calendar.filter.custom": "Lọc: Tùy chỉnh",
  "camera.calendar.filter.reset": "Đặt lại",
  "camera.calendar.filter.year": "Năm",
  "camera.calendar.filter.month": "Tháng",
  "camera.calendar.filter.day": "Ngày",
  "camera.calendar.filter.all": "Tất cả",
  "camera.calendar.select.year": "Chọn năm",
  "camera.calendar.select.month": "Chọn tháng",
  "camera.calendar.select.day": "Chọn ngày",
  "camera.calendar.empty.noExpenses": "Chưa có chi tiêu nào",
  "camera.calendar.empty.addExpense": "Chụp ảnh để thêm chi tiêu!",
  "camera.calendar.empty.noExpensesMonth": "Không có chi tiêu trong tháng này",
  "camera.calendar.empty.tryAnotherMonth": "Thử chọn tháng khác",
  "camera.calendar.month.january": "Tháng Một",
  "camera.calendar.month.february": "Tháng Hai",
  "camera.calendar.month.march": "Tháng Ba",
  "camera.calendar.month.april": "Tháng Tư",
  "camera.calendar.month.may": "Tháng Năm",
  "camera.calendar.month.june": "Tháng Sáu",
  "camera.calendar.month.july": "Tháng Bảy",
  "camera.calendar.month.august": "Tháng Tám",
  "camera.calendar.month.september": "Tháng Chín",
  "camera.calendar.month.october": "Tháng Mười",
  "camera.calendar.month.november": "Tháng Mười Một",
  "camera.calendar.month.december": "Tháng Mười Hai",

  // Home
  "home.welcome": "Chào mừng, {name}!",
  "home.toolbar.history": "Lịch sử",
  "home.toolbar.scanBill": "Quét hóa đơn",
  "home.toolbar.text": "Văn bản",
  "home.toolbar.camera": "Máy ảnh",
  "home.today.label": "Hôm nay",
  "home.today.empty": "Chưa có ảnh hôm nay",
  "home.today.income": "Thu nhập",
  "home.today.spent": "Chi tiêu",
  "home.textModal.title": "Văn bản thành giao dịch",
  "home.textModal.instruction": "Mô tả chi tiêu hoặc thu nhập của bạn.",
  "home.textModal.placeholder": "VD: Cà phê $4.50, Ăn trưa $12...",
  "home.textModal.cancel": "Hủy",
  "home.textModal.create": "Tạo",
  "home.textModal.creating": "Đang tạo...",
  "home.textModal.error.title": "Không thể phân tích",
  "home.textModal.error.message":
    "Không thể hiểu văn bản này. Vui lòng điều chỉnh và thử lại.",
  "home.scanModal.title": "Quét hóa đơn thành giao dịch",
  "home.scanModal.instruction":
    "Chụp ảnh hoặc tải lên hình ảnh rõ ràng của hóa đơn.",
  "home.scanModal.uploadButton": "Tải ảnh hóa đơn",
  "home.scanModal.changeImage": "Đổi ảnh",
  "home.scanModal.extractedText": "Xem trước văn bản trích xuất",
  "home.scanModal.cancel": "Hủy",
  "home.scanModal.extract": "Trích xuất",
  "home.scanModal.creating": "Đang tạo...",
  "home.scanModal.error.cameraPermission":
    "Cần quyền camera để chụp ảnh hóa đơn.",
  "home.scanModal.error.photoFailed": "Không thể chụp ảnh. Vui lòng thử lại.",
  "home.scanModal.error.mediaPermission":
    "Cần quyền truy cập thư viện ảnh để tải ảnh hóa đơn.",
  "home.scanModal.error.pickFailed": "Không thể chọn ảnh. Vui lòng thử lại.",
  "home.scanModal.error.scanFailed":
    "Không thể quét hóa đơn. Vui lòng thử lại với ảnh rõ hơn.",
  "home.scanModal.error.extractFailed":
    "Không thể trích xuất giao dịch từ hóa đơn này. Vui lòng chụp ảnh rõ hơn.",
  "home.scanModal.selectSource.title": "Chọn nguồn ảnh",
  "home.scanModal.selectSource.message": "Chọn một tùy chọn",
  "home.scanModal.selectSource.cancel": "Hủy",
  "home.scanModal.selectSource.takePhoto": "Chụp ảnh",
  "home.scanModal.selectSource.photoLibrary": "Thư viện ảnh",
  "home.error.createTransaction": "Không thể tạo giao dịch từ hóa đơn này.",

  // History
  "history.title": "Lịch sử giao dịch",
  "history.filter.button": "Lọc",
  "history.total": "Tổng",
  "history.search.placeholder": "Tìm kiếm",
  "history.loading": "Đang tải...",
  "history.empty": "Không tìm thấy giao dịch",
  "history.filter.transactionType": "Loại giao dịch",
  "history.filter.categories": "Danh mục",
  "history.filter.categoriesSubtitle": "Chọn một hoặc nhiều danh mục",
  "history.filter.amountRange": "Khoảng số tiền",
  "history.filter.amountRangeSubtitle":
    "Tùy chọn: Đặt số tiền tối thiểu và tối đa",
  "history.filter.dateRange": "Khoảng thời gian",
  "history.filter.dateRangeSubtitle": "Tùy chọn: Lọc theo khoảng thời gian",
  "history.filter.groupBy": "Nhóm theo",
  "history.filter.groupBySubtitle": "Chọn cách nhóm giao dịch",
  "history.filter.type.all": "Tất cả",
  "history.filter.type.income": "Thu nhập",
  "history.filter.type.spent": "Chi tiêu",
  "history.filter.groupBy.day": "Theo ngày",
  "history.filter.groupBy.month": "Theo tháng",
  "history.filter.groupBy.year": "Theo năm",
  "history.filter.minAmount": "Số tiền tối thiểu",
  "history.filter.maxAmount": "Số tiền tối đa",
  "history.filter.startDate": "Ngày bắt đầu",
  "history.filter.endDate": "Ngày kết thúc",
  "history.filter.noLimit": "Không giới hạn",
  "history.filter.selectStartDate": "Chọn ngày bắt đầu",
  "history.filter.selectEndDate": "Chọn ngày kết thúc",
  "history.filter.today": "Hôm nay",
  "history.filter.reset": "Đặt lại",
  "history.filter.cancel": "Hủy",
  "history.filter.apply": "Áp dụng",
  "history.transaction.deleteTitle": "Xóa giao dịch",
  "history.transaction.deleteMessage":
    "Bạn có chắc chắn muốn xóa giao dịch này?",
  "history.transaction.deleteCancel": "Hủy",
  "history.transaction.deleteConfirm": "Xóa",
  "history.transaction.deleteError": "Không thể xóa giao dịch.",
  "history.transaction.edit": "Chỉnh sửa",
  "history.transaction.delete": "Xóa",
};

const dictionaries: Record<LanguageKey, TranslationDict> = {
  eng: en,
  vie: vi,
};

export function useI18n() {
  const { languageKey } = useTheme();
  const dict = dictionaries[languageKey] ?? en;

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let text = dict[key] ?? en[key] ?? key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(`{${paramKey}}`, params[paramKey]);
      });
    }
    return text;
  };

  return { t, languageKey };
}
