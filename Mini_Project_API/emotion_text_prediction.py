import pickle
import torch
from transformers import BertTokenizer, DistilBertForSequenceClassification

class EmotionPredictor:
    def __init__(self, model_path='TextEmotionModel/best_model', 
                 tokenizer_path='TextEmotionModel/tokenizer',
                 mappings_path='TextEmotionModel/emotion_mappings.pkl'):
        # Load emotion mappings
        with open(mappings_path, 'rb') as f:
            mappings = pickle.load(f)
            self.id_to_emotion = mappings['id_to_emotion']
        
        # Load tokenizer and model
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.tokenizer = BertTokenizer.from_pretrained(tokenizer_path)
        self.model = DistilBertForSequenceClassification.from_pretrained(model_path)
        self.model.to(self.device)
        self.model.eval()
        
        print(f"Model loaded successfully on {self.device}")
        
    def predict(self, text):
        # Tokenize the input text
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=64,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        # Move tensors to device
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        
        # Predict
        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            _, preds = torch.max(logits, dim=1)
            probs = torch.nn.functional.softmax(logits, dim=1)
        
        # Get predicted emotion and confidence
        predicted_id = preds.item()
        predicted_emotion = self.id_to_emotion[predicted_id]
        confidence = probs[0][predicted_id].item()
        
        # Get all emotion probabilities
        all_probs = {emotion_name: probs[0][emotion_id].item() 
                     for emotion_id, emotion_name in self.id_to_emotion.items()}
        
        return {
            'text': text,
            'predicted_emotion': predicted_emotion,
            'confidence': confidence,
            'all_probabilities': all_probs
        }
