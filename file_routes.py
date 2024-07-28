from flask import Blueprint, jsonify, request  
import os
import chardet

file_blueprint = Blueprint('file_routes', __name__)

# 获取文件树结构
@file_blueprint.route('/api/file_tree')
def get_file_tree():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    
    def build_tree(path):
        tree = []
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                tree.append({
                    'name': item,
                    'type': 'directory',
                    'children': build_tree(item_path)
                })
            else:
                tree.append({
                    'name': item,
                    'type': 'file'
                })
        return tree

    file_tree = build_tree(root_dir)
    return jsonify(file_tree)

# 获取文件内容
@file_blueprint.route('/api/file_content')
def get_file_content():
    file_path = request.args.get('path', '')
    abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), file_path))
    
    if not abs_path.startswith(os.path.dirname(__file__)):
        return jsonify({"error": "Access denied"}), 403
    
    if os.path.isfile(abs_path):
        try:
            # 使用 chardet 检测文件编码
            with open(abs_path, 'rb') as file:
                raw_data = file.read()
            detected = chardet.detect(raw_data)
            encoding = detected['encoding']

            # 使用检测到的编码读取文件
            with open(abs_path, 'r', encoding=encoding) as file:
                content = file.read()
            return jsonify({"content": content})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "File not found"}), 404