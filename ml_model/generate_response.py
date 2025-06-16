import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

class ResponseGenerator:
    def __init__(self, model_path="./trained_model"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(model_path).to(self.device)
        
    def generate_response(self, user_input, max_length=200):
        # Prepare input
        input_text = f"User: {user_input}\nAssistant:"
        input_ids = self.tokenizer.encode(input_text, return_tensors="pt").to(self.device)
        
        # Generate response
        with torch.no_grad():
            output_ids = self.model.generate(
                input_ids,
                max_length=max_length,
                num_return_sequences=1,
                no_repeat_ngram_size=2,
                temperature=0.7,
                top_k=50,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        # Decode and clean response
        response = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
        response = response.replace(input_text, "").strip()
        
        return response

def main():
    # Example usage
    generator = ResponseGenerator()
    
    while True:
        user_input = input("\nEnter your message (or 'quit' to exit): ")
        if user_input.lower() == 'quit':
            break
            
        response = generator.generate_response(user_input)
        print(f"\nAssistant: {response}")

if __name__ == "__main__":
    main() 