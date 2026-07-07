const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = 'Backend/src/main/java/swp391/group6';
const folders = ['controller', 'service', 'model', 'repository'];

function getGitInfo(filePath) {
    try {
        // Get the first commit (Created)
        const firstCommitLog = execSync(`git log --reverse --format="%an|%ad" --date=short -- "${filePath}"`).toString().trim().split('\n')[0];
        // Get the last commit (Last Change)
        const lastCommitLog = execSync(`git log -1 --format="%an|%ad" --date=short -- "${filePath}"`).toString().trim();
        
        const [author, createdDate] = firstCommitLog ? firstCommitLog.split('|') : ['Unknown', 'Unknown'];
        const [lastChangeAuthor, lastChangeDate] = lastCommitLog ? lastCommitLog.split('|') : [author, createdDate];
        
        return { author, createdDate, lastChangeAuthor, lastChangeDate };
    } catch (e) {
        return { author: 'Unknown', createdDate: 'Unknown', lastChangeAuthor: 'Unknown', lastChangeDate: 'Unknown' };
    }
}

function processFolder(folderPath) {
    const fullPath = path.join(__dirname, baseDir, folderPath);
    if (!fs.existsSync(fullPath)) return;
    
    const files = fs.readdirSync(fullPath);
    for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processFolder(path.join(folderPath, file));
        } else if (file.endsWith('.java')) {
            const relPath = path.join(baseDir, folderPath, file).replace(/\\/g, '/');
            const { author, createdDate, lastChangeAuthor, lastChangeDate } = getGitInfo(relPath);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Avoid duplicate headers if we run this multiple times
            if (content.includes('* Author:') && content.includes('* Created Date:')) {
                continue;
            }

            const header = `/*
 * Author: ${author}
 * Created Date: ${createdDate}
 * Name: ${file}
 * Description: 
 * Last Change Author: ${lastChangeAuthor}
 * Last Change Date: ${lastChangeDate}
 */
`;
            fs.writeFileSync(filePath, header + content);
            console.log(`Processed ${relPath}`);
        }
    }
}

folders.forEach(processFolder);
console.log('Done.');
