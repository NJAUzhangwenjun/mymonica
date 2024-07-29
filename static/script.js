function addMessage(content, isUser, chatMessages, conversationHistory) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');

    if (isUser) {
        messageElement.innerHTML = textToHtml(content);
    } else {
        const parsedContent = marked.parse(content);
        messageElement.innerHTML = parsedContent;

        messageElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    conversationHistory.push(isUser ? `user:${content}` : `assistant:${content}`);
    return messageElement;
}

function textToHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
}

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat-button');
    const modelSelect = document.getElementById('model-select');
    

    let conversationHistory = [];

    // 初始化 Mermaid
    mermaid.initialize({ startOnLoad: false });


    
    function addCopyButtons() {
        document.querySelectorAll('pre').forEach((pre) => {
            if (!pre.querySelector('.copy-button')) {
                const copyButton = document.createElement('button');
                copyButton.textContent = '复制';
                copyButton.className = 'copy-button';
                copyButton.addEventListener('click', () => copyCode(pre));
                pre.appendChild(copyButton);
    
                // 检查是否为 Mermaid、PlantUML 或 HTML 代码
                const codeElement = pre.querySelector('code');
                if (codeElement) {
                    if (codeElement.className.includes('language-mermaid')) {
                        addRenderButton(pre, 'mermaid');
                    } else if (codeElement.className.includes('language-plantuml')) {
                        addRenderButton(pre, 'plantuml');
                    } else if (codeElement.className.includes('language-html')) {
                        addRenderButton(pre, 'html');
                    }
                }
            }
        });
    }

    function toggleRender(pre, type) {
        const renderButton = pre.querySelector('.render-button');
        const codeElement = pre.querySelector('code');
        const code = codeElement.textContent;
    
        if (renderButton.textContent === '渲染') {
            // 创建一个新的 div 来放置渲染后的内容
            const renderDiv = document.createElement('div');
            renderDiv.className = `${type}-render`;
            
            // 隐藏代码，显示渲染内容
            codeElement.style.display = 'none';
            pre.insertBefore(renderDiv, codeElement);
            
            if (type === 'mermaid') {
                renderDiv.textContent = code;
                mermaid.init(undefined, renderDiv);
            } else if (type === 'plantuml') {
                renderPlantUML(code, renderDiv);
            } else if (type === 'html') {
                renderHTML(code, renderDiv);
            }
            
            renderButton.textContent = '代码';
        } else {
            // 移除渲染的内容，显示代码
            const renderDiv = pre.querySelector(`.${type}-render`);
            if (renderDiv) {
                pre.removeChild(renderDiv);
            }
            codeElement.style.display = 'block';
            renderButton.textContent = '渲染';
        }
    }

    function addRenderButton(pre, type) {
        const renderButton = document.createElement('button');
        renderButton.textContent = '渲染';
        renderButton.className = 'render-button';
        renderButton.addEventListener('click', () => toggleRender(pre, type));
        pre.appendChild(renderButton);
    }

    function renderHTML(code, container) {
        // 创建一个 iframe 来安全地渲染 HTML
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        container.appendChild(iframe);
    
        // 将 HTML 写入 iframe
        iframe.contentDocument.open();
        iframe.contentDocument.write(code);
        iframe.contentDocument.close();
    
        // 调整 iframe 高度以适应内容
        iframe.onload = function() {
            iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
        };
    }

    function renderPlantUML(code, container) {
        const encoded = plantumlEncoder.encode(code);
        const url = `http://www.plantuml.com/plantuml/img/${encoded}`;
        const img = document.createElement('img');
        img.src = url;
        container.appendChild(img);
    }
    
    function toggleMermaidRender(pre) {
        const renderButton = pre.querySelector('.render-button');
        const codeElement = pre.querySelector('code');
        const mermaidCode = codeElement.textContent;
    
        if (renderButton.textContent === '渲染') {
            // 创建一个新的 div 来放置渲染后的图表
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid-diagram';
            mermaidDiv.textContent = mermaidCode;
            
            // 隐藏代码，显示图表
            codeElement.style.display = 'none';
            pre.insertBefore(mermaidDiv, codeElement);
            
            // 渲染 Mermaid 图表
            mermaid.init(undefined, mermaidDiv);
            
            renderButton.textContent = '代码';
        } else {
            // 移除渲染的图表，显示代码
            const mermaidDiv = pre.querySelector('.mermaid-diagram');
            if (mermaidDiv) {
                pre.removeChild(mermaidDiv);
            }
            codeElement.style.display = 'block';
            renderButton.textContent = '渲染';
        }
    }
    
    function copyCode(pre) {
        const codeElement = pre.querySelector('code');
        const code = codeElement ? codeElement.textContent : pre.textContent;
    
        navigator.clipboard.writeText(code).then(() => {
            const button = pre.querySelector('.copy-button');
            button.textContent = '已复制!';
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        }).catch(err => {
            console.error('无法复制代码: ', err);
        });
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                addCopyButtons();
            }
        });
    });

    observer.observe(chatMessages, { childList: true, subtree: true });



    

   async function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true, chatMessages, conversationHistory);
            userInput.value = '';
            adjustTextareaHeight(); // 重置文本框高度
    
            const prompt = conversationHistory.join('\n');
            const selectedModelOption = document.getElementById('model-select').selectedOptions[0];
            const selectedModel = selectedModelOption.value;
            const isStreamSupported = selectedModelOption.dataset.stream === 'true';
            const agentType = selectedModelOption.dataset.agentType;
            const isAgent = agentType === 'agent';

    
            try {
                let response;
                let botMessageElement;
                
                if (isAgent) {
                    if(!isStreamSupported){
                        // 使用 agent 接口
                        response = await fetch('/api/chat/agent', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                prompt: prompt,
                                agent_type: agentType
                            }),
                        });
        
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
        
                        const data = await response.json();
                        botMessageElement = addMessage('', false,chatMessages, conversationHistory);
                        botMessageElement.innerHTML = marked.parse(data.response);
                        conversationHistory.push(`assistant:${data.response}`);
                    }
                } else {
                    // 使用流式接口
                    response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            prompt: prompt,
                            model: selectedModel
                        }),
                    });
    
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
    
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    botMessageElement = addMessage('', false,  chatMessages, conversationHistory);
                    let fullResponse = '';
    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
    
                        const chunk = decoder.decode(value);
                        fullResponse += chunk;
                        botMessageElement.innerHTML = marked.parse(fullResponse);
                        botMessageElement.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightElement(block);
                        });
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
    
                    conversationHistory.push(`assistant:${fullResponse}`);
                }
    
                // 对所有模型都应用代码高亮
                botMessageElement.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
    
            } catch (error) {
                console.error('Error:', error);
                addMessage('抱歉，发生了错误。请稍后再试。', false, chatMessages, conversationHistory);
            }
        }
    }



    function startNewChat() {
        conversationHistory = [];
        chatMessages.innerHTML = '';
        addMessage('你好！我是 AI 助手。有什么我可以帮助你的吗？', false,chatMessages, conversationHistory);
    }

    sendButton.addEventListener('click', sendMessage);
    newChatButton.addEventListener('click', startNewChat);

    let isComposing = false;

    userInput.addEventListener('compositionstart', () => {
        isComposing = true;
    });
    
    userInput.addEventListener('compositionend', () => {
        isComposing = false;
    });
    
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (e.shiftKey || isComposing) {
                return;
            } else {
                e.preventDefault();
                sendMessage();
            }
        }
    });


    function adjustTextareaHeight() {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    }

    // 自动调整输入框高度
    userInput.addEventListener('input', adjustTextareaHeight);

    // 初始化时调整高度
    adjustTextareaHeight();

    // 模型选择事件
    modelSelect.addEventListener('change', function() {
        localStorage.setItem('selectedModel', this.value);
    });

    // 初始化聊天
    startNewChat();
});