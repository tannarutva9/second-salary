const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Helper to make HTTPS requests
function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log('===================================================');
  console.log('          🚀 SECOND SALARY — GITHUB PUSHER          ');
  console.log('===================================================');
  console.log('This script will transfer your files to GitHub without');
  console.log('needing local Git installed.');
  console.log('');

  const token = await ask('🔑 Enter GitHub Personal Access Token (PAT): ');
  if (!token.trim()) {
    console.error('❌ Token is required.');
    rl.close();
    return;
  }

  const owner = await ask('👤 Enter GitHub Username/Owner: ');
  if (!owner.trim()) {
    console.error('❌ Username is required.');
    rl.close();
    return;
  }

  const repo = await ask('📦 Enter Repository Name (e.g. second-salary): ');
  if (!repo.trim()) {
    console.error('❌ Repository name is required.');
    rl.close();
    return;
  }

  const isPrivateInput = await ask('🔒 Make repository private? (y/n, default: n): ');
  const isPrivate = isPrivateInput.toLowerCase().startsWith('y');

  console.log('\n📡 Checking if repository exists on GitHub...');
  
  const commonHeaders = {
    'Authorization': `token ${token.trim()}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'SecondSalary-Pusher'
  };

  // Check if repo exists
  let repoCheck = await request({
    hostname: 'api.github.com',
    path: `/repos/${owner.trim()}/${repo.trim()}`,
    method: 'GET',
    headers: commonHeaders
  });

  if (repoCheck.statusCode === 404) {
    console.log(`\n⚠️  Repository "${owner}/${repo}" not found on GitHub.`);
    const createRepo = await ask(`➕ Would you like me to automatically CREATE it for you? (y/n): `);
    
    if (createRepo.toLowerCase().startsWith('y')) {
      console.log('Creating repository...');
      let createRes = await request({
        hostname: 'api.github.com',
        path: '/user/repos',
        method: 'POST',
        headers: commonHeaders
      }, {
        name: repo.trim(),
        private: isPrivate,
        description: 'Second Salary — PRD Dashboard and specifications built with Antigravity.'
      });

      if (createRes.statusCode === 201) {
        console.log('✅ Repository created successfully!');
      } else {
        console.error('❌ Failed to create repository:', createRes.body);
        rl.close();
        return;
      }
    } else {
      console.log('❌ Stopped. Please create the repository manually first.');
      rl.close();
      return;
    }
  } else if (repoCheck.statusCode === 200) {
    console.log('✅ Repository found!');
  } else {
    console.error('❌ Failed to communicate with GitHub:', repoCheck.body);
    rl.close();
    return;
  }

  // Files to upload
  const filesToUpload = [
    { localPath: path.join(__dirname, 'index.html'), repoPath: 'index.html', message: 'feat: Add reactive PRD UI dashboard' },
    { localPath: path.join(__dirname, 'product_solutions.md'), repoPath: 'product_solutions.md', message: 'docs: Add PM specs and product solution document' }
  ];

  // Try to find the Home Page mockup
  const screenshotPath = 'C:\\Users\\abc\\.gemini\\antigravity\\brain\\132bf7b4-9830-466d-9f33-a3ec4863dac4\\second_salary_home_page_1779733495333.png';
  if (fs.existsSync(screenshotPath)) {
    filesToUpload.push({
      localPath: screenshotPath,
      repoPath: 'screenshots/home_page_mockup.png',
      message: 'assets: Add high-fidelity home page mobile mockup'
    });
  }

  console.log('\n📤 Uploading files to GitHub...');

  for (const file of filesToUpload) {
    if (!fs.existsSync(file.localPath)) {
      console.log(`⚠️  File not found locally, skipping: ${path.basename(file.localPath)}`);
      continue;
    }

    console.log(`- Uploading ${file.repoPath}...`);
    const content = fs.readFileSync(file.localPath);
    const contentBase64 = content.toString('base64');

    // Get current SHA if file exists to overwrite it
    let fileCheck = await request({
      hostname: 'api.github.com',
      path: `/repos/${owner.trim()}/${repo.trim()}/contents/${file.repoPath}`,
      method: 'GET',
      headers: commonHeaders
    });

    let sha = null;
    if (fileCheck.statusCode === 200) {
      sha = fileCheck.body.sha;
    }

    const payload = {
      message: file.message,
      content: contentBase64
    };
    if (sha) {
      payload.sha = sha;
    }

    let uploadRes = await request({
      hostname: 'api.github.com',
      path: `/repos/${owner.trim()}/${repo.trim()}/contents/${file.repoPath}`,
      method: 'PUT',
      headers: commonHeaders
    }, payload);

    if (uploadRes.statusCode === 200 || uploadRes.statusCode === 201) {
      console.log(`  ✅ Successfully uploaded ${file.repoPath}!`);
    } else {
      console.error(`  ❌ Failed to upload ${file.repoPath}:`, uploadRes.body);
    }
  }

  console.log('\n🎉 Finished pushing files to GitHub!');
  console.log(`🔗 View your repository here: https://github.com/${owner.trim()}/${repo.trim()}`);
  console.log('===================================================');

  rl.close();
}

main().catch(err => {
  console.error('❌ An error occurred:', err);
  rl.close();
});
