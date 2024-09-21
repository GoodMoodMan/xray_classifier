import torch
import torchvision.transforms as transforms
from torchvision import datasets, models
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
from torch.utils.data import DataLoader
import torch.optim as optim
import torch.nn as nn
import os
from tqdm import tqdm

# Define data paths
data_dir = './untrained_images'
batch_size = 32
num_epochs = 10

# Define the device (always use CPU)
device = torch.device("cpu")

# Data transforms
data_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Load the data (train only if no validation is needed)
train_dataset = datasets.ImageFolder(data_dir, transform=data_transforms)
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

# Get class names
class_names = train_dataset.classes

# Load a pre-trained efficientnet_b0 model
model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)

# Modify the final layer to match the number of classes
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, len(class_names))

# Load pre-trained model weights
checkpoint = torch.load('./best_chest_xray_classifier.pth', map_location=torch.device('cpu'), weights_only=True)
model_dict = model.state_dict()
pretrained_dict = {k: v for k, v in checkpoint.items() if k in model_dict and v.shape == model_dict[k].shape}
model_dict.update(pretrained_dict)
model.load_state_dict(model_dict)

# Freeze all layers except the final classifier
for name, param in model.named_parameters():
    if "classifier" not in name:
        param.requires_grad = False

# Ensure the classifier parameters require gradients
for param in model.classifier.parameters():
    param.requires_grad = True

# Move model to device (CPU)
model = model.to(device)

# Define loss function and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=0.001)

# Training loop without validation
def train_model(model, criterion, optimizer, num_epochs=10):
    for epoch in range(num_epochs):
        print(f'Epoch {epoch+1}/{num_epochs}')
        print('-' * 10)

        model.train()  # Set model to training mode
        running_loss = 0.0
        running_corrects = 0

        # Iterate over data
        for inputs, labels in tqdm(train_loader):
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            # Forward pass
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            # Backward pass and optimization
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / len(train_dataset)
        epoch_acc = running_corrects.double() / len(train_dataset)

        print(f'Train Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    # Save the final model after fine-tuning
    torch.save(model.state_dict(), 'fine_tuned_model_new.pth')

# Run training
train_model(model, criterion, optimizer, num_epochs=num_epochs)