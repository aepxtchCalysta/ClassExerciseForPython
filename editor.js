import consoleHandler from './editor_console.js'; // Import đối tượng từ editor_console.js

// Các phần tử cần thiết trong HTML
const consoleLogList = document.querySelector('.editor__console-logs');
const executeCodeBtn = document.querySelector('.editor__run');
const resetCodeBtn = document.querySelector('.editor__reset');

// Kiểm tra sự tồn tại của các phần tử HTML cần thiết
if (!consoleLogList || !executeCodeBtn || !resetCodeBtn) {
    console.error('Một hoặc nhiều phần tử HTML cần thiết không tồn tại!');
}

// Setup Ace
let codeEditor = ace.edit("editorCode");
let defaultCode = 'print("Hello World!")';

// Load Pyodide
let pyodideReadyPromise = loadPyodide().then((pyodide) => {
    window.pyodide = pyodide;
    consoleHandler.log('Pyodide đã sẵn sàng!');

    // Chuyển hướng stdout và stderr đến custom console handler
    window.pyodide.runPython(`
import sys
import js

class WebConsoleWriter:
    def write(self, message):
        js.consoleHandler.log(message.strip())

    def flush(self):
        pass

sys.stdout = WebConsoleWriter()
sys.stderr = WebConsoleWriter()
`);
});

let editorLib = {
    clearConsoleScreen() {
        // Xóa sạch console logs
        consoleHandler.clearConsole();
    },
    printToConsole() {
        // Gọi consoleHandler để in logs ra console
        consoleHandler.printToConsole();
    },
    init() {
        // Configure Ace Editor
        codeEditor.setTheme("ace/theme/dreamweaver");
        codeEditor.session.setMode("ace/mode/python");
        codeEditor.setOptions({
            fontFamily: 'Inconsolata',
            fontSize: '12pt',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
        });

        // Set default code
        codeEditor.setValue(defaultCode);
    }
};

// Sự kiện cho nút "Run"
executeCodeBtn.addEventListener('click', async () => {
    editorLib.clearConsoleScreen(); // Xóa console trước khi chạy code

    const userCode = codeEditor.getValue(); // Lấy code từ Ace Editor

    await pyodideReadyPromise; // Đảm bảo Pyodide đã sẵn sàng

    try {
        // Chạy mã Python
        await consoleHandler.runPythonWithInput(window.pyodide, userCode);
    } catch (err) {
        consoleHandler.log(`${err.name}: ${err.message}`, 'error');
    }

    editorLib.printToConsole(); // Hiển thị output trên console
});

// Sự kiện cho nút "Reset"
resetCodeBtn.addEventListener('click', () => {
    codeEditor.setValue(defaultCode); // Reset Ace Editor
    editorLib.clearConsoleScreen(); // Xóa console
});

// Khởi tạo Editor
editorLib.init();
