document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filePath = urlParams.get('path');
    const codeEditorContainer = document.getElementById('code-editor');
    const fileNameElement = document.getElementById('file-name');
  	  fileNameElement.textContent = filePath.split('/').pop(); // 显示文件名，不包括路径
    
    let mode = 'text/plain';
    const fileExtension = filePath.split('.').pop().toLowerCase();
    
    const modeMap = {
        'py': 'text/x-python',
        'js': 'text/javascript',
        'html': 'text/html',
        'css': 'text/css',
        'java': 'text/x-java',
        'cpp': 'text/x-c++src',
        'c': 'text/x-csrc',
        'php': 'application/x-httpd-php',
        'rb': 'text/x-ruby',
        'go': 'text/x-go',
        'rust': 'text/x-rustsrc',
        'sql': 'text/x-sql',
        'xml': 'application/xml',
        'md': 'text/x-markdown',
        'json': 'application/json',
        'yaml': 'text/x-yaml',
        'sh': 'text/x-sh',
        'typescript': 'text/typescript',
        'swift': 'text/x-swift'
    };

    mode = modeMap[fileExtension] || mode;

    const codeEditor = CodeMirror(codeEditorContainer, {
        mode: mode,
        lineNumbers: true,
        theme: 'material',
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        viewportMargin: Infinity
    });
  
  // 添加这个函数调用
  setTimeout(function() {
      codeEditor.refresh();
  }, 1);

    async function loadFileContent() {
        try {
            const response = await fetch(`/api/file_content?path=${encodeURIComponent(filePath)}`);
            if (!response.ok) {
                throw new Error('无法加载文件内容');
            }
            const data = await response.json();
            codeEditor.setValue(data.content);
        } catch (error) {
            console.error('加载文件内容时出错:', error);
            alert('加载文件内容时出错: ' + error.message);
        }
        codeEditor.refresh();
    }

    document.getElementById('save-button').addEventListener('click', async () => {
        const content = codeEditor.getValue();
        try {
            const response = await fetch(`/api/save_file?path=${encodeURIComponent(filePath)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: content }),
            });

            if (!response.ok) {
                throw new Error('保存文件失败');
            }

            showNotification('文件已成功保存！');
        } catch (error) {
            console.error('保存文件时出错:', error);
            showNotification('保存文件时出错: ' + error.message, 'error');
        }
    });
  
    function showNotification(message, type = 'success') {
        console.log('Showing notification:', message, type);
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    document.getElementById('close-button').addEventListener('click', () => {
        window.parent.postMessage('closeEditor', '*');
    });

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            document.getElementById('save-button').click();
        } 
    });

    loadFileContent();
});
