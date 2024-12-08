import consoleHandler from './editor_console.js';

document.addEventListener('DOMContentLoaded', () => {
    // Các phần tử cần thiết trong HTML
    const consoleLogList = document.getElementById('console-output');
    const executeCodeBtn = document.querySelector('.editor__run');
    const resetCodeBtn = document.querySelector('.editor__reset');
    const editorCodeDiv = document.getElementById('editorCode');

    // Kiểm tra sự tồn tại của các phần tử HTML cần thiết
    if (!consoleLogList || !executeCodeBtn || !resetCodeBtn || !editorCodeDiv) {
        console.error('Một hoặc nhiều phần tử HTML cần thiết không tồn tại!');
        return;
    }

    // Setup Ace Editor
    const codeEditor = ace.edit("editorCode");
    const defaultCode = 'print("Hello World!")';

    // Cấu hình Ace Editor
    codeEditor.setTheme("ace/theme/dreamweaver");
    codeEditor.session.setMode("ace/mode/python");
    codeEditor.setOptions({
        fontFamily: 'Inconsolata',
        fontSize: '12pt',
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
    });

    // Thiết lập code mặc định
    codeEditor.setValue(defaultCode);

    // Load Pyodide
    let pyodideReadyPromise = loadPyodide().then((pyodide) => {
        window.pyodide = pyodide;

        // Log trạng thái Pyodide
        consoleHandler.log('Pyodide đã sẵn sàng!');

        // Chuyển hướng stdout và stderr đến custom console handler
        pyodide.runPython(`
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

    // Sự kiện cho nút "Run"
    executeCodeBtn.addEventListener('click', async () => {
        // Xóa console trước khi chạy code
        consoleHandler.clear();

        const userCode = codeEditor.getValue(); // Lấy mã người dùng từ Ace Editor

        await pyodideReadyPromise; // Đảm bảo Pyodide đã sẵn sàng

        try {
            // Chạy mã Python của người dùng
            await consoleHandler.runPythonWithInput(window.pyodide, userCode);
        } catch (err) {
            consoleHandler.log(`Error: ${err.message}`, 'error');
        }
    });

    // Sự kiện cho nút "Reset"
    resetCodeBtn.addEventListener('click', () => {
        codeEditor.setValue(defaultCode); // Reset mã trong Ace Editor
        consoleHandler.clear(); // Xóa console
    });
});
