import csv
from io import StringIO
import sys

def read_csv(csv_data):
    try:
        csv_content = csv_data['buffer'].decode('utf-8')
        print(f'csv_content={csv_content}')
        # # Assuming csv_data is a dictionary with buffer key
        # csv_content = csv_data['buffer'].decode('utf-8')
        # csv_reader = csv.DictReader(StringIO(csv_content))

        # # Process CSV rows and convert them to a list of dictionaries
        # rows = []
        # for row in csv_reader:
        #     # Convert keys to lowercase
        #     lowercase_row = {key.lower(): value for key, value in row.items()}
        #     rows.append(lowercase_row)
        #     # Print the original row if needed
        #     print(row)

        # print("CSV file successfully read and processed.")
        # return rows
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return []

try:
    arg_json = sys.argv[1]
    generated_tasks = read_csv(arg_json)
    print(generated_tasks)
except IndexError:
    print("No argument provided.")
