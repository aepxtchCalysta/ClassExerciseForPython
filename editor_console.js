class EditorConsole {
  constructor() {
    this.consoleLogList = document.getElementById('console-output'); // Đảm bảo ID khớp với HTML
    this.consoleLogs = [];
  }

  log(message, type = 'log') {
    // Ghi log vào mảng
    this.consoleLogs.push({ message, type });

    // Cập nhật giao diện console
    this.printToConsole();
  }

  clear() {
    // Xóa mảng logs
    this.consoleLogs = [];

    // Xóa giao diện console
    if (this.consoleLogList) {
      this.consoleLogList.innerHTML = '';
    }
  }

  printToConsole() {
    // Hiển thị tất cả log
    this.consoleLogList.innerHTML = ''; // Xóa các log cũ
    this.consoleLogs.forEach(log => {
      const logItem = document.createElement('li');
      logItem.textContent = log.message;

      // Đặt class dựa trên loại log
      logItem.className = log.type === 'error' ? 'log-error' : 'log-info';

      this.consoleLogList.appendChild(logItem);
    });
  }

  async runPythonWithInput(pyodide, code) {
    try {
      await pyodide.runPythonAsync(code); // Chạy mã Python
    } catch (err) {
      // Log lỗi nếu xảy ra
      this.log(`${err.name}: ${err.message}`, 'error');
    }
  }
}

// Xuất một đối tượng duy nhất
const consoleHandler = new EditorConsole();
export default consoleHandler;
