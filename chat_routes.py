from flask import Blueprint, request, Response, jsonify
import llm, agent.graphrag
from flask import stream_with_context
import sqlite3
from sqlite3 import Error
from agent.agent_factory import create_agent

chat_blueprint = Blueprint('chat_routes', __name__)


def get_model_type(model_id):
    try:
        conn = sqlite3.connect('models.db')
        c = conn.cursor()
        c.execute('SELECT type FROM models WHERE id = ?', (model_id,))
        result = c.fetchone()
        conn.close()
        return result[0] if result else None
    except Error as e:
        print(f"Database error: {e}")
        return None

@chat_blueprint.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data.get('prompt', '')
    model = data.get('model', 'C35')

    model_type = get_model_type(model)

    def generate():
        if model_type == 'ollama':
            generator = llm.generate_ollama(prompt, model)
        elif model_type == 'claude' or model == 'C35':
            generator = llm.generateC35(prompt)
        elif model_type == 'openai':
            generator = llm.generate(prompt, model=model)
        else:
            yield "错误：未知的模型类型。"
            return

        for chunk in generator:
            if chunk is not None:
                yield chunk
            else:
                yield "发生错误，无法生成响应。"

    return Response(stream_with_context(generate()), content_type='text/plain')


@chat_blueprint.route('/api/chat/agent', methods=['POST'])
def chat_agent():
    data = request.json
    prompt = data.get('prompt', '')
    agent_type = data.get('agent_type', 'graphrag')  # 默认使用 graphrag
    
    try:
        agent = create_agent(agent_type)
        last_message = get_last_user_message(prompt)
        if not last_message:
            return jsonify({"error": "No valid user message found in the prompt"}), 400
        
        response = agent.chat(last_message)
        return jsonify({"response": response})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500