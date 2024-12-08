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

    // Biến để kiểm soát trạng thái của Pyodide
    let pyodideInstance = null;

    // Load Pyodide
    const loadPyodideInstance = async () => {
        consoleHandler.log('Đang tải Pyodide...');
        pyodideInstance = await loadPyodide();

        // Chuyển hướng stdout và stderr
        pyodideInstance.runPython(`
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
        consoleHandler.log('Pyodide đã sẵn sàng!');
    };

    // Khởi động Pyodide
    loadPyodideInstance();

    // Sự kiện cho nút "Run"
    executeCodeBtn.addEventListener('click', async () => {
        // Xóa console trước khi chạy code
        consoleHandler.clear();

        if (!pyodideInstance) {
            consoleHandler.log('Pyodide chưa sẵn sàng. Vui lòng đợi và thử lại.', 'error');
            return;
        }

        const userCode = codeEditor.getValue(); // Lấy mã người dùng từ Ace Editor

        try {
            // Chạy mã Python của người dùng
            consoleHandler.log('Đang chạy mã...');
            await consoleHandler.runPythonWithInput(pyodideInstance, userCode);
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
