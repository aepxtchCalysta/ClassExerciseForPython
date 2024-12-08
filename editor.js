// Retrieve Elements
const consoleLogList = document.querySelector('.editor__console-logs');
const executeCodeBtn = document.querySelector('.editor__run');
const resetCodeBtn = document.querySelector('.editor__reset');

// Setup Ace
let codeEditor = ace.edit("editorCode");
let defaultCode = 'print("Hello World!")';
let consoleMessages = [];

// Load Pyodide
let pyodideReadyPromise = loadPyodide().then(async (pyodide) => {
    window.pyodide = pyodide; // Gán Pyodide vào window để sử dụng sau này
    console.log("Pyodide is ready!");

    // Khởi tạo mã Python với việc sử dụng console.log của JavaScript
    window.pyodide.runPython(`
import sys

class JSWriter:
    def write(self, message):
        # Sử dụng Python để gọi console.log trong JavaScript
        import js
        js.console.log(message.strip())

        # Gọi hàm JavaScript để thêm thông điệp vào giao diện web (console của website)
        js.add_to_console(message.strip())

    def flush(self):
        pass  # Không cần thiết

sys.stdout = JSWriter()
sys.stderr = JSWriter()  # Chuyển cả stderr nếu cần
`);
});

// Hàm thêm thông điệp vào console trên website
function add_to_console(message) {
    const logItem = document.createElement('li');
    const logText = document.createElement('pre');
    logText.className = 'log log--default';
    logText.textContent = `> ${message}`;
    logItem.appendChild(logText);
    document.querySelector('.editor__console-logs').appendChild(logItem);
}

let editorLib = {
    clearConsoleScreen() {
        // Xóa các log cũ
        const consoleLogList = document.querySelector('console-output');

         if (!consoleLogList) {
        console.error('Phần tử console-output không tồn tại!');
        return;
        } 
        while (consoleLogList.firstChild) {
            consoleLogList.removeChild(consoleLogList.firstChild);
        }
    },
    init() {
        // Configure Ace
        codeEditor.setTheme("ace/theme/dreamweaver");
        codeEditor.session.setMode("ace/mode/python");
        codeEditor.setOptions({
            fontFamily: 'Inconsolata',
            fontSize: '12pt',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
        });

        // Set Default Code
        codeEditor.setValue('print("Hello World!")');
    }
}

// Events
executeCodeBtn.addEventListener('click', async () => {
    // Clear console messages
    editorLib.clearConsoleScreen();
    
    // Get input from the code editor
    const userCode = codeEditor.getValue();

    // Ensure Pyodide is ready
    await pyodideReadyPromise;

    // Run the user code using Pyodide
    try {
        let result = await window.pyodide.runPythonAsync(userCode);
        // In kết quả trả về nếu có
        if (result !== undefined) {
            add_to_console(result);
        }
    } catch (err) {
        console.error(err);
        add_to_console(`${err.name}: ${err.message}`);
    }
});

resetCodeBtn.addEventListener('click', () => {
    // Clear ace editor
    codeEditor.setValue('print("Hello World!")');
    // Clear console messages
    editorLib.clearConsoleScreen();
})

editorLib.init();
