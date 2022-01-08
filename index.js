import express from 'express';
import axios from 'axios';
import cors from 'cors';
import download from 'image-downloader';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const app = express();
const router = express.Router();
dotenv.config();

app.set('port', process.env.PORT || 8081);

app.use(router);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const imgpath = './img';

if (!fs.existsSync(imgpath)) {
    fs.mkdir(imgpath);
}

router.get('/', (req, res) => {
    res.send('ADOP API Index');
});

router.get('/api/', (req, res) => {
    // TODO: Cronjob

    const downloadImage = (response) => {
        const dir = `${imgpath}/${response.data.date}/`;
        
        if (!fs.existsSync(dir)) {
            fs.mkdir(dir);
        }

        const options = {
            url: response.data.url,
            dest: dir,
        };
    
        const optionshd = {
            url: response.data.hdurl,
            dest: dir,
        };

        download.image(options);
        download.image(optionshd);
        fs.writeFileSync(`${dir}/${response.data.date}.json`, JSON.stringify(response.data));
    };

    axios({
        url: `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`,
        method: 'get'
    }).then((response) => {
        downloadImage(response);
        res.json({
            message: 'Image downloaded',
            url: response.data.url
        });
    }).catch((err) => {
        console.error(err);
        res.send('Error.');
    });
});

app.listen(app.get('port'), () => {
    console.log(`Server is listening on http://localhost:${app.get('port')}`);
});

