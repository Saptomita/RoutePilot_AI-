from PIL import Image

def crop_logo(image_path):
    print("Cropping image to remove the RoutePilot text at the bottom...")
    try:
        img = Image.open(image_path)
        w, h = img.size
        print(f"Original size: {w}x{h}")
        # Force crop: keep top 75% to remove the brand text at the bottom
        crop_height = int(h * 0.75)
        cropped_img = img.crop((0, 0, w, crop_height))
        cropped_img.save(image_path, "PNG")
        print(f"Done! Saved cropped logo ({w}x{crop_height})")
    except Exception as e:
        print(f"Error: {e}")

crop_logo("c:\\Users\\LENOVO\\Desktop\\RoutePilot AI\\public\\logo.png")
