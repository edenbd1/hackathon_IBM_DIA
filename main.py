from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__, static_folder='static', template_folder='templates')

history = []  # liste de dicts { "question": ..., "answer": ... }

@app.route('/', methods=['GET'])
def ask():
    return render_template('ask.html')

@app.route('/answer', methods=['POST'])
def answer():
    question = request.form.get("question", "").strip()
    if question:
        answer_text = f"Vous avez demandé : «{question}». Voici une réponse auto-générée."
        history.append({ "question": question, "answer": answer_text })
    return render_template('answer.html', history=history)

if __name__ == '__main__':
    app.run(debug=True)