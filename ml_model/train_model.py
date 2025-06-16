import os
import json
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
import pandas as pd
from tqdm import tqdm

def load_and_prepare_data(data_path):
    """Load and prepare the dataset for training."""
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Convert to conversation format
    conversations = []
    for item in data:
        conversations.append({
            'text': f"User: {item['message']}\nAssistant: {item['response']}\n"
        })
    
    return Dataset.from_pandas(pd.DataFrame(conversations))

def train_model():
    # Model and tokenizer setup
    model_name = "microsoft/DialoGPT-small"  # Using DialoGPT as it's good for conversations
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    
    # Load and prepare data
    data_path = "../dataset/health_chat_dataset.json"
    dataset = load_and_prepare_data(data_path)
    
    # Tokenize the dataset
    def tokenize_function(examples):
        return tokenizer(
            examples['text'],
            padding='max_length',
            truncation=True,
            max_length=512
        )
    
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset.column_names
    )
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        save_steps=500,
        save_total_limit=2,
        logging_steps=100,
        learning_rate=2e-5,
        warmup_steps=500,
        weight_decay=0.01,
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=DataCollatorForLanguageModeling(
            tokenizer=tokenizer,
            mlm=False
        ),
    )
    
    # Train the model
    print("Starting training...")
    trainer.train()
    
    # Save the model and tokenizer
    model_save_path = "./trained_model"
    os.makedirs(model_save_path, exist_ok=True)
    model.save_pretrained(model_save_path)
    tokenizer.save_pretrained(model_save_path)
    print(f"Model saved to {model_save_path}")

if __name__ == "__main__":
    train_model() 