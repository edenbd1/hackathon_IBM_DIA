from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import tiktoken
import time
import os

app = Flask(__name__)

# Initialize OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

# Available models
MODELES_DISPONIBLES = [
    "google/gemini-2.0-flash-001",
    "meta-llama/llama-3.1-70b-instruct",
    "openai/gpt-4.1-nano",
    "google/gemini-2.5-flash",
    "anthropic/claude-3-haiku",
    "openai/gpt-4-turbo",
    "anthropic/claude-3.5-sonnet"
]

def count_tokens(text: str, model: str = "gpt-4") -> int:
    """Count the number of tokens in a text."""
    try:
        encoding = tiktoken.encoding_for_model(model)
        tokens = encoding.encode(text)
        return len(tokens)
    except:
        # Fallback for non-OpenAI models
        return len(text.split())  # Simple word count as fallback

@app.route('/')
def home():
    return render_template('index.html', models=MODELES_DISPONIBLES)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    model = data.get('model', 'google/gemini-2.5-flash')
    prompt = data.get('prompt', '')
    temperature = float(data.get('temperature', 0.7))

    try:
        start_time = time.time()
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature
        )
        end_time = time.time()

        response_text = response.choices[0].message.content
        token_count = count_tokens(response_text)
        duration = end_time - start_time

        return jsonify({
            'success': True,
            'response': response_text,
            'tokens': token_count,
            'duration': duration,
            'model': model
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
