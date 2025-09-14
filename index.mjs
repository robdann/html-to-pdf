import express from 'express';
import {chromium} from "playwright-core";
import morgan from "morgan";

const app = express();
app.use(morgan());
app.use(express.json());
app.post('/', async (req, res) => {
    const {url} = req.body;
    const browser = await chromium.launch({
        headless: true
    });
    try {
        const page = await browser.newPage();
        await page.goto(url);
        const buffer = await page.pdf({displayHeaderFooter: false});
        res.set('Content-Type', 'application/pdf');
        res.send(buffer);
    } catch (e) {
        res.status(500).send({error: e});
    } finally {
        await browser.close();
    }
})

app.listen(process.env.PORT || 8080, () => {
    console.log("html-to-pdf listening for inputs!");
});
