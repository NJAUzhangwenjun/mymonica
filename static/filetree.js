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
                    item.children.forEach(subItem => {
                        const subLi = document.createElement('li');
                        const subFullPath = `${fullPath}/${subItem.name}`;
                        subLi.innerHTML = `<span class="${subItem.type}" data-path="${subFullPath}">${subItem.name}</span>`;
                        subUl.appendChild(subLi);
                    });
                    li.appendChild(subUl);
                    li.querySelector('.folder').addEventListener('click', (e) => {
                        e.stopPropagation();
                        subUl.style.display = subUl.style.display === 'none' ? 'block' : 'none';
                    });
                }
            } else {
                li.innerHTML = `<span class="file" data-path="${fullPath}">${item.name}</span>`;
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
            addFileContentToContext(filePath);
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

    // 修改上下文菜单的事件监听器
    fileTree.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // 阻止默认右键菜单

        const fileElement = event.target.closest('.file');
        const folderElement = event.target.closest('.folder');
        
        if (fileElement || folderElement) {
            const path = fileElement ? fileElement.getAttribute('data-path') : folderElement.getAttribute('data-path');
            showContextMenu(event.pageX, event.pageY, path, fileElement ? 'file' : 'folder');
        } else {
            // 如果点击的是空白区域，不显示菜单
            hideContextMenu();
        }
    });
    // 创建上下文菜单
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
        <div id="edit-option">编辑</div>
        <div id="add-to-context-option">添加为上下文</div>
        <div id="delete-option">删除</div>
        <div id="create-option">创建</div>
    `;
    document.body.appendChild(contextMenu);

    // 修改显示上下文菜单的函数
    function showContextMenu(x, y, path, type) {
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';

        const createOption = document.getElementById('create-option');
        const editOption = document.getElementById('edit-option');
        const deleteOption = document.getElementById('delete-option');
        const addToContextOption = document.getElementById('add-to-context-option');

        createOption.style.display = 'block';
        createOption.onclick = () => {
            hideContextMenu();
            createNewFile(path, type);
        };

        if (type === 'file') {
            editOption.style.display = 'block';
            deleteOption.style.display = 'block';
            editOption.onclick = () => {
                hideContextMenu();
                openEditPage(path);
            };
            deleteOption.onclick = () => {
                hideContextMenu();
                deleteFile(path);
            };
           addToContextOption.style.display = 'block';
           addToContextOption.onclick = () => {
              hideContextMenu();
              addFileContentToContext(path);
           };
        } else {
            editOption.style.display = 'none';
            deleteOption.style.display = 'none';
            addToContextOption.style.display = 'none';
        }
    }

    // 隐藏上下文菜单
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    // 处理点击空白区域时隐藏菜单
    window.addEventListener('click', hideContextMenu);

    function openEditPage(filePath) {
        const editorDrawer = document.getElementById('editor-drawer');
        const editorFrame = document.getElementById('editor-frame');

        editorFrame.src = `editor.html?path=${encodeURIComponent(filePath)}`;
        editorDrawer.classList.add('open');
    }

    window.addEventListener('message', (event) => {
        if (event.data === 'closeEditor') {
            document.getElementById('editor-drawer').classList.remove('open');
        }
    });


    // 删除文件（示例逻辑）
    async function deleteFile(filePath) {
        if (confirm(`确定要删除文件 ${filePath} 吗？`)) {
            try {
                const response = await fetch(`/api/delete_file?path=${encodeURIComponent(filePath)}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('删除文件失败');
                }
                loadFileTree(); // 重新加载文件树
            } catch (error) {
                console.error('删除文件时出错:', error);
                alert('删除文件时出错: ' + error.message);
            }
        }
    }
      // 添加创建新文件的函数
    async function createNewFile(parentPath, parentType) {
        const fileName = prompt("请输入新文件名:", "");
        if (fileName) {
            let fullPath;
            if (parentType === 'folder') {
                fullPath = `${parentPath}/${fileName}`;
            } else {
                // 如果父级是文件，我们需要获取其所在的目录
                const lastSlashIndex = parentPath.lastIndexOf('/');
                const parentDir = parentPath.substring(0, lastSlashIndex);
                fullPath = `${parentDir}/${fileName}`;
            }

            try {
                const response = await fetch('/api/create_file', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: fullPath }),
                });

                if (!response.ok) {
                    throw new Error('创建文件失败');
                }

                loadFileTree(); // 重新加载文件树
            } catch (error) {
                console.error('创建文件时出错:', error);
                alert('创建文件时出错: ' + error.message);
            }
        }
    }
  
    async function addFileContentToContext(filePath) {
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