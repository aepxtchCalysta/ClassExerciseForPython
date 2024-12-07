class EditorConsole {
  constructor() {
    this.consoleLogs = [];
    this.logSingleArgument = (message) => {
      this.consoleLogs.push(message);
      this.printToConsole();
    };

    this.handleInput = (promptMessage) => {
      return new Promise((resolve) => {
        const inputField = document.createElement("input");
        inputField.placeholder = promptMessage;
        inputField.style.margin = "10px";
        inputField.style.padding = "5px";
        inputField.style.fontSize = "16px";
        document.body.appendChild(inputField);
        inputField.focus();

        inputField.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            resolve(inputField.value);
            document.body.removeChild(inputField);
          }
        });
      });
    };
  }

  printToConsole() {
    const consoleLogList = document.querySelector('.editor__console-logs');
    consoleLogList.innerHTML = "";
    this.consoleLogs.forEach(log => {
      const logItem = document.createElement('li');
      const logText = document.createElement('pre');
      logText.className = log.class;
      logText.textContent = log.message;
      logItem.appendChild(logText);
      consoleLogList.appendChild(logItem);
    });
  }

  async runPythonWithInput(pyodide, code) {
    // Chuyển hướng input() đến hàm handleInput
    window.input = async (promptMessage) => {
      return await this.handleInput(promptMessage);
    };

    // Chạy mã Python qua Pyodide
    try {
      await pyodide.runPythonAsync(code);
    } catch (err) {
      console.log(err);
      this.consoleLogs.push({ message: `${err.name}: ${err.message}`, class: 'log log--error' });
      this.printToConsole();
    }
  }
}
// Đảm bảo rằng đối tượng được xuất khẩu như là mặc định
export default {
  logSingleArgument(message) {
    // Hàm này xử lý việc log một tham số duy nhất vào console
    console.log(message);
  },

  log(message, type = 'log') {
    // Hàm này xử lý việc log với loại khác nhau (log, error, info)
    if (type === 'error') {
      console.error(message);
    } else if (type === 'info') {
      console.info(message);
    } else {
      console.log(message);
    }
  },

  clearConsole() {
    // Hàm này xóa sạch console log
    console.clear();
  },
};
// Đảm bảo khởi tạo và sử dụng đúng class này
const consoleHandler = new EditorConsole();
