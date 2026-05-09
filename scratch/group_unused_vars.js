
import fs from 'fs';

const content = fs.readFileSync('unused-vars.txt', 'utf8');
const lines = content.split('\n');

let currentFile = '';
const unusedVarsByFile = {};

for (const line of lines) {
    if (line.startsWith('D:\\') || line.startsWith('d:\\')) {
        currentFile = line.trim();
    } else if (line.includes('no-unused-vars')) {
        if (!unusedVarsByFile[currentFile]) {
            unusedVarsByFile[currentFile] = [];
        }
        unusedVarsByFile[currentFile].push(line.trim());
    }
}

fs.writeFileSync('unused-vars-grouped.json', JSON.stringify(unusedVarsByFile, null, 2));
console.log('Grouped unused vars written to unused-vars-grouped.json');
