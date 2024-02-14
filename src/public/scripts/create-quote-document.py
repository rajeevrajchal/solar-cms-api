import sys
import os
import json
import jinja2
from datetime import datetime
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Inches

def create_quote_document(quote):
    doc = DocxTemplate("src/public/docx-templates/standard-quote-template.docx")
    save_location = 'src/public/documents/'
    image_path = "src/public/images/logo.png"
    current_date = datetime.now().date()
    formatted_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    filename = f"{quote['name'].replace(' ', '-')}-{current_date}.docx"
    full_path = save_location + filename
    os.makedirs(save_location, exist_ok=True)

    inline_image = InlineImage(doc, image_path, width=Inches(4.0))

    equipment_data = quote['project']['equipment']
    for item in equipment_data:
        item['total_cost'] = item['quantity'] * item['inventory']['selling_cost']
        
    context = {
        'date': formatted_datetime,
        'quote_sn': 123,
        'equipment_data': equipment_data,
        "company_logo": inline_image,
        "company_name": "Solar CMS",
        "company_email": "info@solarcms.io",
        "customer_name": quote['project']['customer']['name'],
        "customer_email": quote['project']['customer']['email'],
        "project_name":quote['project']['name'],
        "project_capacity":400,
        "project_start_date":datetime.strptime(quote['project']['createdAt'], "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%Y-%m-%d %H:%M:%S"),
        "equipment_cost":quote['inventory_cost'],
        "installation_cost":quote['installation_cost'],
        "discount":quote['discount'],
        "adjustment":quote['adjustment'],
        "total":0,
        "vat":quote['vat'],
        "vat_amount":0,
        "net_total": quote['net_total'],
        "sale_user": "Rajeev Rajchal"
    }
    
    doc.render(context)
    doc.save(full_path)

    return filename, full_path

if __name__ == "__main__":
    quote = sys.argv[1]
    created_filename, created_full_path = create_quote_document(json.loads(quote))
    print(f'{created_full_path}')

