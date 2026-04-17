from PIL import Image, ImageDraw, ImageFont
import os

logo_path = r"c:\Users\LENOVO\Desktop\RoutePilot AI\public\logo.png"

img = Image.open(logo_path).convert("RGBA")
w, h = img.size
print(f"Current logo size: {w}x{h}")

# Extend the canvas downward to add space for the "RoutePilot" text
new_h = int(h * 1.38)  # restore roughly original proportions
new_img = Image.new("RGBA", (w, new_h), (0, 0, 0, 0))
new_img.paste(img, (0, 0))

draw = ImageDraw.Draw(new_img)

# Try to use a bold font, fallback to default
try:
    # Try to find Arial or similar on Windows
    font_path = r"C:\Windows\Fonts\arialbd.ttf"
    if not os.path.exists(font_path):
        font_path = r"C:\Windows\Fonts\calibrib.ttf"
    font_size = int(w * 0.14)
    font = ImageFont.truetype(font_path, font_size)
except Exception as e:
    print(f"Font load failed ({e}), using default")
    font = ImageFont.load_default()

# "Route" in cyan-blue (#38bdf8), "Pilot" in green (#10b981)
text_y = h + int((new_h - h) * 0.15)

route_text = "Route"
pilot_text = "Pilot"

# Measure text
try:
    r_bbox = draw.textbbox((0, 0), route_text, font=font)
    p_bbox = draw.textbbox((0, 0), pilot_text, font=font)
    r_w = r_bbox[2] - r_bbox[0]
    p_w = p_bbox[2] - p_bbox[0]
except:
    r_w = len(route_text) * 30
    p_w = len(pilot_text) * 30

total_w = r_w + p_w
x_start = (w - total_w) // 2

draw.text((x_start, text_y), route_text, fill="#38bdf8", font=font)
draw.text((x_start + r_w, text_y), pilot_text, fill="#10b981", font=font)

new_img.save(logo_path, "PNG")
print(f"Logo restored! New size: {w}x{new_h}")
print("Saved to:", logo_path)
