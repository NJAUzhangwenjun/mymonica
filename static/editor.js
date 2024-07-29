document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filePath = urlParams.get('path');
    const codeEditorContainer = document.getElementById('code-editor');
    
    // 根据文件类型添加 CodeMirror 实例
    let mode = 'text/plain'; // 默认模式
    if (filePath.endsWith('.py')) {
        mode = 'text/x-python';
    } else if (filePath.endsWith('.js')) {
        mode = 'text/javascript';
    } else if (filePath.endsWith('.html')) {
        mode = 'text/html';
    }

    const codeEditor = CodeMirror(codeEditorContainer, {
        mode: mode,
        lineNumbers: true,
        theme: 'material',
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        viewportMargin: Infinity // 使编辑器自适应高度
    });

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
    }

    document.getElementById('save-button').addEventListener('click', async () => {
        const content = codeEditor.getValue(); // 获取编辑器内容
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

            alert('文件已成功保存！');
        } catch (error) {
            console.error('保存文件时出错:', error);
            alert('保存文件时出错: ' + error.message);
        }
    });
      // 增加对 Ctrl + S 保存的支持
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault(); // 防止浏览器默认的保存行为
            document.getElementById('save-button').click(); // 触发保存按钮的点击事件
        }
    });

    loadFileContent();
});
