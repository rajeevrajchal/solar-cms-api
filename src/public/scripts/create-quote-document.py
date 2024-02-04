
# import sys
# from datetime import datetime
# from docxtpl import DocxTemplate

# # Load the template document
# doc = DocxTemplate("src/public/docx-templates/standard-quote-template.docx")

# # Get the current date
# current_date = datetime.now().date()

# # Define the save location and filename
# save_location = 'src/public/documents/'
# filename = f"{sys.argv[1]}-{current_date}.docx"
# full_path = save_location + filename

# # Define the context for rendering
# context = {
#     'greeting': "Hello world",
#     'name': sys.argv[1],
#     'address': "Test Quote",
#     'heading': 100,
#     'description': 100,
# }

# # Render the template with the context
# doc.render(context)

# # Save the document with the specified filename and location
# doc.save(full_path)

# print('Document created successfully')


import sys
import os
from datetime import datetime
from docxtpl import DocxTemplate

def create_quote_document(name):
    # Load the template document
    doc = DocxTemplate("src/public/docx-templates/standard-quote-template.docx")

    # Get the current date
    current_date = datetime.now().date()

    # Define the save location and filename
    save_location = 'src/public/documents/'
    filename = f"{name.replace(' ', '-')}-{current_date}.docx"
    full_path = save_location + filename

    # Ensure that the directory exists
    os.makedirs(save_location, exist_ok=True)

    # Define the context for rendering
    context = {
        'greeting': "Hello world",
        'name': name,
        'address': "Test Quote",
        'heading': 100,
        'description': 100,
    }

    # Render the template with the context
    doc.render(context)

    # Save the document with the specified filename and location
    doc.save(full_path)

    return filename, full_path

if __name__ == "__main__":
    # Get the name from the command line arguments
    name = sys.argv[1]

    # Call the function and receive the returned values
    created_filename, created_full_path = create_quote_document(name)
    print(f'{created_full_path}')

    # print('Document created successfully')
    # print(f'Filename: {created_filename}')
    # print(f'Full path: {created_full_path}')
