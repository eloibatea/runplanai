const fs = require('fs');
const path = require('path');

function convertAttributes(html) {
    html = html.replace(/class="/g, 'className="');
    html = html.replace(/viewbox="/g, 'viewBox="');
    html = html.replace(/stroke-width=/g, 'strokeWidth=');
    html = html.replace(/stroke-dasharray=/g, 'strokeDasharray=');
    html = html.replace(/stroke-dashoffset=/g, 'strokeDashoffset=');
    html = html.replace(/stroke-linecap=/g, 'strokeLinecap=');
    html = html.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
    html = html.replace(/<!--/g, '{/*');
    html = html.replace(/-->/g, '*/}');
    
    // Self-closing tags
    const replaceSelfClosing = (tag) => {
        const regex = new RegExp(`<${tag}\\s+([^>]+)>`, 'g');
        html = html.replace(regex, (match, content) => {
            if (!content.endsWith('/')) {
                return `<${tag} ${content} />`;
            }
            return match;
        });
    };
    
    replaceSelfClosing('img');
    replaceSelfClosing('input');
    replaceSelfClosing('circle');
    replaceSelfClosing('path');
    replaceSelfClosing('line');
    
    html = html.replace(/<br\s*>/g, '<br />');
    
    // Style attributes
    html = html.replace(/style="([^"]*)"/g, (match, p1) => {
        // basic conversion, assumes simple styles like width: 100%
        let styleStr = p1.replace(/width:\s*([^;]+);?/g, 'width: "$1",');
        // remove trailing comma
        styleStr = styleStr.replace(/,$/, '');
        return `style={{${styleStr}}}`;
    });

    return html;
}

function extractMain(html) {
    const mainRegex = /<main[^>]*>([\s\S]*?)<\/main>/;
    const match = html.match(mainRegex);
    
    if (match) {
        const mainTagRegex = /<main[^>]*>/;
        let mainTag = html.match(mainTagRegex)[0];
        mainTag = convertAttributes(mainTag);
        
        let inner = convertAttributes(match[1]);
        return `${mainTag}\n${inner}\n</main>`;
    }
    return "<div>Error</div>";
}

function processFile(fileName, componentName) {
    const filePath = path.join('runplanai-designs', fileName);
    if (!fs.existsSync(filePath)) {
        console.log(`File ${filePath} not found.`);
        return;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    const jsx = extractMain(html);
    
    const componentCode = `import React from 'react';

export default function ${componentName}() {
  return (
    <>
      ${jsx}
    </>
  );
}
`;
    fs.writeFileSync(path.join('src', 'pages', `${componentName}.jsx`), componentCode, 'utf-8');
    console.log(`Converted ${fileName} successfully.`);
}

if (!fs.existsSync(path.join('src', 'pages'))) {
    fs.mkdirSync(path.join('src', 'pages'), { recursive: true });
}

processFile('dashboard.html', 'Dashboard');
processFile('calendario.html', 'Calendario');
processFile('objetivos.html', 'Objetivos');
processFile('perfil.html', 'Perfil');
