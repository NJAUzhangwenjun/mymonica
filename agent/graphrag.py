import logging
import subprocess
import re
from .base_agent import BaseAgent

class GraphRAGAgent(BaseAgent):
    def chat(self, query, method='local'):
        # 验证 method 参数
        if method not in ['local', 'global']:
            raise ValueError("Method must be either 'local' or 'global'")
    
        # 设置日志
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
    
        # 构建命令
        command = f'python -m graphrag.query --root ./graphrag --method {method} "{query}"'
    
        try:
            # 执行命令行并捕获输出
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            
            # 将整个输出记录到日志
            logger.info(f"Command output:\n{result.stdout}")
    
            # 使用正则表达式提取响应，根据 method 参数调整搜索模式
            search_pattern = f'SUCCESS: {method.capitalize()} Search Response:(.*)'
            match = re.search(search_pattern, result.stdout, re.DOTALL | re.IGNORECASE)
            
            if match:
                # 提取匹配的文本并去除前后的空白字符
                extracted_text = match.group(1).strip()
                return extracted_text
            else:
                logger.warning(f"No 'SUCCESS: {method.capitalize()} Search Response:' found in the output.")
                return None
    
        except subprocess.CalledProcessError as e:
            logger.error(f"Command execution failed: {e}")
            logger.error(f"Error output:\n{e.stderr}")
            return None
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            return None