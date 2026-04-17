from PIL import Image
import os

def crop_logo_precise(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # We need to find the gap between "RoutePilot" and the tagline.
        # Let's analyze pixel density per row
        row_density = []
        for y in range(height):
            # count non-transparent pixels in this row
            row = img.crop((0, y, width, y+1))
            non_transparent = [p for p in row.getdata() if p[3] > 10]
            row_density.append(len(non_transparent))
        
        # We start from the bottom and look for the first block of pixels (tagline)
        # then the gap, then the next block (RoutePilot)
        
        # Find the last non-empty row
        last_row = 0
        for y in range(height-1, -1, -1):
            if row_density[y] > 0:
                last_row = y
                break
        
        # Find the gap above the tagline
        # Let's assume the tagline is at least 10 pixels high
        gap_start = 0
        for y in range(last_row, 0, -1):
            if row_density[y] == 0:
                # Found a potential gap
                # Let's find how big it is
                gap_size = 0
                for gy in range(y, 0, -1):
                    if row_density[gy] == 0:
                        gap_size += 1
                    else:
                        break
                if gap_size > 5: # Significant gap
                    gap_start = y
                    break
        
        if gap_start > 0:
            img_cropped = img.crop((0, 0, width, gap_start))
            # Trim
            final_bbox = img_cropped.getbbox()
            if final_bbox:
                img_cropped = img_cropped.crop(final_bbox)
            img_cropped.save(output_path, "PNG")
            print(f"Success: Precise crop at row {gap_start}")
        else:
            print("Failed: Could not find clear gap.")
            
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

# Paths
public_dir = r"c:\Users\LENOVO\Desktop\RoutePilot AI\public"
input_path = os.path.join(public_dir, "routepilot.jpeg") # Original if possible
# Wait, I processed routepilot.jpeg to logo.png already.
# I'll use the original jpeg and re-remove background to be sure I have all data.
input_file = os.path.join(public_dir, "routepilot.jpeg")
output_file = os.path.join(public_dir, "logo.png")

if __name__ == "__main__":
    # First remove background but keep full height
    from PIL import Image
    img = Image.open(input_file).convert("RGBA")
    datas = img.getdata()
    newData = []
    for item in datas:
        if item[0] < 40 and item[1] < 40 and item[2] < 40:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    img.save(output_file, "PNG")
    
    # Then crop precisely
    crop_logo_precise(output_file, output_file)
