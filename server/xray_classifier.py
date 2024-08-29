import torch
import torchvision.transforms as transforms
from PIL import Image
import sys
import json
import base64
import io
import sys
import json
import traceback
import os  # Add this import

# Print debug information to stderr
print(f"Python executable: {sys.executable}", file=sys.stderr)
print(f"Python version: {sys.version}", file=sys.stderr)
print("Python path:", file=sys.stderr)
for path in sys.path:
    print(path, file=sys.stderr)

try:
    import torch
    import torchvision
    print(f"torch version: {torch.__version__}", file=sys.stderr)
    print(f"torchvision version: {torchvision.__version__}", file=sys.stderr)
except ImportError as e:
    print(f"Error importing torch or torchvision: {e}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)


class ChestXRayClassifier(torch.nn.Module):
    def __init__(self):
        super(ChestXRayClassifier, self).__init__()
        self.resnet = torchvision.models.resnet18(pretrained=False)
        num_ftrs = self.resnet.fc.in_features
        self.resnet.fc = torch.nn.Linear(num_ftrs, 2)

    def forward(self, x):
        return self.resnet(x)
    

# Load the model
model = ChestXRayClassifier()
model.load_state_dict(torch.load('chest_xray_classifier.pth', map_location=torch.device('cpu')))
model.eval()
    


def load_and_preprocess_image(image_path):
    print(f"Attempting to open image at: {image_path}")
    print(f"File exists: {os.path.exists(image_path)}")
    print(f"File size: {os.path.getsize(image_path) if os.path.exists(image_path) else 'N/A'}")
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    try:
        image = Image.open(image_path).convert('RGB')
        image = transform(image).unsqueeze(0)
        return image
    except Exception as e:
        print(f"Error opening image: {str(e)}")
        raise
def predict_image(model, image_tensor):
    model.eval()
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        _, predicted = torch.max(outputs, 1)
    return predicted.item(), probabilities[0]

def classify_image(image_path):
    # Load and preprocess the image
    image_tensor = load_and_preprocess_image(image_path)

    # Move the image tensor to the same device as the model
    device = next(model.parameters()).device
    image_tensor = image_tensor.to(device)

    # Make prediction
    prediction, probabilities = predict_image(model, image_tensor)

    # Interpret results
    class_names = ['Chest X-ray', 'Non-Chest X-ray']
    predicted_class = class_names[prediction]
    confidence = probabilities[prediction].item()

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "probabilities": {
            "Chest X-ray": probabilities[0].item(),
            "Non-Chest X-ray": probabilities[1].item()
        }
    }



if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python xray_classifier.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    print(f"Received image path: {image_path}")
    result = classify_image(image_path)
    print(json.dumps(result))