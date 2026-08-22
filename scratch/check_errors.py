import py_compile
import glob
import os

python_files = glob.glob('backend/**/*.py', recursive=True) + glob.glob('ml/**/*.py', recursive=True)
errors = []

for filepath in python_files:
    try:
        py_compile.compile(filepath, doraise=True)
    except py_compile.PyCompileError as e:
        errors.append((filepath, str(e)))

print(f"Scanned {len(python_files)} Python files.")
if errors:
    print("Found syntax errors:")
    for err in errors:
        print(f"- {err[0]}: {err[1]}")
else:
    print("Zero Python syntax errors found!")
