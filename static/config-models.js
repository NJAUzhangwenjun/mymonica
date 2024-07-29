// 获取模型列表并显示
function fetchModels() {
    fetch('/api/models')
        .then(response => response.json())
        .then(models => {
            const tbody = document.getElementById('model-table').querySelector('tbody');
            tbody.innerHTML = ''; // 清空现有内容

            models.forEach(model => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${model.id}</td>
                    <td>${model.name}</td>
                    <td>${model.stream}</td>
                    <td>${model.type}</td>
                    <td>
                        <button onclick="editModel('${model.id}')">编辑</button>
                        <button onclick="deleteModel('${model.id}')">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('获取模型列表时发生错误:', error));
}

// 添加或编辑模型
document.getElementById('model-form').addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表单提交的默认行为

    const editMode = document.getElementById('edit-mode').value;
    const id = document.getElementById('model-id').value;
    const name = document.getElementById('model-name').value;
    const stream = document.getElementById('model-stream').value === 'true';
    const type = document.getElementById('model-type').value;

    const method = editMode === 'edit' ? 'PUT' : 'POST';
    const url = '/api/models';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, stream, type }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        fetchModels(); // 重新获取模型列表
        resetForm(); // 重置表单
    })
    .catch(error => console.error('操作模型时发生错误:', error));
});

// 删除模型
function deleteModel(id) {
    fetch('/api/models', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'delete', id: id }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        fetchModels(); // 重新获取模型列表
    })
    .catch(error => console.error('删除模型时发生错误:', error));
}

// 编辑模型
function editModel(id) {
    fetch('/api/models')
        .then(response => response.json())
        .then(models => {
            const model = models.find(m => m.id === id);
            if (model) {
                document.getElementById('edit-mode').value = 'edit';
                document.getElementById('model-id').value = model.id;
                document.getElementById('model-name').value = model.name;
                document.getElementById('model-stream').value = model.stream;
                document.getElementById('model-type').value = model.type;
                document.getElementById('form-title').textContent = '编辑模型';
                document.getElementById('submit-btn').textContent = '保存修改';
            }
        })
        .catch(error => console.error('获取模型详情时发生错误:', error));
}

// 重置表单
function resetForm() {
    document.getElementById('model-form').reset();
    document.getElementById('edit-mode').value = 'add';
    document.getElementById('form-title').textContent = '添加模型';
    document.getElementById('submit-btn').textContent = '添加模型';
}

// 初始化时获取模型
fetchModels();
