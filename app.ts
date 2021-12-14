require('dotenv').config();

import "reflect-metadata";
import * as express from 'express';
import * as cors from 'cors';
import * as moment from 'moment-timezone'
import { routes } from './src/routes';
import { CONFIG } from './src/config';
import { connect as mongooseConnect } from 'mongoose';
import { onError } from "./src/common/functions/on-error";
import * as fileUpload from 'express-fileupload';

console.log('Initializing...');

const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.options("*", cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(fileUpload({
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: true,
    abortOnLimit: true,
    limits: {
        fileSize: 16 * 1024 * 1024 * 1024 // 16 MB
    }
}));

moment.tz.setDefault('Etc/UTC');

app.use('/files', express.static(`${process.cwd()}/files`));
app.use(routes);

mongooseConnect(`mongodb://${CONFIG.DB_HOST}:${CONFIG.DB_PORT}/${CONFIG.DB_NAME}`, {
    authSource: 'admin',
    user: CONFIG.DB_USER,
    pass: CONFIG.DB_PASSWORD,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
});

app.use(onError);

app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`Running on http://${CONFIG.HOST}:${CONFIG.PORT}`);
});