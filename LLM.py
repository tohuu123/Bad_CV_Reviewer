import google.generativeai as genai
from dotenv import load_dotenv
import os
import mimetypes

load_dotenv()

# Configure the Gemini API with your API key
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

def load_prompt():
    """Load system prompt from file based on mode"""
    prompt_file = os.path.join(os.path.dirname(__file__), "prompt.txt")
    try:
        with open(prompt_file, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: Prompt file not found at {prompt_file}")
        return None
    except Exception as e:
        print(f"Error reading prompt file: {e}")
        return None

def analyze_cv(image_path):
    """
    Analyze CV using Gemini Vision API
    mode: "review" for general feedback, "fix" for specific improvements
    """
    try:
        # Load the prompt (in prompt.txt)
        prompt = load_prompt()
        if not prompt:
            return "Error: Could not load system prompt"

        # Create the model
        model = genai.GenerativeModel('gemini-2.5-pro')

        # Guess input image type format 
        mime_type, _ = mimetypes.guess_type(image_path)
        if mime_type is None:
            ext = os.path.splitext(image_path)[-1].lower()
            if ext == '.pdf':
                mime_type = 'application/pdf'
            elif ext in ['.jpg', '.jpeg']:
                mime_type = 'image/jpeg'
            elif ext == '.png':
                mime_type = 'image/png'
            elif ext == '.docx':
                mime_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            else:
                print(f"(!) Error: Could not guess the image type: {image_path}")
                return None
        # Reading image bytes
        try:
            with open(image_path, 'rb') as f:
                img_bytes = f.read()
        except Exception as e:
            print(f"(!) Error in reading file bytes: {e}")
            return None           
        # Generate content
        response = model.generate_content([
            prompt,
            {"mime_type":  mime_type, 
             "data": img_bytes}
        ])
        return response.text

    except Exception as e:
        return f"Error analyzing CV: {str(e)}"