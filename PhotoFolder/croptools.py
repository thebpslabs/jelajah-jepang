from PIL import Image
import os

# --- 1. YOUR CONFIGURATION ---
SOURCE_FOLDER = "Unsplash_JS_Download"       # The folder with your original images
DESTINATION_FOLDER = "cropped_images"      # Where the new cropped images will be saved
TARGET_WIDTH = 1280                        # <-- Set your desired width
TARGET_HEIGHT = 720                       # <-- Set your desired height

# --- 2. THE SCRIPT (No changes needed below) ---

# Create destination folder if it doesn't exist
if not os.path.exists(DESTINATION_FOLDER):
    os.makedirs(DESTINATION_FOLDER)
    print(f"Created folder: {DESTINATION_FOLDER}")

# Get a list of image files from the source folder
files = [f for f in os.listdir(SOURCE_FOLDER) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

if not files:
    print(f"No images found in '{SOURCE_FOLDER}'. Please check the folder name.")
    exit()

print(f"Found {len(files)} images to crop. Starting process...")
target_aspect = TARGET_WIDTH / TARGET_HEIGHT

# Process each image
for i, filename in enumerate(files):
    try:
        # Open the image
        img_path = os.path.join(SOURCE_FOLDER, filename)
        img = Image.open(img_path)
        
        # Calculate aspect ratios
        img_aspect = img.width / img.height

        if img_aspect > target_aspect:
            # Image is wider than target: scale by height
            new_height = TARGET_HEIGHT
            new_width = int(new_height * img_aspect)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Calculate coordinates for center crop
            left = (new_width - TARGET_WIDTH) / 2
            top = 0
            right = (new_width + TARGET_WIDTH) / 2
            bottom = TARGET_HEIGHT
        else:
            # Image is taller than or same as target: scale by width
            new_width = TARGET_WIDTH
            new_height = int(new_width / img_aspect)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

            # Calculate coordinates for center crop
            left = 0
            top = (new_height - TARGET_HEIGHT) / 2
            right = TARGET_WIDTH
            bottom = (new_height + TARGET_HEIGHT) / 2
            
        # Perform the crop and save
        cropped_img = img.crop((left, top, right, bottom))
        save_path = os.path.join(DESTINATION_FOLDER, filename)
        cropped_img.save(save_path, "JPEG", quality=95) # Saves as JPEG, adjust as needed

        print(f"  ({i+1}/{len(files)}) Cropped: {filename}")

    except Exception as e:
        print(f"  -> Could not process {filename}. Error: {e}")

print(f" Cropping complete! All new images are in the '{DESTINATION_FOLDER}' folder.")