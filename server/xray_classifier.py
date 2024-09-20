import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from torchvision.models import efficientnet_b0
from PIL import Image
import sys
import json
import os
import traceback

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

class XrayDetector(torch.nn.Module):
    def __init__(self):
        super(XrayDetector, self).__init__()
        self.resnet = torchvision.models.resnet18(pretrained=False)
        num_ftrs = self.resnet.fc.in_features
        self.resnet.fc = torch.nn.Linear(num_ftrs, 2)
    
    def forward(self, x):
        return self.resnet(x)


class ChestXRayClassifier(nn.Module):
    def __init__(self, num_classes, model_name='efficientnet_b0'):
        super(ChestXRayClassifier, self).__init__()
        self.base_model = efficientnet_b0(pretrained=False)
        num_ftrs = self.base_model.classifier[1].in_features
        self.base_model.classifier = nn.Identity()
        self.fc1 = nn.Linear(num_ftrs + 3, 512)  # +3 for age, gender, view
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, x, age, gender, view):
        x = self.base_model(x)
        x = torch.cat((x, age.unsqueeze(1), gender.unsqueeze(1), view.unsqueeze(1)), dim=1)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Load the models
xray_detector = XrayDetector()
xray_detector.load_state_dict(torch.load('chest_xray_classifier.pth', map_location=torch.device('cpu')))
xray_detector.eval()

num_classes = 8  # Adjust this to match your new model
chest_classifier = ChestXRayClassifier(num_classes)
chest_classifier.load_state_dict(torch.load('best_chest_xray_classifier.pth', map_location=torch.device('cpu')))
chest_classifier.eval()


def load_and_preprocess_image(image_path):
    print(f"Attempting to open image at: {image_path}", file=sys.stderr)
    print(f"File exists: {os.path.exists(image_path)}", file=sys.stderr)
    print(f"File size: {os.path.getsize(image_path) if os.path.exists(image_path) else 'N/A'}", file=sys.stderr)
    
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
        print(f"Error opening image: {str(e)}", file=sys.stderr)
        raise

def predict_xray(model, image_tensor):
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        _, predicted = torch.max(outputs, 1)
    return predicted.item(), probabilities[0]

def predict_chest_conditions(model, image_tensor, age, gender, view):
    with torch.no_grad():
        outputs = model(image_tensor, age, gender, view)
        probabilities = torch.sigmoid(outputs)
    return probabilities[0]


def classify_image(image_path):
    # Load and preprocess the image
    image_tensor = load_and_preprocess_image(image_path)
    
    # First, determine if it's an X-ray (assuming you still want to use the XrayDetector)
    xray_prediction, xray_probabilities = predict_xray(xray_detector, image_tensor)
    
    if xray_prediction == 0:  # It's a chest X-ray
        # Now classify the chest conditions
        # You'll need to provide dummy values for age, gender, and view
        # Adjust these as needed or get them from user input
        age = torch.tensor([50.0]).float()
        gender = torch.tensor([1.0]).float()  # Assuming 1.0 for male, 0.0 for female
        view = torch.tensor([1.0]).float()  # Assuming 1.0 for PA, 0.0 for AP
        
        chest_probabilities = predict_chest_conditions(chest_classifier, image_tensor, age, gender, view)
        
        # Define your chest condition labels
        chest_labels = ['Atelectasis', 'Cardiomegaly', 'Edema', 'Effusion', 
                    'Infiltration', 'Mass', 'No Finding', 'Nodule', 
                    'Pneumothorax', 'Consolidation/Pneumonia']
        
        chest_results = {label: prob.item() for label, prob in zip(chest_labels, chest_probabilities)}
        
        return {
            "is_xray": True,
            "xray_confidence": xray_probabilities[0].item(),
            "chest_conditions": chest_results
        }
    else:
        return {
            "is_xray": False,
            "confidence": xray_probabilities[1].item()
        }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python xray_classifier.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    print(f"Received image path: {image_path}", file=sys.stderr)
    result = classify_image(image_path)
    print(json.dumps(result))
