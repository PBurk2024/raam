import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());

app.get('/api/trackleaders', async (req, res) => {
    try {
        const url = 'https://trackleaders.com/raam25i.php?name=Team_No_Limits';

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(3000);

        const miles = await page.evaluate(() => {
            const cell = document.evaluate(
                '/html/body/center/div[3]/div[3]/div/div[2]/div[2]/table/tbody/tr[4]/td[2]',
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            return cell ? parseFloat(cell.textContent.trim()) : null;
        });

        await browser.close();

        if (!miles) {
            return res.status(500).json({ error: 'Could not extract miles' });
        }

        res.json({ miles: miles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
