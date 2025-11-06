import chromadb

class db():
    def __init__(self):
        self.client = chromadb.Client()
        self.collection = self.client.get_or_create_collection(name="documents")

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