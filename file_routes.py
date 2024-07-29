import os
import chardet
from flask import Blueprint, jsonify, request

file_blueprint = Blueprint('file_routes', __name__)

# 存储当前根目录
current_root_directory = os.path.abspath(os.path.dirname(__file__))

# 获取文件树结构
@file_blueprint.route('/api/file_tree')
def get_file_tree():
    global current_root_directory

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

    file_tree = build_tree(current_root_directory)
    return jsonify(file_tree)

# 获取文件内容
@file_blueprint.route('/api/file_content')
def get_file_content():
    file_path = request.args.get('path', '')
    print(f"Requested file path: {file_path}")  # 调试日志
    abs_path = os.path.abspath(os.path.join(current_root_directory, file_path))

    if not abs_path.startswith(current_root_directory):
        print("Access denied for path: ", abs_path)  # 调试日志
        return jsonify({"error": "Access denied"}), 403

    if os.path.isfile(abs_path):
        try:
            with open(abs_path, 'rb') as file:
                raw_data = file.read()
                detected = chardet.detect(raw_data)
                encoding = detected['encoding']
                print(f"Detected encoding: {encoding}")  # 调试日志

            # 尝试使用 UTF-8 编码读取文件
            with open(abs_path, 'r', encoding='utf-8') as file:
                content = file.read()
                return jsonify({"content": content})
        except Exception as e:
            print(f"Error reading file: {str(e)}")  # 调试日志
            return jsonify({"error": str(e)}), 500
    else:
        print("File not found: ", abs_path)  # 调试日志
        return jsonify({"error": "File not found"}), 404

# 设置根目录
@file_blueprint.route('/api/set_root_directory', methods=['POST'])
def set_root_directory():
    global current_root_directory
    data = request.get_json()
    new_path = data.get('path', '')

    # 处理 ~ 作为用户主目录的替代
    if new_path.startswith('~'):
        new_path = os.path.expanduser(new_path)

    if os.path.isdir(new_path):
        current_root_directory = os.path.abspath(new_path)
        return jsonify({"message": "根目录已更新"}), 200
    else:
        return jsonify({"error": "无效的路径"}), 400
