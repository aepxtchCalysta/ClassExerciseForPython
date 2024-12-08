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
    window.pyodide = pyodide;
    consoleHandler.log('Pyodide is ready!');

    // Chuyển hướng stdout đến khung console web
    window.pyodide.runPython(`
import sys
import js

class WebConsoleWriter:
    def write(self, message):
        js.consoleHandler.log(message.strip())

    def flush(self):
        pass  # Không cần thiết

sys.stdout = WebConsoleWriter()
sys.stderr = WebConsoleWriter()
`);
});

document.getElementById('run-btn').addEventListener('click', async () => {
    consoleHandler.clear(); // Xóa console trước khi chạy code mới

    const code = document.getElementById('editorCode').value;

    await pyodideReadyPromise;

    try {
        await window.pyodide.runPythonAsync(code);
    } catch (err) {
        consoleHandler.log(`Error: ${err.message}`);
    }
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
