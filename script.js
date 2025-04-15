let editor; // CodeMirror instance
let files = {}; // Store files with their content
let currentFile = null;

// Initialize CodeMirror
function initializeEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        mode: "htmlmixed",
        theme: "dracula",
        lineNumbers: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
    });

    // Update iframe in real-time
    editor.on("change", () => {
        if (currentFile) {
            files[currentFile] = editor.getValue();
            saveFilesToLocalStorage();
            updateIframe();
        }
    });
}

// Update iframe with the latest code
function updateIframe() {
    const iframe = document.getElementById("output");
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    const html = files["index.html"] || "";
    const css = `<style>${files["style.css"] || ""}</style>`;
    const js = `<script>${files["script.js"] || ""}</script>`;

    iframeDoc.open();
    iframeDoc.write(html + css + js);
    iframeDoc.close();
}

// Save files to localStorage
function saveFilesToLocalStorage() {
    localStorage.setItem("playgroundFiles", JSON.stringify(files));
    localStorage.setItem("currentFile", currentFile);
}

// Load files from localStorage
function loadFilesFromLocalStorage() {
    const savedFiles = localStorage.getItem("playgroundFiles");
    const savedCurrentFile = localStorage.getItem("currentFile");

    if (savedFiles) {
        files = JSON.parse(savedFiles);
        Object.keys(files).forEach(addTab);
    }

    if (savedCurrentFile) {
        switchFile(savedCurrentFile);
    } else if (Object.keys(files).length > 0) {
        switchFile(Object.keys(files)[0]);
    }
}

// Create a new file
function createFileFromBar(fileName) {
    if (!files[fileName]) {
        files[fileName] = ""; // Initialize empty content
        addTab(fileName);
        switchFile(fileName);
    }
}

// Add a new tab for the file
function addTab(fileName) {
    const tab = document.createElement("div");
    tab.textContent = fileName;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "x";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteFile(fileName, tab);

    tab.appendChild(deleteBtn);
    tab.onclick = () => switchFile(fileName);
    tab.oncontextmenu = (e) => {
        e.preventDefault();
        showTabContextMenu(e, tab);
    };

    document.getElementById("file-tabs").appendChild(tab);
}

// Switch to a different file
function switchFile(fileName) {
    currentFile = fileName;
    document.querySelectorAll("#file-tabs div").forEach((tab) => {
        tab.classList.toggle("active", tab.textContent.includes(fileName));
    });
    editor.setValue(files[fileName]);
    editor.setOption("mode", getMode(fileName));
}

// Rename a file
function renameFile() {
    const tab = document.querySelector("#tab-context-menu").currentTab;
    if (!tab) return;

    tab.contentEditable = true;
    tab.classList.add("editable");
    tab.focus();

    tab.onkeypress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const newName = tab.textContent.trim();
            if (newName && !files[newName]) {
                files[newName] = files[currentFile];
                delete files[currentFile];
                currentFile = newName;
                tab.contentEditable = false;
                tab.classList.remove("editable");
                saveFilesToLocalStorage();
                switchFile(newName);
            } else {
                alert("Invalid or duplicate file name");
                tab.textContent = currentFile;
                tab.contentEditable = false;
                tab.classList.remove("editable");
            }
        }
    };
}

// Delete a file
function deleteFile(fileName, tab) {
    delete files[fileName];
    tab.remove();
    saveFilesToLocalStorage();

    if (currentFile === fileName) {
        const remainingFiles = Object.keys(files);
        if (remainingFiles.length > 0) {
            switchFile(remainingFiles[0]);
        } else {
            currentFile = null;
            editor.setValue("");
        }
    }
}

// Show/Hide Console
function toggleConsole() {
    const consoleWrapper = document.getElementById("console-wrapper");
    const toggleButton = document.getElementById("toggle-console");
    if (consoleWrapper.classList.contains("collapsed")) {
        consoleWrapper.classList.remove("collapsed");
        consoleWrapper.classList.add("expanded");
        toggleButton.textContent = "v";
    } else {
        consoleWrapper.classList.remove("expanded");
        consoleWrapper.classList.add("collapsed");
        toggleButton.textContent = "^";
    }
}

// Determine CodeMirror mode based on file extension
function getMode(fileName) {
    if (fileName.endsWith(".html")) return "htmlmixed";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".js")) return "javascript";
    return "plaintext";
}

// Show custom right-click menu
document.addEventListener("contextmenu", (e) => {
    if (e.target.closest("#file-tabs")) return; // Prevent default for tab context menu
    e.preventDefault();
    const menu = document.getElementById("context-menu");
    menu.style.display = "block";
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
});

// Show custom context menu for file tabs
function showTabContextMenu(e, tab) {
    const menu = document.getElementById("tab-context-menu");
    menu.style.display = "block";
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.currentTab = tab;
}

// Hide all context menus
document.addEventListener("click", () => {
    document.getElementById("context-menu").style.display = "none";
    document.getElementById("tab-context-menu").style.display = "none";
});

// Handle file input (add file when pressing Enter)
document.getElementById("file-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const fileName = e.target.value.trim();
        if (fileName) {
            createFileFromBar(fileName);
            e.target.value = ""; // Clear input
        }
    }
});

// Initialize the playground
document.addEventListener("DOMContentLoaded", () => {
    initializeEditor();
    loadFilesFromLocalStorage();
});