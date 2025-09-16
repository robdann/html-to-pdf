import express from 'express';
import {chromium} from "playwright-core";
import morgan from "morgan";

const app = express();
app.use(morgan('combined'));
app.use(express.json());
app.post('/', async (req, res) => {
    const {url} = req.body;

    const html = await fetch(url);
    if (!html.ok) {
        console.warn(`Could not find html from ${url}`);
        res.status(400);
        return;
    }

    const browser = await chromium.launch({
        headless: true
    });
    try {
        const page = await browser.newPage();
        console.log("html-to-pdf", url);
        await page.goto(url);
        console.log("html-to-pdf", 'waitForLoadState', 'networkidle');
        await page.waitForLoadState('networkidle', {timeout: 10000});
        console.log("html-to-pdf", 'pdf');
        const buffer = await page.pdf({displayHeaderFooter: false});
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Length', `${buffer.length}`);
        console.log("html-to-pdf", 'send');
        res.send(buffer);
    } catch (e) {
        console.log(e);
        console.log(e.stack);
        res.status(500).send({error: e.message});
    } finally {
        await browser.close();
    }
})

app.listen(process.env.PORT || 8080, async () => {
    console.log("html-to-pdf listening for inputs!");

    const response = await fetch('http://afyaca-server.railway.internal:8080');
    console.log(response.statusText);

});
