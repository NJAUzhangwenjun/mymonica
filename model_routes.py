from flask import Blueprint, request, jsonify
import sqlite3
from sqlite3 import Error

model_blueprint = Blueprint('model_routes', __name__)

@model_blueprint.route('/api/models', methods=['GET', 'POST', 'PUT'])
def manage_models():
    if request.method == 'GET':
        # 处理 GET 请求：获取模型列表
        try:
            conn = sqlite3.connect('models.db')
            c = conn.cursor()
            c.execute('SELECT id, name, stream, type FROM models')
            models = [{'id': row[0], 'name': row[1], 'stream': bool(row[2]), 'type': row[3]} for row in c.fetchall()]
            conn.close()
            return jsonify(models)
        except Error as e:
            return jsonify({"error": "无法获取模型列表"}), 500

    elif request.method == 'POST':
        # 处理 POST 请求：添加或删除模型
        data = request.json
        action = data.get('action')

        if action == 'delete':
            model_id = data.get('id')
            # 删除模型
            try:
                conn = sqlite3.connect('models.db')
                c = conn.cursor()
                c.execute('DELETE FROM models WHERE id = ?', (model_id,))
                conn.commit()
                conn.close()
                return jsonify({"message": "模型删除成功"}), 200
            except Error as e:
                return jsonify({"error": str(e)}), 500
        else:
            # 添加模型
            model_id = data.get('id')
            name = data.get('name')
            stream = data.get('stream')
            model_type = data.get('type')

            try:
                conn = sqlite3.connect('models.db')
                c = conn.cursor()
                c.execute('INSERT OR REPLACE INTO models (id, name, stream, type) VALUES (?, ?, ?, ?)', 
                          (model_id, name, stream, model_type))
                conn.commit()
                conn.close()
                return jsonify({"message": "模型添加成功"}), 201
            except Error as e:
                return jsonify({"error": str(e)}), 500

    elif request.method == 'PUT':
        # 处理 PUT 请求：修改模型
        data = request.json
        model_id = data.get('id')
        new_id = data.get('new_id', model_id)
        name = data.get('name')
        stream = data.get('stream')
        model_type = data.get('type')

        try:
            conn = sqlite3.connect('models.db')
            c = conn.cursor()
            
            # 如果 ID 被修改,先删除原记录
            if model_id != new_id:
                c.execute('DELETE FROM models WHERE id = ?', (model_id,))
            
            c.execute('INSERT OR REPLACE INTO models (id, name, stream, type) VALUES (?, ?, ?, ?)', 
                      (new_id, name, stream, model_type))
            conn.commit()
            conn.close()
            return jsonify({"message": "模型更新成功"}), 200
        except Error as e:
            return jsonify({"error": str(e)}), 500
