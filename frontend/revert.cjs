const fs = require('fs');
const readline = require('readline');

async function revertChanges() {
  const logPath = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\61ab2e6b-dc62-4eee-b12c-50d250119a2d\\.system_generated\\logs\\transcript_full.jsonl';
  
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const targetFiles = [
    'c:\\Users\\ASUS\\Desktop\\Sandhya\\frontend\\src\\index.css',
    'c:\\Users\\ASUS\\Desktop\\Sandhya\\frontend\\src\\layouts\\MainLayout.jsx',
    'c:\\Users\\ASUS\\Desktop\\Sandhya\\frontend\\src\\pages\\Dashboard.jsx',
    'c:\\Users\\ASUS\\Desktop\\Sandhya\\frontend\\src\\pages\\Dashboard.css',
    'c:\\Users\\ASUS\\Desktop\\Sandhya\\frontend\\src\\pages\\Auth.css'
  ];

  const originalContents = {};

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.tool_calls) {
        for (const call of entry.tool_calls) {
          if (call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
            const file = call.args.TargetFile;
            // Capture only the FIRST time we edited the file, which contains the original TargetContent before our changes
            if (targetFiles.includes(file) && !originalContents[file]) {
              originalContents[file] = call.args.TargetContent;
            }
          }
        }
      }
    } catch (e) {
      // ignore JSON parse errors
    }
  }

  // Write original contents back
  for (const [file, content] of Object.entries(originalContents)) {
    console.log(`Reverting ${file}`);
    
    // For replace_file_content, TargetContent is just the chunk, 
    // but wait, did I use replace_file_content with StartLine=1 and EndLine=<EOF>?
    // Yes, I replaced the entire files! So TargetContent is the full original content.
    fs.writeFileSync(file, content);
  }
}

revertChanges().catch(console.error);
