from flask import Flask, request, jsonify, Response, send_from_directory
import os
from file_routes import file_blueprint
from chat_routes import chat_blueprint  # 新增导入 chat_routes
from model_routes import model_blueprint

app = Flask(__name__, static_folder='static')

# 注册文件路由蓝图
app.register_blueprint(file_blueprint)

app.register_blueprint(model_blueprint)

# 注册聊天路由蓝图
app.register_blueprint(chat_blueprint)  # 注册聊天蓝图

# 静态文件服务
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return 'Not found', 404

# 后端 API 服务示例
@app.route('/api/hello')
def hello():
    return jsonify({"message": "Hello from the backend!"})

@app.route('/api/echo/<string:message>')
def echo(message):
    return jsonify({"echo": message})

if __name__ == '__main__':
    app.run(debug=True)