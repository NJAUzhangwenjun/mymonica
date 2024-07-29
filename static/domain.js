document.addEventListener('DOMContentLoaded', () => {
    
    async function loadModelList() {
    	try {
    	  const response = await fetch('/api/models');
    	  if (!response.ok) {
    		throw new Error(`HTTP error! status: ${response.status}`);
    	  }
    	  const models = await response.json();
    	  const modelSelect = document.getElementById('model-select');
    	  modelSelect.innerHTML = ''; // 清空现有选项
    	  models.forEach(model => {
    		const option = document.createElement('option');
    		option.value = model.id;
    		option.textContent = model.name;
    		option.dataset.stream = model.stream; // 存储stream信息
            option.dataset.type = model.type;
    		modelSelect.appendChild(option);
    	  });
          let selectedModel = localStorage.getItem('selectedModel') || 'C35';
          document.getElementById('model-select').value = selectedModel;
    	} catch (error) {
    	  console.error('加载模型列表失败:', error);
    	  // 可以在这里添加用户友好的错误处理，比如显示一个错误消息
    	}
        
    }

    loadModelList();
});