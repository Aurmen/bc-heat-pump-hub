import json
import csv
import io
import re

JSONL_PATH = r'C:\Users\Jaret\.claude\projects\C--Users-Jaret\bca0c565-a84b-464e-ae1f-3d729981487b.jsonl'

HEADER = 'Company_Name,Phone,Website,Email,City,Province,Service_Area_Cities,Brands_Installed,Services,Google_Maps_Link,Notes,Verification_Status'

with open(JSONL_PATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Collect all assistant message text blocks
all_text_blocks = []
for raw in lines:
    try:
        data = json.loads(raw)
        if not isinstance(data, dict):
            continue
        msg = data.get('message', {})
        if msg.get('role') != 'assistant':
            continue

        content = msg.get('content', '')
        if isinstance(content, list):
            text = '\n'.join(
                item.get('text', '')
                for item in content
                if isinstance(item, dict) and item.get('type') == 'text'
            )
        else:
            text = str(content)

        if 'Company_Name' in text and 'Verification_Status' in text:
            all_text_blocks.append(text)
    except Exception:
        pass

print(f'Found {len(all_text_blocks)} assistant messages with CSV data')

# Extract all CSV rows from all blocks
# Strategy: find header line, then collect rows until blank line or markdown marker
seen_companies = {}
all_rows = []

for block_idx, text in enumerate(all_text_blocks):
    text_lines = text.split('\n')
    in_csv = False
    current_csv_lines = []

    for line in text_lines:
        stripped = line.strip()

        if 'Company_Name' in stripped and 'Phone' in stripped and 'Verification_Status' in stripped:
            # Save previous block if any
            if current_csv_lines:
                csv_text = '\n'.join(current_csv_lines)
                try:
                    reader = csv.reader(io.StringIO(csv_text))
                    for row in reader:
                        if len(row) >= 6 and row[0] and row[0] != 'Company_Name':
                            company = row[0].strip()
                            city = row[4].strip() if len(row) > 4 else ''
                            key = f"{company}|{city}"
                            if key not in seen_companies:
                                seen_companies[key] = True
                                all_rows.append(row)
                except Exception as e:
                    print(f"CSV parse error: {e}")
            in_csv = True
            current_csv_lines = [HEADER]

        elif in_csv:
            # Stop on empty line or markdown markers
            if (not stripped or
                stripped.startswith('#') or
                stripped.startswith('---') or
                stripped.startswith('**Phase') or
                stripped.startswith('```') or
                (stripped.startswith('*') and not '+1-' in stripped and len(stripped) < 5)):
                if current_csv_lines:
                    csv_text = '\n'.join(current_csv_lines)
                    try:
                        reader = csv.reader(io.StringIO(csv_text))
                        for row in reader:
                            if len(row) >= 6 and row[0] and row[0] != 'Company_Name':
                                company = row[0].strip()
                                city = row[4].strip() if len(row) > 4 else ''
                                key = f"{company}|{city}"
                                if key not in seen_companies:
                                    seen_companies[key] = True
                                    all_rows.append(row)
                    except Exception as e:
                        print(f"CSV parse error: {e}")
                    current_csv_lines = []
                in_csv = False
            else:
                current_csv_lines.append(line)

    # Don't forget the last block
    if current_csv_lines:
        csv_text = '\n'.join(current_csv_lines)
        try:
            reader = csv.reader(io.StringIO(csv_text))
            for row in reader:
                if len(row) >= 6 and row[0] and row[0] != 'Company_Name':
                    company = row[0].strip()
                    city = row[4].strip() if len(row) > 4 else ''
                    key = f"{company}|{city}"
                    if key not in seen_companies:
                        seen_companies[key] = True
                        all_rows.append(row)
        except Exception as e:
            print(f"CSV parse error: {e}")

print(f'Total unique rows extracted: {len(all_rows)}')
print('\nSample rows:')
for row in all_rows[:5]:
    print(f'  {row[0]} | {row[4]} | {row[11] if len(row) > 11 else "?"}')

# Save to CSV
output_path = r'C:\Users\Jaret\bc-heat-pump-hub\scripts\bc_contractors_master.csv'
with open(output_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(HEADER.split(','))
    writer.writerows(all_rows)

print(f'\nSaved to {output_path}')
