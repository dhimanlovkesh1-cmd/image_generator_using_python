import json
import os

# 1. Point directly to your specific dataset folder
dataset_path = "./Resized" 
metadata = []

# 2. Scan the folder
for file in os.listdir(dataset_path):
    # 3. Find the text file
    if file.endswith(".txt"):
        with open(os.path.join(dataset_path, file), "r", encoding="utf-8") as f:
            prompt = f.read().strip()
        
        # 4. Swap .txt for .png to find the matching image
        img_file = file.replace(".txt", ".png")
        
        # 5. If the image exists, pair them together
        if os.path.exists(os.path.join(dataset_path, img_file)):
            metadata.append({"file_name": img_file, "text": prompt})

# 6. Save all the pairs into a single JSONL file required for machine learning
output_file = os.path.join(dataset_path, "metadata.jsonl")
with open(output_file, "w", encoding="utf-8") as f:
    for entry in metadata:
        f.write(json.dumps(entry) + "\n")

print(f"Success! Found and paired {len(metadata)} images.")