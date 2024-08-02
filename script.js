// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const editors = {};

    // Inicializar el primer editor
    const initializeEditor = (editorId, mode) => {
        const editor = CodeMirror.fromTextArea(document.getElementById(editorId), {
            mode: mode,
            theme: 'dracula',
            lineNumbers: true,
            styleActiveLine: true,
            lineWrapping: true,
            matchBrackets: true,
            autoCloseBrackets: true
        });
        editors[editorId] = editor;
    };

    initializeEditor('codeEditor1', 'text/x-csharp');

    // Función para actualizar la salida
    function updateOutput() {
        document.getElementById('outputCode').textContent = editors['codeEditor1'].getValue();
        document.getElementById('outputTerminal').textContent = 'Terminal: Simulación de salida del código.';
    }

    // Manejar cambio de tamaño de fuente
    function updateFontSize(sizeChange) {
        document.querySelectorAll('.CodeMirror').forEach(editor => {
            const currentSize = parseFloat(getComputedStyle(editor).fontSize);
            editor.style.fontSize = `${Math.max(currentSize + sizeChange, 6)}px`;
        });
    }

    document.getElementById('zoomIn').addEventListener('click', () => updateFontSize(2));
    document.getElementById('zoomOut').addEventListener('click', () => updateFontSize(-2));

    // Manejar búsqueda
    document.getElementById('search').addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        Object.values(editors).forEach(editor => {
            const doc = editor.getDoc();
            doc.getAllMarks().forEach(mark => mark.clear());
            if (query) {
                doc.eachLine(line => {
                    const lineText = line.text.toLowerCase();
                    let startIndex = 0;
                    let index;
                    while ((index = lineText.indexOf(query, startIndex)) !== -1) {
                        doc.markText({ line: line.lineNo(), ch: index }, { line: line.lineNo(), ch: index + query.length }, { className: 'highlight' });
                        startIndex = index + query.length;
                    }
                });
            }
        });
    });

    // Manejar pestañas
    function switchTab(tabId) {
        document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('close')) {
                // Handle close tab
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).remove();
                button.remove();
                const newActiveTab = document.querySelector('.tab-button') || null;
                if (newActiveTab) {
                    switchTab(newActiveTab.getAttribute('data-tab'));
                }
            } else {
                switchTab(button.getAttribute('data-tab'));
            }
        });
    });

    // Manejar pestañas de salida
    function switchOutputTab(tabId) {
        document.querySelectorAll('.output-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.output-pane').forEach(pane => pane.classList.remove('active'));
        document.querySelector(`.output-tab[data-output="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.addEventListener('click', () => switchOutputTab(tab.getAttribute('data-output')));
    });

    // Manejar deshacer/rehacer
    document.getElementById('undo').addEventListener('click', () => editors['codeEditor1'].undo());
    document.getElementById('redo').addEventListener('click', () => editors['codeEditor1'].redo());

    // Manejar copiar/pegar
    document.getElementById('copy').addEventListener('click', () => document.execCommand('copy'));
    document.getElementById('paste').addEventListener('click', () => document.execCommand('paste'));

    // Manejar formateo
    document.getElementById('format').addEventListener('click', () => {
        const formattedCode = editors['codeEditor1'].getValue().replace(/\s+/g, ' ');
        editors['codeEditor1'].setValue(formattedCode);
        updateOutput();
    });

    // Manejar nuevo archivo
    document.getElementById('newFile').addEventListener('click', () => {
        const tabId = `tab${document.querySelectorAll('.tab-button').length + 1}`;
        const newTabButton = document.createElement('div');
        newTabButton.classList.add('tab-button');
        newTabButton.setAttribute('data-tab', tabId);
        newTabButton.innerHTML = `Archivo ${document.querySelectorAll('.tab-button').length + 1} <span class="tab-close"><i class="fas fa-times"></i></span>`;
        document.querySelector('.tab-buttons').appendChild(newTabButton);

        const newTabPane = document.createElement('div');
        newTabPane.classList.add('tab-pane');
        newTabPane.setAttribute('id', tabId);
        newTabPane.innerHTML = `<div class="editor-container"><textarea id="${tabId}Editor"></textarea></div>`;
        document.querySelector('.tab-content').appendChild(newTabPane);

        initializeEditor(`${tabId}Editor`, 'text/x-csharp');
        newTabButton.click();
    });

    // Manejar abrir archivo
    document.getElementById('openFile').addEventListener('click', () => {
        // Implementa la funcionalidad de abrir archivo si es necesario
        alert('Funcionalidad de abrir archivo aún no implementada.');
    });

    // Manejar guardar archivo
    document.getElementById('save').addEventListener('click', () => {
        const activeTabId = document.querySelector('.tab-button.active').getAttribute('data-tab');
        const editor = editors[`${activeTabId}Editor`];
        const code = editor.getValue();
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.cs';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 0);
    });

    // Manejar limpiar editor
    document.getElementById('clear').addEventListener('click', () => {
        const activeTabId = document.querySelector('.tab-button.active').getAttribute('data-tab');
        const editor = editors[`${activeTabId}Editor`];
        editor.setValue('');
    });

    // Cambiar tema
    document.getElementById('themeToggle').addEventListener('click', () => {
        const currentTheme = editors['codeEditor1'].getOption('theme');
        const newTheme = currentTheme === 'dracula' ? 'default' : 'dracula';
        Object.values(editors).forEach(editor => editor.setOption('theme', newTheme));
    });

    // Inicializar salida
    updateOutput();
});
