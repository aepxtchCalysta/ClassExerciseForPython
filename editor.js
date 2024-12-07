// Khởi tạo các biến cần thiết
const consoleLogList = document.querySelector('.editor__console-logs');
const executeCodeBtn = document.querySelector('.editor__run');
const resetCodeBtn = document.querySelector('.editor__reset');

// Khởi tạo Ace Editor
let codeEditor = ace.edit("editorCode");
let defaultCode = 'print("Hello World!")';
let consoleMessages = [];

// Load Pyodide
let pyodideReadyPromise = loadPyodide().then((pyodide) => {
    window.pyodide = pyodide; // Gán Pyodide vào window để sử dụng sau này
    console.log("Pyodide is ready!");

    // Chuyển hướng stdout đến một hàm JavaScript
    window.pyodide.runPython(`
import sys

class JSWriter:
    def write(self, message):
        # Gọi hàm JavaScript để thêm thông điệp vào console
        js.console.log(message.strip())

    def flush(self):
        pass  # Không cần thiết

sys.stdout = JSWriter()
`);
});

// Định nghĩa đối tượng editorLib để xử lý console
let editorLib = {
    clearConsoleScreen() {
        consoleMessages.length = 0;
        // Remove all elements in the log list
        while (consoleLogList.firstChild) {
            consoleLogList.removeChild(consoleLogList.firstChild);
        }
    },
    printToConsole() {
        consoleMessages.forEach(log => {
            const newLogItem = document.createElement('li');
            const newLogText = document.createElement('pre');
            newLogText.className = log.class;
            newLogText.textContent = `> ${log.message}`;
            newLogItem.appendChild(newLogText);
            consoleLogList.appendChild(newLogItem);
        });
    },
    init() {
        // Thiết lập Ace Editor
        codeEditor.setTheme("ace/theme/dreamweaver");
        codeEditor.session.setMode("ace/mode/python");
        codeEditor.setOptions({
            fontFamily: 'Inconsolata',
            fontSize: '12pt',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
        });
        codeEditor.setValue(defaultCode);
    }
};

// Hàm xử lý log cho console
function consoleHandler(message) {
    consoleMessages.push({
        message: message,
        class: 'log'
    });
    editorLib.printToConsole();  // Gọi lại hàm printToConsole khi có log mới
}

// Xử lý sự kiện khi bấm nút "Run"
executeCodeBtn.addEventListener('click', async () => {
    // Xóa console trước khi chạy mã mới
    editorLib.clearConsoleScreen();

    // Lấy mã người dùng nhập vào từ editor
    const userCode = codeEditor.getValue();

    // Đảm bảo Pyodide đã sẵn sàng
    await pyodideReadyPromise;

    // Chạy mã Python người dùng nhập vào
    try {
        await window.pyodide.runPythonAsync(userCode);
    } catch (err) {
        console.error(err);
        consoleMessages.push({
            message: `${err.name}: ${err.message}`,
            class: 'log log--error'
        });
    }

    // In kết quả vào console
    editorLib.printToConsole();
});

// Xử lý sự kiện khi bấm nút "Reset"
resetCodeBtn.addEventListener('click', () => {
    // Khôi phục lại mã mặc định trong editor
    codeEditor.setValue(defaultCode);
    // Xóa console
    editorLib.clearConsoleScreen();
});

// Khởi tạo editor
editorLib.init();
