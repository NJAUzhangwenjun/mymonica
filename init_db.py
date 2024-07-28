import sqlite3

# 数据库初始化函数
def init_db():
  conn = sqlite3.connect('models.db')
  c = conn.cursor()
  c.execute('''CREATE TABLE IF NOT EXISTS models
               (id TEXT PRIMARY KEY, name TEXT, stream BOOLEAN)''')
  
  # 插入初始数据
  models = [
      ('C35', 'C35', True),
      ('gpt-4o-mini', 'GPT-4O Mini', True),
      ('gpt-4o', 'GPT-4O', True),
      ('ollama/gemma2', 'Ollama Gemma 2', True),
      ('ollama/mistral', 'Ollama Mistral', True),
      ('ollama/mistral-nemo', 'Ollama Mistral Nemo', True),
      ('graphrag', 'GraphRAG', False)
  ]
  c.executemany('INSERT OR REPLACE INTO models VALUES (?, ?, ?)', models)
  conn.commit()
  conn.close()

# 调用数据库初始化函数
init_db()