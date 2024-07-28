from flask import Blueprint, request, Response, jsonify
import llm, agent.graphrag
from flask import stream_with_context
import sqlite3
from sqlite3 import Error

chat_blueprint = Blueprint('chat_routes', __name__)


# 获取模型列表的新路由
@chat_blueprint.route('/api/models', methods=['GET'])
def get_models():
  try:
      conn = sqlite3.connect('models.db')
      c = conn.cursor()
      c.execute('SELECT id, name, stream FROM models')
      models = [{'id': row[0], 'name': row[1], 'stream': bool(row[2])} for row in c.fetchall()]
      conn.close()
      return jsonify(models)
  except Error as e:
      print(e)
      return jsonify({"error": "无法获取模型列表"}), 500

# 聊天接口（流式）
@chat_blueprint.route('/api/chat', methods=['POST'])
def chat():
  data = request.json
  prompt = data.get('prompt', '')
  model = data.get('model', 'C35')

  def generate():
      if model.startswith('ollama/'):
          model_value = model.split('ollama/')[1]  # 提取ollama/后的值
          generator = llm.generate_ollama(prompt, model_value)
      elif model == 'C35':
          generator = llm.generateC35(prompt)
      else:
          generator = llm.generate(prompt, model=model)

      for chunk in generator:
          if chunk is not None:
              yield chunk
          else:
              yield "发生错误，无法生成响应。"

  return Response(stream_with_context(generate()), content_type='text/plain')

# graphrag 非流式聊天接口
@chat_blueprint.route('/api/chat/graphrag', methods=['POST'])
def chat_graphrag():
  data = request.json
  prompt = data.get('prompt', '')
  
  def get_last_user_message(prompt):
      lines = prompt.strip().split('\n')
      for line in reversed(lines):
          if line.strip():
              return line.strip()
      return ""

  try:
      last_message = get_last_user_message(prompt)
      if not last_message:
          return jsonify({"error": "No valid user message found in the prompt"}), 400
      
      response = agent.graphrag.chat(last_message)
      return jsonify({"response": response})
  except Exception as e:
      return jsonify({"error": str(e)}), 500