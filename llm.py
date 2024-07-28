import requests
import json
import uuid
import time
import subprocess
import re
import logging
import configparser

# 创建一个配置解析器
config = configparser.ConfigParser()

# 读取配置文件
config.read('config.ini')

# 常量定义
API_KEY = config['OPENAI']['key']  # 替换为您的实际 OpenAI API 密钥
BASE_URL = config['OPENAI']['base']
MAX_TOKENS = 10000
DEFAULT_MODEL = "gpt-4o-mini"
EMBEDDING_MODEL = "text-embedding-ada-002"  # OpenAI 最新的嵌入模型


def generate_ollama(prompt, model="mistral", temperature=0):
    url = "http://localhost:11434/api/generate"

    # 创建请求数据
    data = {
        "model": model,
        "prompt": prompt,
        "options": {
            "temperature": temperature
        },
        "stream": True  # 设置为 True 以支持流式响应
    }

    # 发送 POST 请求
    with requests.post(url, json=data, stream=True) as response:
        # 检查请求是否成功
        response.raise_for_status()
        
        # 处理流式响应
        for line in response.iter_lines():
            if line:
                # 解析响应内容（根据实际的 API 响应格式）
                decoded_line = line.decode('utf-8')
                try:
                    json_line = json.loads(decoded_line)
                    content = json_line.get('response')
                    # 根据实际的 API 结构提取所需信息
                    if content:
                        yield content
                except json.JSONDecodeError:
                    print(f"解码错误：{decoded_line}")

def generateC35(prompt, max_retries=5):
    # API 密钥
    api_key = API_KEY
    # API 端点
    url = f"{BASE_URL}/chat/completions"
    # 请求头
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01"
    }
    # 请求体
    data = {
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": 4096,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "stream": True  # 启用流式输出
    }

    for attempt in range(max_retries):
        try:
            # 发送请求
            response = requests.post(url, headers=headers, json=data, stream=True)
            
            # 检查响应
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        line = line.decode('utf-8')
                        if line.startswith('data: '):
                            if line == 'data: [DONE]':
                                break
                            json_str = line[6:]  # 移除 'data: ' 前缀
                            try:
                                chunk = json.loads(json_str)
                                content = chunk['choices'][0]['delta'].get('content', '')
                                if content:
                                    yield content
                            except json.JSONDecodeError:
                                print(f"无法解析JSON: {json_str}")
                return
            else:
                print(f"尝试 {attempt + 1} 失败。状态码: {response.status_code}")
                if attempt < max_retries - 1:
                    time.sleep(2)  # 等待2秒后重试
                else:
                    yield f"在 {max_retries} 次尝试后出错: {response.status_code}\n{response.text}"
        except requests.exceptions.RequestException as e:
            print(f"尝试 {attempt + 1} 失败。错误: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(2)  # 等待2秒后重试
            else:
                yield f"在 {max_retries} 次尝试后发生错误: {str(e)}"
    
    yield "达到最大重试次数。无法获得成功响应。"


def generate(prompt, model=DEFAULT_MODEL):
    """
    使用 HTTP 方式调用 OpenAI API 生成流式响应。

    参数:
    prompt (str): 要发送给 AI 的提示文本
    model (str): 要使用的 OpenAI 模型，默认为 DEFAULT_MODEL

    返回:
    generator: 生成器对象，用于逐步获取响应
    """
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": MAX_TOKENS,
        "stream": True  # 启用流式响应
    }
    
    try:
        response = requests.post(f"{BASE_URL}/chat/completions", 
                                 headers=headers, 
                                 json=data, 
                                 stream=True)
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    if line == 'data: [DONE]':
                        break
                    json_str = line[6:]  # Remove 'data: ' prefix
                    try:
                        chunk = json.loads(json_str)
                        content = chunk['choices'][0]['delta'].get('content', '')
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        print(f"无法解析JSON: {json_str}")
    
    except requests.exceptions.RequestException as e:
        print(f"发生错误: {e}")
        yield None

def get_embedding(text):
    """
    使用 HTTP 方式调用 OpenAI API 生成文本的嵌入向量。

    参数:
    text (str): 要生成嵌入的文本

    返回:
    list: 文本的嵌入向量
    """
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    data = {
        "model": EMBEDDING_MODEL,
        "input": text
    }
    
    try:
        response = requests.post(f"{BASE_URL}/embeddings", headers=headers, data=json.dumps(data))
        response.raise_for_status()  # 如果请求不成功，这将引发一个异常
        
        result = response.json()
        return result['data'][0]['embedding']
    
    except requests.exceptions.RequestException as e:
        print(f"发生错误: {e}")
        return None

# 使用示例
if __name__ == "__main__":
    # 测试 generate 函数
    prompt = "你好，请告诉我今天的日期。"
    response = generateC35(prompt)
    if response:
        print("AI 响应:", response)
    else:
        print("无法获取 AI 响应")

    # 测试 get_embedding 函数
    text = "Hello, World!"
    embedding = get_embedding(text)
    if embedding:
        print(f"'{text}' 的嵌入向量 (前5个元素):", embedding[:5])
    else:
        print("无法获取嵌入向量")