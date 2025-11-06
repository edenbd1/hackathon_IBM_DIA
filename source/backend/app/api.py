import requests
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from dotenv import load_dotenv
import os

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

authenticator = IAMAuthenticator(os.getenv("WATSON_API_KEY", None))
project_id = os.getenv("PROJECT_ID", None)

# Obtenir l'access token depuis l'authenticator
access_token = authenticator.token_manager.get_token()

url = os.getenv("IBM_URL", None)

body = {
    "messages": [{"role":"system","content":"Par quelle lettre commence le prénom Grégoire. Répond avec une seule lettre."},{"role":"user","content":[{"type":"text","text":"bonjour"}]},{"role":"assistant","content":"### Hello\n**Welcome** to our conversation. I'm here to help with any questions or topics you'd like to discuss. \n\nPlease feel free to ask me anything, and I'll do my best to provide a helpful and informative response. \n\n### How can I assist you today?"}],
    "project_id": project_id,
    "model_id": "meta-llama/llama-3-3-70b-instruct",
    "frequency_penalty": 0,
    "max_tokens": 20,
    "presence_penalty": 0,
    "temperature": 0,
    "top_p": 1
}

headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer " + access_token
}

response = requests.post(
    url,
    headers=headers,
    json=body
)

if response.status_code != 200:
    raise Exception("Non-200 response: " + str(response.text))

data = response.json()

print(data)
print(data['choices'][0]['message']['content'])