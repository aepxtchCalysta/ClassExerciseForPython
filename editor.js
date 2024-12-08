// Retrieve Elements
const executeCodeBtn = document.querySelector('.editor__run');
const resetCodeBtn = document.querySelector('.editor__reset');

// Setup Ace Editor
let codeEditor = ace.edit("editorCode");
let defaultCode = 'print("Hello World!")';
let consoleMessages = [];

// Hàm thêm log vào giao diện console
function add_to_console(message, className = "log log--default") {
    const consoleLogList = document.querySelector('#console-output');

    if (!consoleLogList) {
        console.error("Phần tử #console-output không tồn tại!");
        return;
    }

    const newLogItem = document.createElement('li');
    const newLogText = document.createElement('pre');
    newLogText.className = className;
    newLogText.textContent = message;

    newLogItem.appendChild(newLogText);
    consoleLogList.appendChild(newLogItem);
}

// Gán hàm vào window để Pyodide sử dụng
window.add_to_console = add_to_console;

// Load Pyodide
let pyodideReadyPromise = loadPyodide().then(async (pyodide) => {
    window.pyodide = pyodide; // Gán Pyodide vào window
    console.log("Pyodide đã sẵn sàng!");

    // Cấu hình stdout và stderr
    await window.pyodide.runPython(`
import sys

class JSWriter:
    def write(self, message):
        import js
        js.add_to_console(message.strip())

    def flush(self):
        pass

sys.stdout = JSWriter()
sys.stderr = JSWriter()
    `);
});

// Cấu hình Ace Editor
function initEditor() {
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

// Xóa giao diện console
function clearConsole() {
    const consoleLogList = document.querySelector('#console-output');
    if (!consoleLogList) {
        console.error("Phần tử #console-output không tồn tại!");
        return;
    }
    while (consoleLogList.firstChild) {
        consoleLogList.removeChild(consoleLogList.firstChild);
    }
}

// Xử lý sự kiện Run
executeCodeBtn.addEventListener('click', async () => {
    clearConsole();
    const userCode = codeEditor.getValue();

    await pyodideReadyPromise;

    try {
        let result = await window.pyodide.runPythonAsync(userCode);
        if (result !== undefined) {
            add_to_console(result);
        }
    } catch (err) {
        console.error(err);
        add_to_console(`${err.name}: ${err.message}`, "log log--error");
    }
});

// Xử lý sự kiện Reset
resetCodeBtn.addEventListener('click', () => {
    codeEditor.setValue(defaultCode);
    clearConsole();
});

// Khởi tạo editor
initEditor();
