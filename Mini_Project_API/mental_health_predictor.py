import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig
import json
import os
import contextlib

# Set the path to your downloaded model
MODEL_DIR = r"D:\MultiModalMentalHealth\Mini_Project_API\textmentalhealth_92"

# Define a no-op context manager to replace init_empty_weights if needed
@contextlib.contextmanager
def dummy_context_mgr():
    yield None

# Load model components with version-agnostic approach
def load_model_and_tokenizer():
    # Load the config
    config = AutoConfig.from_pretrained(MODEL_DIR)
    
    # Try to load the model with multiple fallback options
    try:
        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_DIR,
            config=config,
            local_files_only=True
        )
    except Exception:
        try:
            model = AutoModelForSequenceClassification.from_pretrained(
                MODEL_DIR,
                config=config,
                trust_remote_code=False,
                use_safetensors=os.path.exists(os.path.join(MODEL_DIR, "model.safetensors"))
            )
        except Exception:
            model = AutoModelForSequenceClassification.from_config(config)
            if os.path.exists(os.path.join(MODEL_DIR, "pytorch_model.bin")):
                state_dict = torch.load(os.path.join(MODEL_DIR, "pytorch_model.bin"), map_location="cpu")
                model.load_state_dict(state_dict)
            elif os.path.exists(os.path.join(MODEL_DIR, "model.safetensors")):
                from safetensors.torch import load_file
                state_dict = load_file(os.path.join(MODEL_DIR, "model.safetensors"))
                model.load_state_dict(state_dict)
            else:
                raise Exception("Model weights not found in expected locations")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, local_files_only=True)
    
    # Load label mapping
    with open(f"{MODEL_DIR}/label_mapping.json", "r") as f:
        id_to_label = json.load(f)
        id_to_label = {int(k): v for k, v in id_to_label.items()}
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    
    return model, tokenizer, id_to_label, device

def predict_mental_health_status(statements, max_length=128):
    """
    Predict mental health status from text statements.
    
    Args:
        statements: String or list of strings to analyze
        max_length: Maximum token length for the model
        
    Returns:
        List of dictionaries containing predictions and probabilities
    """
    if isinstance(statements, str):
        statements = [statements]

    model.eval()
    predictions = []
    probabilities = []

    for statement in statements:
        encoding = tokenizer(
            statement,
            add_special_tokens=True,
            max_length=max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        input_ids = encoding['input_ids'].to(device)
        attention_mask = encoding['attention_mask'].to(device)

        with torch.no_grad():
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)

        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1)
        pred_class = torch.argmax(logits, dim=1).cpu().numpy()[0]
        pred_label = id_to_label[pred_class]
        class_probs = probs.cpu().numpy()[0]

        predictions.append(pred_label)
        probabilities.append(class_probs)

    results = []
    for i, statement in enumerate(statements):
        result = {
            'statement': statement,
            'predicted_status': predictions[i]
        }
        for j, label in id_to_label.items():
            result[f'probability_{label}'] = float(probabilities[i][j])
        results.append(result)

    return results

# Load model at startup
model, tokenizer, id_to_label, device = load_model_and_tokenizer()