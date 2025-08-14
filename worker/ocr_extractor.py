import sys
import pytesseract
from PIL import Image
from pdf2image import convert_from_path

file_path = sys.argv[1]

if file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.webp')):
    text = pytesseract.image_to_string(Image.open(file_path))
elif file_path.lower().endswith('.pdf'):
    images = convert_from_path(file_path)
    text = ""
    for img in images:
        text += pytesseract.image_to_string(img) + "\n"
else:
    text = ""

print(text)
