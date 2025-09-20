import express from 'express';
import {chromium} from "playwright-core";
import morgan from "morgan";

const app = express();
app.use(morgan('combined'));
app.use(express.json());
app.use(express.text({
    type: 'text/html',
}));
app.use(express.raw());

app.post('/', async (req, res) => {
    const text = req.body;

    const tempApp = express();
    tempApp.get(`/doc.html`, (req, res) => {
        res.status(200).send(text);
    });
    await new Promise((resolve, reject) => {
        const tempServer = tempApp.listen(0, async () => {
            const url = `http://localhost:${tempServer.address().port}/doc.html`;
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
                resolve();
            }
        })
    });
})

app.listen(process.env.PORT || 8080, async () => {
    console.log("html-to-pdf listening for inputs!");

});
