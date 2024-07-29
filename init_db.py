import sqlite3

# 数据库初始化函数1
def init_db():
    conn = sqlite3.connect('models.db')
    c = conn.cursor()
    
    # 删除旧表(如果存在)
    c.execute('DROP TABLE IF EXISTS models')
    
    # 创建新表,包含 type 字段
    c.execute('''CREATE TABLE models
                 (id TEXT PRIMARY KEY, name TEXT, stream BOOLEAN, type TEXT)''')
    
    # 插入初始数据,包含 type 信息
    models = [
        ('claude-3-5-sonnet-20240620', 'Claude3.5', True, 'openai'),
        ('gpt-4o-2024-05-13', 'GPT-4O', True, 'openai'),
        ('ollama/gemma2', 'Ollama Gemma 2', True, 'ollama'),
        ('ollama/mistral-nemo', 'Ollama Mistral Nemo', True, 'ollama'),
        ('graphrag', 'GraphRAG', False, 'agent')  # 假设 GraphRAG 是 OpenAI 类型,如果不是请修改
    ]
    c.executemany('INSERT INTO models VALUES (?, ?, ?, ?)', models)
    conn.commit()
    conn.close()

# 调用数据库初始化函数
init_db()
