const fs = require('fs');
const path = require('path');

const extractAssets = (filename, prefix) => {
  if (!fs.existsSync(filename)) return;
  console.log(`Processing ${filename}...`);
  let content = fs.readFileSync(filename, 'utf-8');
  let modified = false;

  // Extract CSS
  const styleRegex = /<style>([\s\S]*?)<\/style>/i;
  const styleMatch = content.match(styleRegex);
  if (styleMatch) {
    fs.mkdirSync('assets/css', { recursive: true });
    const cssPath = `assets/css/${prefix}.css`;
    fs.writeFileSync(cssPath, styleMatch[1].trim());
    console.log(`✅ Extracted CSS to ${cssPath}`);
    content = content.replace(styleRegex, `<link rel="stylesheet" href="${cssPath}">`);
    modified = true;
  }

  // Extract JS (finding the LAST script block before </body>)
  // We use a regex that captures the script block that contains our custom logic (usually at the bottom)
  // Let's find all script tags and extract the one that contains 'document.addEventListener' or similar
  const scripts = [...content.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
  
  if (scripts.length > 0) {
    // The last script block usually contains the main logic in these HTML files
    const lastScript = scripts[scripts.length - 1];
    
    // Make sure we are not extracting something trivial
    if (lastScript[1].length > 100) {
      fs.mkdirSync('assets/js', { recursive: true });
      const jsPath = `assets/js/${prefix}.js`;
      fs.writeFileSync(jsPath, lastScript[1].trim());
      console.log(`✅ Extracted JS to ${jsPath}`);
      
      const lastIdx = content.lastIndexOf(lastScript[0]);
      content = content.substring(0, lastIdx) + `<script src="${jsPath}"></script>` + content.substring(lastIdx + lastScript[0].length);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filename, content);
    console.log(`✅ Updated ${filename} to link to new assets.`);
  } else {
    console.log(`ℹ️ No large <style> or <script> blocks found in ${filename}.`);
  }
};

try {
  extractAssets('index.html', 'style');
  extractAssets('admin.html', 'admin');
  console.log("\n🎉 All files organized successfully!");
} catch (error) {
  console.error("❌ An error occurred:", error.message);
}
