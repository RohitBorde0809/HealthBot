import pandas as pd
import numpy as np
import os
from tqdm import tqdm
import json
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle

def load_datasets():
    """Load all datasets"""
    print("Loading datasets...")
    
    # Load symptoms dataset
    symptoms_df = pd.read_csv('../../dataset/disease_symptoms.csv', encoding='latin-1')
    print(f"Loaded symptoms dataset with {len(symptoms_df)} diseases")
    
    # Load risk factors dataset
    risk_df = pd.read_csv('../../dataset/disease_riskFactors.csv', encoding='latin-1')
    print(f"Loaded risk factors dataset with {len(risk_df)} diseases")
    
    # Load precautions dataset
    precautions_df = pd.read_csv('../../dataset/disease_precaution.csv', encoding='latin-1')
    print(f"Loaded precautions dataset with {len(precautions_df)} diseases")
    
    # Load medicines dataset
    medicines_df = pd.read_csv('../../dataset/disease_medicine.csv', encoding='latin-1')
    print(f"Loaded medicines dataset with {len(medicines_df)} medicines")
    
    return symptoms_df, risk_df, precautions_df, medicines_df

def process_disease_data(symptoms_df, risk_df, precautions_df, medicines_df):
    """Process and combine all disease information"""
    print("Processing disease information...")
    processed_data = []
    
    # Process each disease
    for _, row in symptoms_df.iterrows():
        disease = row['Disease'].strip()  # Clean disease name
        
        # Get symptoms
        symptoms = []
        for col in row.index[1:]:  # Skip Disease column
            if pd.notna(row[col]) and str(row[col]).strip():
                # Split multiple symptoms if they exist in the same cell
                symptom_list = str(row[col]).strip().split(',')
                for symptom in symptom_list:
                    if symptom.strip():
                        symptoms.append(symptom.strip())
        
        # Get risk factors
        risk_info = risk_df[risk_df['DNAME'].str.strip() == disease]
        risk_factors = []
        if not risk_info.empty:
            risk_factors = [r.strip() for r in risk_info['RISKFAC'].iloc[0].split(',') if r.strip()]
        
        # Get precautions
        precaution_info = precautions_df[precautions_df['Disease'].str.strip() == disease]
        precautions = []
        if not precaution_info.empty:
            for col in ['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']:
                if pd.notna(precaution_info[col].iloc[0]):
                    precautions.append(precaution_info[col].iloc[0].strip())
        
        # Get medicines
        medicine_info = medicines_df[medicines_df['Disease_ID'] == risk_info['DID'].iloc[0] if not risk_info.empty else None]
        medicines = []
        if not medicine_info.empty:
            for _, med_row in medicine_info.iterrows():
                if pd.notna(med_row['Medicine_Name']):
                    medicines.append({
                        'name': med_row['Medicine_Name'],
                        'composition': med_row['Medicine_Composition'] if pd.notna(med_row['Medicine_Composition']) else '',
                        'description': med_row['Medicine_Description'] if pd.notna(med_row['Medicine_Description']) else ''
                    })
        
        # Create disease entry
        entry = {
            'disease': disease,
            'symptoms': symptoms,
            'risk_factors': risk_factors,
            'precautions': precautions,
            'medicines': medicines
        }
        processed_data.append(entry)
    
    return processed_data

def create_training_data(processed_data, output_path):
    """Create training data from processed information"""
    print("Creating training data...")
    training_data = []
    
    for entry in processed_data:
        disease = entry['disease']
        symptoms = entry['symptoms']
        risk_factors = entry['risk_factors']
        precautions = entry['precautions']
        medicines = entry['medicines']
        
        # Basic information
        training_data.append({
            'input': f"What is {disease}?",
            'output': format_disease_info(disease, symptoms, risk_factors, precautions, medicines)
        })
        
        # Symptoms specific
        training_data.append({
            'input': f"What are the symptoms of {disease}?",
            'output': format_symptoms(disease, symptoms)
        })
        
        # Risk factors
        if risk_factors:
            training_data.append({
                'input': f"What are the risk factors for {disease}?",
                'output': format_risk_factors(disease, risk_factors)
            })
        
        # Precautions
        if precautions:
            training_data.append({
                'input': f"What precautions should I take for {disease}?",
                'output': format_precautions(disease, precautions)
            })
        
        # Medicines
        if medicines:
            training_data.append({
                'input': f"What medicines are used to treat {disease}?",
                'output': format_medicines(disease, medicines)
            })
        
        # Symptom-based questions
        for symptom in symptoms:
            training_data.append({
                'input': f"Does {disease} cause {symptom}?",
                'output': f"Yes, {symptom} is a symptom of {disease}."
            })
            
            training_data.append({
                'input': f"Is {symptom} a symptom of {disease}?",
                'output': f"Yes, {symptom} is a symptom of {disease}."
            })
    
    # Create and save TF-IDF vectorizer
    print("Creating TF-IDF vectorizer...")
    vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
    corpus = [item['input'] for item in training_data]
    X = vectorizer.fit_transform(corpus)
    
    # Save the model
    print("Saving model...")
    model_data = {
        'vectorizer': vectorizer,
        'X': X,
        'training_data': training_data
    }
    
    with open(output_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"Training data created and saved to {output_path}")
    return len(training_data)

def format_disease_info(disease, symptoms, risk_factors, precautions, medicines):
    """Format complete disease information"""
    sections = []
    
    sections.append(f"📋 {disease}")
    
    sections.append("\n🔍 Symptoms:")
    sections.append(format_symptoms(disease, symptoms))
    
    if risk_factors:
        sections.append("\n⚠️ Risk Factors:")
        sections.append(format_risk_factors(disease, risk_factors))
    
    if precautions:
        sections.append("\n🛡️ Precautions:")
        sections.append(format_precautions(disease, precautions))
    
    if medicines:
        sections.append("\n💊 Medicines:")
        sections.append(format_medicines(disease, medicines))
    
    sections.append("\n❗ Remember: This is general information. Please consult healthcare providers for medical advice.")
    
    return '\n'.join(sections)

def format_symptoms(disease, symptoms):
    """Format symptoms information"""
    return '\n'.join([f"• {symptom}" for symptom in symptoms])

def format_risk_factors(disease, risk_factors):
    """Format risk factors information"""
    return '\n'.join([f"• {factor}" for factor in risk_factors])

def format_precautions(disease, precautions):
    """Format precautions information"""
    return '\n'.join([f"• {precaution}" for precaution in precautions])

def format_medicines(disease, medicines):
    """Format medicines information"""
    sections = []
    for medicine in medicines:
        sections.append(f"• {medicine['name']}")
        if medicine['description']:
            sections.append(f"  {medicine['description']}")
    return '\n'.join(sections)

if __name__ == "__main__":
    try:
        # Load datasets
        symptoms_df, risk_df, precautions_df, medicines_df = load_datasets()
        
        # Process disease data
        processed_data = process_disease_data(symptoms_df, risk_df, precautions_df, medicines_df)
        
        # Create training data
        num_examples = create_training_data(processed_data, "model.pkl")
        print(f"Created {num_examples} training examples")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1) 