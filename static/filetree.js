document.addEventListener('DOMContentLoaded', () => {
    const fileTree = document.getElementById('file-tree');
    const refreshTreeButton = document.getElementById('refresh-tree-button');
    const userInput = document.getElementById('user-input');

    async function loadFileTree() {
        try {
            const response = await fetch('/api/file_tree');
            if (!response.ok) {
                throw new Error('无法加载文件树');
            }
            const data = await response.json();
            renderFileTree(data);
        } catch (error) {
            console.error('加载文件树时出错:', error);
            fileTree.innerHTML = '<p>加载文件树时出错</p>';
        }
    }

    function renderFileTree(data, path = '') {
        fileTree.innerHTML = '';
        const ul = document.createElement('ul');
        data.forEach(item => {
            const li = document.createElement('li');
            const fullPath = path ? `${path}/${item.name}` : item.name;
            if (item.type === 'directory') {
                li.innerHTML = `<span class="folder">${item.name}</span>`;
                if (item.children && item.children.length > 0) {
                    const subUl = document.createElement('ul');
                    subUl.style.display = 'none'; // 默认隐藏子目录
                    const filteredChildren = item.children.filter(subItem =>
                        subItem.type === 'directory' ||
                        /\.(py|js|java|html|css)$/i.test(subItem.name)
                    );
                    filteredChildren.forEach(subItem => {
                        const subLi = document.createElement('li');
                        const subFullPath = `${fullPath}/${subItem.name}`;
                        subLi.innerHTML = `<span class="${subItem.type}" data-path="${subFullPath}">${subItem.name}</span>`;
                        subUl.appendChild(subLi);
                    });
                    if (filteredChildren.length > 0) {
                        li.appendChild(subUl);
                        li.querySelector('.folder').addEventListener('click', (e) => {
                            e.stopPropagation();
                            subUl.style.display = subUl.style.display === 'none' ? 'block' : 'none';
                        });
                    }
                }
            } else if (/\.(py|js|java|html|css)$/i.test(item.name)) {
                li.innerHTML = `<span class="file" data-path="${fullPath}">${item.name}</span>`;
            } else {
                return; // 跳过不符合条件的文件
            }
            ul.appendChild(li);
        });
        fileTree.appendChild(ul);
    }

    refreshTreeButton.addEventListener('click', loadFileTree);

    // 文件树点击事件
    fileTree.addEventListener('click', async (event) => {
        if (event.target.classList.contains('file')) {
            const filePath = event.target.getAttribute('data-path');
            try {
                const response = await fetch(`/api/file_content?path=${encodeURIComponent(filePath)}`);
                if (!response.ok) {
                    throw new Error('无法加载文件内容');
                }
                const data = await response.json();
                const content = data.content;
                userInput.value = `${filePath}:\n\`\`\`\n${content}\n\`\`\`\n` + userInput.value;
                adjustTextareaHeight();

                // 将光标移动到输入框的末尾
                userInput.focus();
                userInput.setSelectionRange(userInput.value.length, userInput.value.length);
            } catch (error) {
                console.error('加载文件内容时出错:', error);
                userInput.value = '加载文件内容时出错';
            }
        }
    });

    // 调整文本框高度函数
    function adjustTextareaHeight() {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    }

    // 初始化文件树
    loadFileTree();
    const setRootPathButton = document.getElementById('set-root-path-button');

    // 设置根目录的事件监听器
    setRootPathButton.addEventListener('click', () => {
        const newRootPath = prompt('请输入新的根目录路径:', '');
        if (newRootPath) {
            // 向服务器发送请求以更新根目录
            updateRootDirectory(newRootPath);
        }
    });
    
    // 更新根目录的函数
    async function updateRootDirectory(newPath) {
        try {
            const response = await fetch('/api/set_root_directory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: newPath }),
            });
    
            if (!response.ok) {
                throw new Error('无法设置根目录');
            }
    
            // 重新加载文件树
            loadFileTree();
        } catch (error) {
            console.error('设置根目录时出错:', error);
            alert('设置根目录时出错: ' + error.message);
        }
    }

});