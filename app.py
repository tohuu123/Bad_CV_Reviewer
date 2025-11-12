from flask import Flask, render_template, request, redirect, url_for, session
import os
from LLM import analyze_cv
from pdf2image import convert_from_path

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

        # Check if the file is a PDF and convert it to image for display
        if filename.lower().endswith('.pdf'):
            try:
                # Convert PDF to images
                images = convert_from_path(filepath)
                if images:
                    # Save the first page as PNG for display
                    image_filename = os.path.splitext(filename)[0] + '.png'
                    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
                    images[0].save(image_path, 'PNG')
                    # Store both the original PDF and the display image
                    session['uploaded_image'] = image_filename  # For display
                    session['original_file'] = filename  # For LLM analysis
                else:
                    # If conversion fails, use the original PDF
                    session['uploaded_image'] = filename
                    session['original_file'] = filename
            except Exception as e:
                print(f"Error converting PDF: {e}")
                # If conversion fails, use the original PDF
                session['uploaded_image'] = filename
                session['original_file'] = filename
        else:
            # For non-PDF files, use the same filename for both display and analysis
            session['uploaded_image'] = filename
            session['original_file'] = filename
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
    image_filename = session.get('uploaded_image', None)
    original_file = session.get('original_file', None)
    
    if not image_filename or not original_file:
        return redirect(url_for('upload'))
    
    # Get the full path of the original file for LLM analysis
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], original_file)
    
    # Call LLM to analyze the CV in review mode
    text_content = analyze_cv(image_path)
    
    return render_template('review.html',
                         image_filename=image_filename,
                         text_content=text_content)

# Function này chạy khi mình bấm nút Fix
@app.route('/fix-action', methods=['POST'])
def fix_action():
    image_filename = session.get('uploaded_image', None)
    original_file = session.get('original_file', None)
    
    if not image_filename or not original_file:
        return redirect(url_for('upload'))
    
    # Get the full path of the original file for LLM analysis
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], original_file)
    
    # Call LLM to analyze the CV in fix mode
    text_content = analyze_cv(image_path)
    
    return render_template('review.html',
                         image_filename=image_filename,
                         text_content=text_content)

# Chỗ ni khi nào code xong final rồi thì nhớ xoá debug=True :D
if __name__ == '__main__':
    app.secret_key = 'super secret key'
    app.run(debug=True)
