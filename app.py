from flask import Flask, render_template, request, redirect, url_for, session
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def upload():
    return render_template('upload.html')

# Function này là để upload ảnh nha
# Lúc chạy trên máy mà thấy không upload ảnh được
# thì tạo thêm thư mục static/uploads rồi restart app
@app.route('/upload', methods=['POST'])
def handle_upload():
    if 'image' not in request.files:
        return redirect(url_for('upload'))
    
    file = request.files['image']
    if file.filename == '':
        return redirect(url_for('upload'))
    
    if file:
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        session['uploaded_image'] = filename
        return redirect(url_for('review'))
    
    return redirect(url_for('upload'))

# Đây là function cho trang review/fix CV
@app.route('/review')
def review():
    image_filename = session.get('uploaded_image', None)
    if not image_filename:
        return redirect(url_for('upload'))
    
    text_content = "This is placeholder text. Choose 'Review' or 'Fix' to update."
    
    return render_template('review.html', 
                         image_filename=image_filename,
                         text_content=text_content)

# Function này chạy khi mình bấm nút Review
@app.route('/review-action', methods=['POST'])
def review_action():

    # Chỗ này chắc là gọi LLM API để review CV rồi trả về text
    # Có gì mn tạo thêm 1 file python riêng để làm phần gọi LLM rồi trả text output vô đây
    # Set cái text_content này thành cái output của LLM
    text_content = "dhjfkbsdfkjhgbsdkjhgbsdkfjhg"
    image_filename = session.get('uploaded_image', None)
    
    return render_template('review.html',
                         image_filename=image_filename,
                         text_content=text_content)

# Function này chạy khi mình bấm nút Fix
@app.route('/fix-action', methods=['POST'])
def fix_action():

    # Tương tự cũng gọi LLM API ở chỗ này
    text_content = "ksdzjbfvs,djhfbsd,jfh"
    image_filename = session.get('uploaded_image', None)
    
    return render_template('review.html',
                         image_filename=image_filename,
                         text_content=text_content)

# Chỗ ni khi nào code xong final rồi thì nhớ xoá debug=True :D
if __name__ == '__main__':
    app.run(debug=True)
