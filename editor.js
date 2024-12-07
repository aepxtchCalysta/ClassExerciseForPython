// editor.js

import consoleHandler from './editor_console.js'; // Import đối tượng từ editor_console.js

// Các phần tử cần thiết trong HTML
const consoleLogList = document.querySelector('.editor__console-logs');
const executeCodeBtn = document.querySelector('.editor__run');
const resetCodeBtn = document.querySelector('.editor__reset');

// Setup Ace
let codeEditor = ace.edit("editorCode");
let defaultCode = 'print("Hello World!")';
let consoleMessages = [];

// Load Pyodide
let pyodideReadyPromise = loadPyodide().then((pyodide) => {
    window.pyodide = pyodide; // Gán Pyodide vào window để sử dụng sau này
    consoleHandler.log('Pyodide is ready!'); // Log khi Pyodide sẵn sàng

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
        // Configure Ace

        // Theme
        codeEditor.setTheme("ace/theme/dreamweaver");

        // Set language
        codeEditor.session.setMode("ace/mode/python");

        // Set Options
        codeEditor.setOptions({
            fontFamily: 'Inconsolata',
            fontSize: '12pt',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
        });

        // Set Default Code
        codeEditor.setValue(defaultCode);
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
        // Run the Python code
        await window.pyodide.runPythonAsync(userCode);
    } catch (err) {
        consoleHandler.log(`${err.name}: ${err.message}`, 'error');
    }

    // Print to the console
    editorLib.printToConsole();
});

resetCodeBtn.addEventListener('click', () => {
    // Clear ace editor
    codeEditor.setValue(defaultCode);

    // Clear console messages
    editorLib.clearConsoleScreen();
})

editorLib.init();
