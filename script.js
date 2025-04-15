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
    tab.onclick = () => switchFile(fileName);
    document.getElementById("file-tabs").appendChild(tab);
}

// Switch to a different file
function switchFile(fileName) {
    currentFile = fileName;
    document.querySelectorAll("#file-tabs div").forEach((tab) => {
        tab.classList.toggle("active", tab.textContent === fileName);
    });
    editor.setValue(files[fileName]);
    editor.setOption("mode", getMode(fileName));
}

// Determine CodeMirror mode based on file extension
function getMode(fileName) {
    if (fileName.endsWith(".html")) return "htmlmixed";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".js")) return "javascript";
    return "plaintext";
}

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

// Show custom right-click menu
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const menu = document.getElementById("context-menu");
    menu.style.display = "block";
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
});

// Hide custom menu on click
document.addEventListener("click", () => {
    document.getElementById("context-menu").style.display = "none";
});

// Initialize the playground
document.addEventListener("DOMContentLoaded", () => {
    initializeEditor();
    createFileFromBar("index.html"); // Default file
    createFileFromBar("style.css"); // Default file
    createFileFromBar("script.js"); // Default file
    switchFile("index.html"); // Open default file
});