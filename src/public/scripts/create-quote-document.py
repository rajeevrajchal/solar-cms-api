import sys
import os
import json
from datetime import datetime
from docxtpl import DocxTemplate

def create_quote_document(quote):
    doc = DocxTemplate("src/public/docx-templates/standard-quote-template.docx")
    current_date = datetime.now().date()
    save_location = 'src/public/documents/'
    filename = f"{quote['name'].replace(' ', '-')}-{current_date}.docx"
    full_path = save_location + filename
    os.makedirs(save_location, exist_ok=True)
    context = {
        'greeting': "Hello world",
        'name': quote['name'],
        'address': "Test Quote",
        'heading': 100,
        'description': 100,
    }
    doc.render(context)
    doc.save(full_path)

    return filename, full_path

if __name__ == "__main__":
    quote = sys.argv[1]
    created_filename, created_full_path = create_quote_document(json.loads(quote))
    print(f'{created_full_path}')
