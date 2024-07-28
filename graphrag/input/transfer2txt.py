import os
import argparse
import PyPDF2
from docx import Document
import subprocess

def pdf_to_txt(pdf_path, txt_path):
    with open(pdf_path, 'rb') as pdf_file:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text()
    
    with open(txt_path, 'w', encoding='utf-8') as txt_file:
        txt_file.write(text)

def docx_to_txt(docx_path, txt_path):
    doc = Document(docx_path)
    text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
    
    with open(txt_path, 'w', encoding='utf-8') as txt_file:
        txt_file.write(text)

def process_directory(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            file_path = os.path.join(dirpath, filename)
            file_name, file_ext = os.path.splitext(filename)
            txt_path = os.path.join(dirpath, file_name + '.txt')
            
            if file_ext.lower() == '.pdf':
                pdf_to_txt(file_path, txt_path)
                print(f"Converted {file_path} to {txt_path}")
            elif file_ext.lower() in ['.docx', '.doc']:
                docx_to_txt(file_path, txt_path)
                print(f"Converted {file_path} to {txt_path}")

def run_graphrag_index(root_dir):
    command = f"python -m graphrag.index --root {root_dir}"
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print("graphrag.index execution result:")
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print("Error executing graphrag.index:")
        print(e.stderr)

def main():
    # parser = argparse.ArgumentParser(description="Convert PDF and Word documents to TXT files and run graphrag.index.")
    # parser.add_argument('--root', type=str, default='.', help="Root directory to process")
    # args = parser.parse_args()

    # process_directory(args.root)
    
    # 运行 graphrag.index 命令
    run_graphrag_index("../")

if __name__ == "__main__":
    main()
