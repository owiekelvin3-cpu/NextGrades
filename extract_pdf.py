
from PyPDF2 import PdfReader

pdf_path = r"c:\Users\lenovo\Documents\NextGrades\ui and about the website\NextGrades.pdf"
reader = PdfReader(pdf_path)

print(f"Number of pages: {len(reader.pages)}")
print("\n--- Text from PDF ---")

for i, page in enumerate(reader.pages):
    print(f"\n=== Page {i + 1} ===")
    text = page.extract_text()
    if text:
        print(text)
    else:
        print("No text found on this page")
