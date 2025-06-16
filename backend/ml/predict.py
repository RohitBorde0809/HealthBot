import pickle
import os
from sklearn.metrics.pairwise import cosine_similarity

class HealthPredictor:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
        self.load_model()

    def load_model(self):
        try:
            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)
                self.vectorizer = model_data['vectorizer']
                self.X = model_data['X']
                self.training_data = model_data['training_data']
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise

    def predict(self, query):
        try:
            # Transform the query using the same vectorizer
            query_vector = self.vectorizer.transform([query])
            
            # Calculate similarity scores
            similarity_scores = cosine_similarity(query_vector, self.X).flatten()
            
            # Get the index of the most similar training example
            most_similar_idx = similarity_scores.argmax()
            
            # Get the response from the training data
            response = self.training_data[most_similar_idx]['output']
            
            # Format the response with sections
            formatted_response = self.format_response(response)
            
            return formatted_response
        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            return "I'm sorry, I couldn't process your query. Please try rephrasing it."

    def format_response(self, response):
        # Add sections and emojis to the response
        sections = {
            "Symptoms": "📋",
            "Causes": "🔍",
            "Treatment": "💊",
            "Prevention": "🛡️",
            "First Aid": "🚑",
            "Home Remedies": "🏠",
            "Important": "❗"
        }
        
        # Split the response into lines
        lines = response.split('\n')
        formatted_lines = []
        
        # Add emojis and format each line
        for line in lines:
            if line.strip():
                # Check if line starts with a bullet point
                if line.strip().startswith('•'):
                    formatted_lines.append(line)
                else:
                    # Try to identify the section
                    for section, emoji in sections.items():
                        if section.lower() in line.lower():
                            formatted_lines.append(f"\n{emoji} {line}")
                            break
                    else:
                        formatted_lines.append(line)
        
        # Add disclaimer
        formatted_lines.append("\n❗ Remember: This is general information. Please consult healthcare providers for medical advice.")
        
        return '\n'.join(formatted_lines)

# Create a singleton instance
predictor = HealthPredictor() 