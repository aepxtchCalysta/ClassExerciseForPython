class ConsoleLogger {
    constructor() {
        // Lưu danh sách các log
        this.logs = [];
    }

    // Phương thức log đơn lẻ
    logSingleArgument(argument) {
        if (argument !== undefined) {
            const message = argument.toString();
            this.logs.push(message);
            console.log(message); // Log ra DevTools Console
        } else {
            console.error("logSingleArgument called with undefined argument.");
        }
    }

    // Phương thức log chính
    log(...args) {
        if (args.length === 1) {
            this.logSingleArgument(args[0]); // Gọi logSingleArgument nếu có 1 tham số
        } else if (args.length > 1) {
            const combinedMessage = args.map(arg => arg.toString()).join(" ");
            this.logs.push(combinedMessage);
            console.log(combinedMessage); // Log ra DevTools Console
        } else {
            console.error("log called with no arguments.");
        }
    }

    // Hiển thị logs trên UI
    printLogsToUI(logContainerElement) {
        logContainerElement.innerHTML = ""; // Xóa nội dung cũ

        this.logs.forEach(log => {
            const logItem = document.createElement("div");
            logItem.textContent = log;
            logItem.className = "console-log-item";
            logContainerElement.appendChild(logItem);
        });
    }

    // Xóa toàn bộ logs
    clearLogs() {
        this.logs = [];
    }
}

// Khởi tạo ConsoleLogger
const logger = new ConsoleLogger();

// Định nghĩa global jsConsole để sử dụng với Pyodide
window.jsConsole = {
    log: (...args) => logger.log(...args), // Kết nối log
    clear: () => logger.clearLogs(), // Kết nối clearLogs
};

// Xuất logger để sử dụng trong file khác nếu cần
export default logger;
