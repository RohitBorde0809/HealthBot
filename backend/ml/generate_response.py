import pickle
from sklearn.metrics.pairwise import cosine_similarity

def load_model(model_path):
    with open(model_path, 'rb') as f:
        return pickle.load(f)

def generate_response(input_text, model_data, threshold=0.3):
    # Transform input text
    input_vector = model_data['vectorizer'].transform([input_text])
    
    # Calculate similarity with all training examples
    similarities = cosine_similarity(input_vector, model_data['X'])[0]
    
    # Find best match
    best_idx = similarities.argmax()
    best_score = similarities[best_idx]
    
    if best_score > threshold:
        return model_data['training_data'][best_idx]['output']
    else:
        return "I'm sorry, I don't have enough information to answer that question. Please try rephrasing or ask about a different health topic."

if __name__ == "__main__":
    # Test the model
    model_data = load_model('model.pkl')
    response = generate_response("What are the symptoms of diabetes?", model_data)
    print(response) 