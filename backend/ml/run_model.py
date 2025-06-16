import sys
from predict import predictor

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide a query")
        sys.exit(1)
    
    query = sys.argv[1]
    response = predictor.predict(query)
    print(response) 