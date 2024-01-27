
import sys
from datetime import datetime
from docxtpl import DocxTemplate

# Load the template document
doc = DocxTemplate("src/public/docx-templates/standard-quote-template.docx")

# Get the current date
current_date = datetime.now().date()

# Define the save location and filename
save_location = 'src/public/documents/'
filename = f"{sys.argv[1]}-{current_date}.docx"
full_path = save_location + filename

# Define the context for rendering
context = {
    'greeting': "Hello world",
    'name': sys.argv[1],
    'address': "Test Quote",
    'heading': 100,
    'description': 100,
}

# Render the template with the context
doc.render(context)

# Save the document with the specified filename and location
doc.save(full_path)

print('Document created successfully')
