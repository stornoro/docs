const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');
require('dotenv').config();

const PORT = process.env.WEBHOOK_PORT || 9903;
const SECRET = process.env.WEBHOOK_SECRET || '';
const TARGET_BRANCH = 'refs/heads/main';

let deploying = false;

function verifySignature(payload, signature) {
    if (!SECRET) return true;
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const signature = req.headers['x-hub-signature-256'];
                if (SECRET && (!signature || !verifySignature(body, signature))) {
                    console.warn('Invalid webhook signature');
                    res.writeHead(401);
                    res.end('Unauthorized\n');
                    return;
                }

                const payload = JSON.parse(body);
                const branch = payload.ref;

                if (branch !== TARGET_BRANCH) {
                    console.log(`Push to ${branch} ignored.`);
                    res.writeHead(200);
                    res.end('Ignored.\n');
                    return;
                }

                if (deploying) {
                    console.log('Deploy already in progress, skipping.');
                    res.writeHead(200);
                    res.end('Deploy already in progress.\n');
                    return;
                }

                deploying = true;
                console.log(`Push detected to ${branch}. Running deployment script...`);

                exec('/storage/www/storno/docs/deploy.sh', (err, stdout, stderr) => {
                    deploying = false;
                    if (err) {
                        console.error('Deploy failed:', stderr);
                    } else {
                        console.log('Deploy complete:', stdout);
                    }
                });

                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Deploy started.\n');
            } catch (e) {
                console.error('Failed to parse payload:', e);
                res.writeHead(400);
                res.end('Invalid payload\n');
            }
        });
    } else {
        res.writeHead(405);
        res.end('Method Not Allowed\n');
    }
}).listen(PORT, () => {
    console.log(`Webhook listener running on port ${PORT}`);
});
