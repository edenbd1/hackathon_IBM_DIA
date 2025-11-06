from flask import Flask, render_template, request, jsonify
from Generate import query
app = Flask(__name__, static_folder='static', template_folder='templates')

history = []  # Liste des messages { "question": ..., "answer": ... }

def generate_answer(question):
    return query(question)

@app.route('/', methods=['GET'])
def ask():
    return render_template('ask.html')

@app.route('/answer', methods=['POST'])
def answer():
    data = request.get_json()
    question = data.get("question", "").strip()
    if question:
        answer_text = generate_answer(question)
        history.append({ "question": question, "answer": answer_text })
        return jsonify({"question": question, "answer": answer_text, "history": history})
    return jsonify({"error": "Aucune question reçue"}), 400

if __name__ == '__main__':
    app.run(debug=True)
