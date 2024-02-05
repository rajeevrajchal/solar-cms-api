import sys
import os
import json
from datetime import datetime
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Inches

def create_quote_document(quote):
    doc = DocxTemplate("src/public/docx-templates/standard-quote-template.docx")
    save_location = 'src/public/documents/'
    image_path = "src/public/images/logo.png"
    current_date = datetime.now().date()

    filename = f"{quote['name'].replace(' ', '-')}-{current_date}.docx"
    full_path = save_location + filename
    os.makedirs(save_location, exist_ok=True)

    inline_image = InlineImage(doc, image_path, width=Inches(4.0))


    context = {
        'date': current_date,
        "company_logo": inline_image,
        "company_name": "Solar CMS",
        "customer_name": quote['project']['customer']['name'],
        "customer_email": quote['project']['customer']['email'],
        "customer_phone": quote['project']['customer']['phone'],
    }
    
    doc.render(context)
    doc.save(full_path)

    return filename, full_path

if __name__ == "__main__":
    quote = sys.argv[1]
    created_filename, created_full_path = create_quote_document(json.loads(quote))
    print(f'{created_full_path}')
