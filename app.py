from flask import Flask, request, jsonify
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import torch
import io
import base64

app = Flask(__name__)
CORS(app)

model_id = "runwayml/stable-diffusion-v1-5"

# Load the base model with safety checker disabled (Fixes black image bug)
pipe = StableDiffusionPipeline.from_pretrained(
    model_id, 
    torch_dtype=torch.float32,
    safety_checker=None,              
    requires_safety_checker=False
)

# Mac optimization
if torch.cuda.is_available():
    pipe = pipe.to("cuda")
elif torch.backends.mps.is_available():
    pipe = pipe.to("mps") 
    pipe.enable_attention_slicing() 

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    # Generate image
    image = pipe(prompt).images[0]

    # Convert to base64
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return jsonify({'image': img_str})

if __name__ == '__main__':
    app.run(debug=True, port=5001)