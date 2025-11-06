from sentence_transformers import SentenceTransformer
from chromadb.utils import embedding_functions

# Exemple : modèle multilingue E5
embedder = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="intfloat/multilingual-e5-base"
)

from chromadb import Client
from chromadb.config import Settings

class db():
    def __init__(self):
        self.client = Client(Settings(persist_directory="./chroma_db"))
        self.collection = self.client.get_or_create_collection(name="my_multilingual_rag", embedding_function=embedder)

    def add_document(self, document, doc_id):
        self.collection.add(
            documents=[document],
            metadatas=[{"source": "faq"}],
            ids=[doc_id]
        )

    def query(self, query_text):
        return self.collection.query(query_text)
    
    def similarity_search(self, query_text, n_results=1):
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results

db_instance = db()

db_instance.add_document("""Q": "Quel est le titre de document 1?", 
                          "A": "j'aime les fleures""",'doc1')
db_instance.add_document("""Q": "Quel est le titre de document 2?", 
                          "A": "j'aime les tulipes""",'doc2')

result = db_instance.similarity_search("titre du Doc1", n_results=1)
print(result)