# MyMonica: 智能编码助手

MyMonica 是一个强大的AI驱动的编码助手，基于Flask构建，集成了多种先进的语言模型，并提供了直观的文件管理功能。它旨在成为开发者的得力助手，提高编码效率，解答技术难题。

![MyMonica 界面预览](https://github.com/user-attachments/assets/482e3a29-66c8-4cda-bebc-5f988862e8e7)

## 🌟 主要特性

- **多模型支持**: 集成OpenAI的GPT系列、Ollama本地模型和自定义的GraphRAG模型，满足不同场景需求。
- **实时对话**: 支持流式输出，提供即时响应，让交互更自然流畅。
- **智能文件管理**: 
  - 文件树结构可视化
  - 一键读取文件内容并插入对话
  - 支持多种编程语言文件(.py, .js, .java, .html, .css)
- **代码增强**:
  - 自动语法高亮
  - 支持Mermaid图表、PlantUML和HTML的实时渲染
  - 一键复制代码块
- **用户友好界面**:
  - 响应式设计，适配各种设备
  - 简洁明了的对话界面
  - 便捷的模型切换功能
## 🚀 快速开始

### 前置要求

- Python 3.7+
- pip

### 安装步骤

1. 克隆仓库:
```shell
git clone https://github.com/your-username/mymonica.git
cd mymonica
```

2. 安装依赖:
```shell
pip install -r requirements.txt
```

3. 配置API密钥:
创建 `config.ini` 文件并添加您的OpenAI API密钥:
```ini
[OPENAI]
key = your_openai_api_key_here
base = https://api.openai.com/v1
```
初始化数据库
```shell
python init_db.py
```
启动服务器:
```shell
python server.py
```
访问 http://localhost:5000 开始使用MyMonica!


## 💡 使用指南
- 选择模型: 使用界面底部的下拉菜单选择合适的AI模型。
- 浏览文件: 左侧文件树支持展开/折叠目录，点击文件名将内容插入对话框。
- 发送消息: 在底部输入框中输入您的问题或代码，点击发送或按Enter键。
- 查看响应: AI的回答将实时显示在对话区域，包括代码、图表等。
- 代码操作:
  - 使用"复制"按钮快速复制代码块。
  - 对于Mermaid、PlantUML和HTML代码，可以使用"渲染"按钮查看可视化结果。
- 开始新对话: 点击左下角的"+"图标开始新的对话。

