import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from torchvision.models import efficientnet_b0
from torch.utils.data import Dataset, DataLoader
import torch.optim as optim
import os
from tqdm import tqdm
from PIL import Image

# Define the fixed set of 10 classes
FIXED_CLASSES = ['Atelectasis', 'Cardiomegaly', 'Edema', 'Effusion', 
                 'Infiltration', 'Mass', 'No Finding', 'Nodule', 
                 'Pneumothorax', 'Consolidation/Pneumonia']

class ChestXRayDataset(Dataset):
    def __init__(self, data_dir, transform=None):
        self.data_dir = data_dir
        self.transform = transform
        self.images = []
        self.labels = []
        self.class_names = FIXED_CLASSES
        
        available_classes = [d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]
        
        for class_idx, class_name in enumerate(self.class_names):
            if class_name in available_classes:
                class_dir = os.path.join(data_dir, class_name)
                for img_name in os.listdir(class_dir):
                    self.images.append(os.path.join(class_dir, img_name))
                    self.labels.append(class_idx)
            else:
                print(f"Warning: Class '{class_name}' not found in the data directory.")

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        image = Image.open(img_path).convert('RGB')
        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, label

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

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def fine_tune_model(model, train_loader, criterion, optimizer, num_epochs, device):
    model.train()
    for epoch in range(num_epochs):
        running_loss = 0.0
        correct = 0
        total = 0

        train_pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}")

        for inputs, labels in train_pbar:
            inputs, labels = inputs.to(device), labels.to(device)
            
            # Generate dummy values for age, gender, and view
            batch_size = inputs.size(0)
            age = torch.full((batch_size,), 50.0, device=device)
            gender = torch.full((batch_size,), 1.0, device=device)
            view = torch.full((batch_size,), 1.0, device=device)

            optimizer.zero_grad()
            outputs = model(inputs, age, gender, view)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

            train_pbar.set_postfix({'loss': f"{loss.item():.4f}", 'acc': f"{100.*correct/total:.2f}%"})

        print(f'Epoch {epoch+1}/{num_epochs}, Loss: {running_loss/len(train_loader):.4f}, Acc: {100.*correct/total:.2f}%')

    return model

def main(data_dir, num_epochs=10, batch_size=32):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    dataset = ChestXRayDataset(data_dir, transform=transform)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True, num_workers=2)

    num_classes = len(FIXED_CLASSES)
    print(f"Number of classes: {num_classes}")

    model = ChestXRayClassifier(num_classes).to(device)

    try:
        state_dict = torch.load('best_chest_xray_classifier.pth', map_location=device)
        model.load_state_dict(state_dict)
        print("Loaded existing model weights.")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Initializing with default weights.")

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    fine_tuned_model = fine_tune_model(model, dataloader, criterion, optimizer, num_epochs, device)

    torch.save(fine_tuned_model.state_dict(), 'best_chest_xray_classifier.pth')
    print("Fine-tuned model saved as 'best_chest_xray_classifier.pth'")

if __name__ == "__main__":
    data_dir = './untrained_images'  # Update this to your data directory
    main(data_dir, num_epochs=10, batch_size=32)