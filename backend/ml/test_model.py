import pickle
import os
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class ModelTester:
    def __init__(self, model_path='model.pkl'):
        print("Loading model...")
        with open(model_path, 'rb') as f:
            self.model_data = pickle.load(f)
        
        self.vectorizer = self.model_data['vectorizer']
        self.X = self.model_data['X']
        self.training_data = self.model_data['training_data']
        print(f"Model loaded successfully with {len(self.training_data)} training examples")

    def get_response(self, query):
        # Transform the query using the vectorizer
        query_vector = self.vectorizer.transform([query])
        
        # Calculate similarity scores
        similarity_scores = cosine_similarity(query_vector, self.X).flatten()
        
        # Get the index of the most similar question
        most_similar_idx = similarity_scores.argmax()
        
        # Get the similarity score
        similarity_score = similarity_scores[most_similar_idx]
        
        # Get the response
        response = self.training_data[most_similar_idx]['output']
        
        return {
            'response': response,
            'similarity_score': similarity_score,
            'matched_question': self.training_data[most_similar_idx]['input']
        }

def test_model():
    tester = ModelTester()
    
    print("\n=== Health Chatbot Test Mode ===")
    print("Type 'exit' to quit")
    print("Example questions:")
    print("1. What is diabetes?")
    print("2. What are the symptoms of flu?")
    print("3. Tell me about asthma")
    print("4. I have headache, what are the symptoms?")
    print("==============================\n")
    
    while True:
        query = input("\nEnter your question: ").strip()
        
        if query.lower() == 'exit':
            break
            
        if not query:
            continue
            
        try:
            result = tester.get_response(query)
            print("\nMatched Question:", result['matched_question'])
            print("Similarity Score:", f"{result['similarity_score']:.2f}")
            print("\nResponse:")
            print(result['response'])
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_model() 