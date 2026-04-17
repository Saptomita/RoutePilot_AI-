from PIL import Image
import math

def remove_bg(image_path):
    print("Processing Image...")
    try:
        img = Image.open(image_path).convert("RGBA")
        datas = img.getdata()
        
        # Get background color from corners
        w, h = img.size
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((w-1, 0)),
            img.getpixel((0, h-1)),
            img.getpixel((w-1, h-1))
        ]
        
        # Find dominant corner color (assuming it's background)
        bg_col = max(set(corners), key=corners.count)
        
        # We need a strict threshold for the glow not to get annihilated.
        threshold = 30 # How far from background color
        
        newData = []
        for item in datas:
            # Calculate euclidian distance
            distance = math.sqrt( (item[0] - bg_col[0])**2 + (item[1] - bg_col[1])**2 + (item[2] - bg_col[2])**2 )
            
            if distance < threshold:
                newData.append((255, 255, 255, 0)) # Perfect transparent
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save(image_path, "PNG")
        print("Success: Background Purged!")
    except Exception as e:
        print(f"Failed: {e}")

remove_bg("c:\\Users\\LENOVO\\Desktop\\RoutePilot AI\\public\\logo.png")
