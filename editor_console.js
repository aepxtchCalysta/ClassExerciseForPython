class EditorConsole {
    constructor() {
        this.consoleLogs = [];
    }

    log(message) {
        // Thêm log mới vào danh sách consoleLogs
        this.consoleLogs.push({ message, class: 'log log--info' });
        this.printToConsole();
    }

    clearConsole() {
        // Xóa tất cả log trong consoleLogs và trên giao diện
        this.consoleLogs.length = 0;
        const consoleLogList = document.querySelector('.editor__console-logs');
        if (consoleLogList) {
            consoleLogList.innerHTML = '';
        }
    }

    printToConsole() {
        // In tất cả logs trong consoleLogs ra giao diện
        const consoleLogList = document.querySelector('.editor__console-logs');
        if (!consoleLogList) return;

        consoleLogList.innerHTML = '';
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
            return new Promise((resolve) => {
                const inputField = document.createElement('input');
                inputField.placeholder = promptMessage;
                inputField.style.margin = '10px';
                inputField.style.padding = '5px';
                inputField.style.fontSize = '16px';
                document.body.appendChild(inputField);
                inputField.focus();

                inputField.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        resolve(inputField.value);
                        document.body.removeChild(inputField);
                    }
                });
            });
        };

        // Chạy mã Python với Pyodide
        try {
            await pyodide.runPythonAsync(code);
        } catch (err) {
            this.consoleLogs.push({ message: `${err.name}: ${err.message}`, class: 'log log--error' });
            this.printToConsole();
        }
    }
}

// Khởi tạo đối tượng ConsoleHandler
const consoleHandler = new EditorConsole();
export default consoleHandler;
