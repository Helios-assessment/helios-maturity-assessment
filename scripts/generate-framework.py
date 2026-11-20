"""Regenerate src/data/framework.json from the HELIOS capability framework workbook.
Usage: python3 scripts/generate-framework.py path/to/Higher_Education_Capability_Framework_v2.xlsx
"""
import json, re, sys, openpyxl

wb = openpyxl.load_workbook(sys.argv[1])
ws = wb.worksheets[0]
layers = []
for row in ws.iter_rows(values_only=True):
    cells = [str(c).strip() for c in row if c is not None and str(c).strip()]
    if not cells:
        continue
    m = next((i for i, c in enumerate(cells) if re.fullmatch(r"Layer \d\d", c)), None)
    if m is not None:
        num = int(cells[m].split()[1])
        layers.append({"id": f"L{num:02d}", "number": num, "name": cells[m + 1], "dimensions": []})
    elif layers and not cells[0].startswith("~"):
        layer = layers[-1]
        dim_no = len(layer["dimensions"]) + 1
        layer["dimensions"].append({
            "id": f"{layer['id']}-D{dim_no}",
            "name": cells[0],
            "capabilities": cells[1:],
        })
assert len(layers) == 21, len(layers)
json.dump(layers, open("src/data/framework.json", "w"), indent=1, ensure_ascii=False)
print(len(layers), "layers,", sum(len(l["dimensions"]) for l in layers), "dimensions,",
      sum(len(d["capabilities"]) for l in layers for d in l["dimensions"]), "capabilities")
