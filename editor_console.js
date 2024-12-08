class EditorConsole {
  constructor() {
    this.consoleLogList = document.getElementById('console-output');
    this.consoleLogs = [];
  }

  log(message, type = 'log') {
    this.consoleLogs.push({ message, type });
    this.printToConsole();
  }

  clear() {
    this.consoleLogs = [];
    if (this.consoleLogList) {
      this.consoleLogList.innerHTML = '';
    }
  }

  printToConsole() {
    this.consoleLogList.innerHTML = '';
    this.consoleLogs.forEach(log => {
      const logItem = document.createElement('li');
      logItem.textContent = log.message;
      logItem.className = log.type === 'error' ? 'log-error' : 'log-info';
      this.consoleLogList.appendChild(logItem);
    });
  }
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
