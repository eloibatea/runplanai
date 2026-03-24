import os
import re

def convert_attributes(html):
    html = html.replace('class="', 'className="')
    html = html.replace('viewbox="', 'viewBox="')
    html = html.replace('stroke-width=', 'strokeWidth=')
    html = html.replace('stroke-dasharray=', 'strokeDasharray=')
    html = html.replace('stroke-dashoffset=', 'strokeDashoffset=')
    html = html.replace('stroke-linecap=', 'strokeLinecap=')
    html = html.replace('stroke-linejoin=', 'strokeLinejoin=')
    html = html.replace('<!--', '{/*')
    html = html.replace('-->', '*/}')
    
    # Self-closing tags regex
    def replace_self_closing(match, tag_name):
        content = match.group(1)
        if not content.endswith('/'):
            return f'<{tag_name} {content} />'
        return match.group(0)
        
    html = re.sub(r'<img\s+([^>]+)>', lambda m: replace_self_closing(m, 'img'), html)
    html = re.sub(r'<input\s+([^>]+)>', lambda m: replace_self_closing(m, 'input'), html)
    html = re.sub(r'<circle\s+([^>]+)>', lambda m: replace_self_closing(m, 'circle'), html)
    html = re.sub(r'<path\s+([^>]+)>', lambda m: replace_self_closing(m, 'path'), html)
    html = re.sub(r'<line\s+([^>]+)>', lambda m: replace_self_closing(m, 'line'), html)
    html = re.sub(r'<br\s*>', '<br />', html)

    return html

def extract_main(html):
    match = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
    if match:
        main_tag = re.search(r'<main([^>]*)>', html).group(0)
        main_tag = convert_attributes(main_tag)
        inner = convert_attributes(match.group(1))
        # Handle style="" tags in React
        inner = re.sub(r'style="([^"]*)"', r'style={{\1}}', inner)
        inner = inner.replace('style={{width: 100%}}', 'style={{width: "100%"}}')
        inner = inner.replace('style={{width: 75%}}', 'style={{width: "75%"}}')
        inner = inner.replace('style={{width: 50%}}', 'style={{width: "50%"}}')
        inner = inner.replace('style={{width: 30%}}', 'style={{width: "30%"}}')
        inner = inner.replace('style={{width: 80%}}', 'style={{width: "80%"}}')
        return f"{main_tag}\n{inner}\n</main>"
    return "<div>Error</div>"

def process_file(file_name, component_name):
    path = os.path.join("runplanai-designs", file_name)
    if not os.path.exists(path):
        print(f"File {path} not found.")
        return
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    
    jsx = extract_main(html)
    
    component_code = f\"\"\"import React from 'react';

export default function {component_name}() {{
  return (
    <>
      {jsx}
    </>
  );
}}
\"\"\"
    with open(f"src/pages/{component_name}.jsx", "w", encoding="utf-8") as f:
        f.write(component_code)
        
os.makedirs("src/pages", exist_ok=True)
process_file("dashboard.html", "Dashboard")
process_file("calendario.html", "Calendario")
process_file("objetivos.html", "Objetivos")
process_file("perfil.html", "Perfil")
print("Conversion completed successfully.")
