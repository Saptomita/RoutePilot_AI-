from PIL import Image, ImageOps
import os

def remove_black_background_v3(input_path, output_path):
    try:
        # Open and convert to RGBA
        img = Image.open(input_path).convert("RGBA")
        
        # Use the "Max" of RGB as the mask
        # This is better for black backgrounds
        r, g, b, a = img.split()
        
        # Calculate max(R, G, B)
        # We can use ImageMath but ImageOps.grayscale is simple
        # but better yet, we can use point() to create a mask
        
        # Mask = 1 if max(R,G,B) > threshold else 0
        threshold = 40
        
        # Create a lightness mask
        mask = img.convert("L").point(lambda x: 0 if x < threshold else 255)
        
        # Put the mask into the alpha channel
        img.putalpha(mask)
        
        # Optional: Smooth the mask slightly to reduce JPEG ringing
        # (Though putalpha takes a L image, we'd need to blur it before putalpha)
        # mask = mask.filter(ImageFilter.GaussianBlur(radius=1))
        # img.putalpha(mask)
        
        img.save(output_path, "PNG")
        print(f"Success: High quality background removal saved to {output_path}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

# Paths
public_dir = r"c:\Users\LENOVO\Desktop\RoutePilot AI\public"
input_file = os.path.join(public_dir, "routepilot.jpeg")
output_file = os.path.join(public_dir, "logo.png")

if __name__ == "__main__":
    remove_black_background_v3(input_file, output_file)
