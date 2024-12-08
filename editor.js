import consoleHandler from './editor_console.js';

// Gắn consoleHandler vào window để Pyodide sử dụng
window.consoleHandler = consoleHandler;

document.addEventListener('DOMContentLoaded', () => {
    const executeCodeBtn = document.querySelector('.editor__run');
    const resetCodeBtn = document.querySelector('.editor__reset');
    const editorCodeDiv = document.getElementById('editorCode');

    if (!executeCodeBtn || !resetCodeBtn || !editorCodeDiv) {
        console.error('Một hoặc nhiều phần tử HTML cần thiết không tồn tại!');
        return;
    }

    // Setup Ace Editor
    const codeEditor = ace.edit("editorCode");
    const defaultCode = 'print("Hello World!")';

    codeEditor.setTheme("ace/theme/dreamweaver");
    codeEditor.session.setMode("ace/mode/python");
    codeEditor.setOptions({
        fontFamily: 'Inconsolata',
        fontSize: '12pt',
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
    });
    codeEditor.setValue(defaultCode);

    let pyodideInstance = null;

    const loadPyodideInstance = async () => {
        consoleHandler.log('Đang tải Pyodide...');
        pyodideInstance = await loadPyodide();

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

    loadPyodideInstance();

    executeCodeBtn.addEventListener('click', async () => {
        consoleHandler.clear();

        if (!pyodideInstance) {
            consoleHandler.log('Pyodide chưa sẵn sàng. Vui lòng đợi và thử lại.', 'error');
            return;
        }

        const userCode = codeEditor.getValue();

        try {
            consoleHandler.log('Đang chạy mã...');
            await pyodideInstance.runPythonAsync(userCode);
        } catch (err) {
            consoleHandler.log(`Error: ${err.message}`, 'error');
        }
    });

    resetCodeBtn.addEventListener('click', () => {
        codeEditor.setValue(defaultCode);
        consoleHandler.clear();
    });
});
