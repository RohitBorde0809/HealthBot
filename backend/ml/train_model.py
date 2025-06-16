import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import json
import os

def train_model(csv_path, output_path):
    try:
        # Read the CSV file in chunks
        print("Reading dataset...")
        chunk_size = 1000  # Process 1000 rows at a time
        training_data = []
        
        # Read first row to get column names
        first_chunk = pd.read_csv(csv_path, nrows=1)
        print("CSV columns:", first_chunk.columns.tolist())
        
        # Get the actual column names
        disease_col = first_chunk.columns[0]  # First column is disease
        symptoms_col = first_chunk.columns[1]  # Second column is symptoms
        
        print(f"Using columns: {disease_col} for disease and {symptoms_col} for symptoms")
        
        for chunk in pd.read_csv(csv_path, chunksize=chunk_size):
            for _, row in chunk.iterrows():
                disease = row[disease_col]
                symptoms = row[symptoms_col]
                
                # Create input-output pairs
                training_data.append({
                    'input': f"What are the symptoms of {disease}?",
                    'output': f"📋 Symptoms of {disease}:\n{format_symptoms(symptoms)}"
                })
                
                training_data.append({
                    'input': f"Tell me about {disease}",
                    'output': f"🔍 Information about {disease}:\n{format_symptoms(symptoms)}"
                })
                
                training_data.append({
                    'input': f"What is {disease}?",
                    'output': f"📋 {disease} is a condition with the following symptoms:\n{format_symptoms(symptoms)}"
                })
            
            print(f"Processed {len(training_data)} training examples...")
        
        # Create TF-IDF vectorizer
        print("Training TF-IDF model...")
        vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
        corpus = [item['input'] for item in training_data]
        X = vectorizer.fit_transform(corpus)
        
        # Save the model and training data
        print("Saving model...")
        model_data = {
            'vectorizer': vectorizer,
            'X': X,
            'training_data': training_data
        }
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        print("Model training completed!")
        return len(training_data)
    except Exception as e:
        print(f"Error during training: {str(e)}")
        raise

def format_symptoms(symptoms):
    # Split symptoms and format them
    symptom_list = [s.strip() for s in str(symptoms).split(',')]
    return '\n'.join([f"• {symptom}" for symptom in symptom_list])

if __name__ == "__main__":
    try:
        csv_path = os.path.join(os.path.dirname(__file__), '../../Diseases_and_Symptoms.csv')
        output_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
        print(f"CSV path: {csv_path}")
        print(f"Output path: {output_path}")
        train_model(csv_path, output_path)
    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1) 