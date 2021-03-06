import fs from 'fs';
import express from 'express';
import cookieParser from 'cookie-parser';
import Handlebars from 'handlebars';
import paths from '../../scripts/paths';
import createSsrHandler from './handlers/createSsrHandler';
import createAmpHandler from './handlers/createAmpHandler';
import steemAPI from './steemAPI';

const request = require('request');

const indexPath = `${paths.templates}/index.hbs`;
const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const template = Handlebars.compile(indexHtml);

const ampIndexPath = `${paths.templates}/amp_index.hbs`;
const ampIndexHtml = fs.readFileSync(ampIndexPath, 'utf-8');
const ampTemplate = Handlebars.compile(ampIndexHtml);

const ssrHandler = createSsrHandler(template);
const ampHandler = createAmpHandler(ampTemplate);

const CACHE_AGE = 1000 * 60 * 60 * 24 * 7;

const app = express();

const IS_DEV = process.env.NODE_ENV === 'development';
const GIFT_GIVER_KEY = process.env.GIFT_GIVER_KEY || 'API_KEY';

app.use(cookieParser());

if (IS_DEV) {
  app.use(express.static(paths.publicRuntime(), { index: false }));
} else {
  app.use(express.static(paths.buildPublicRuntime(), { maxAge: CACHE_AGE, index: false }));
}

app.get('/callback', (req, res) => {
  const accessToken = req.query.access_token;
  const expiresIn = req.query.expires_in;
  const state = req.query.state;
  const next = state && state[0] === '/' ? state : '/';
  if (accessToken && expiresIn) {
    res.cookie('access_token', accessToken, { maxAge: expiresIn * 1000 });
    res.redirect(next);
  } else {
    res.status(401).send({ error: 'access_token or expires_in Missing' });
  }
});

app.get('/i/@:referral', async (req, res) => {
  try {
    const { referral } = req.params;

    const accounts = await steemAPI.sendAsync('get_accounts', [[referral]]);
    if (accounts[0]) {
      res.cookie('referral', referral, { maxAge: 86400 * 30 * 1000 });
      res.redirect('/');
    }
  } catch (err) {
    res.redirect('/');
  }
});

app.get('/i/:parent/@:referral/:permlink', async (req, res) => {
  try {
    const { parent, referral, permlink } = req.params;

    const content = await steemAPI.sendAsync('get_content', [referral, permlink]);

    if (content.author) {
      res.cookie('referral', referral, { maxAge: 86400 * 30 * 1000 });
      res.redirect(`/${parent}/@${referral}/${permlink}`);
    } else {
      res.redirect('/');
    }
  } catch (err) {
    res.redirect('/');
  }
});

app.get('/@:author/:permlink/amp', ampHandler);
app.get('/:category/@:author/:permlink/amp', (req, res) => {
  const { author, permlink } = req.params;
  res.redirect(301, `/@${author}/${permlink}/amp`);
});
app.get('/:category/@:author/:permlink', (req, res) => {
  const { author, permlink } = req.params;
  res.redirect(301, `/@${author}/${permlink}`);
});

// add ssr api for gift-giver
app.post('/partnerSubmit/@:account', (req, res) => {

  // get user account to delegate to
  const { account } = req.params;
  // get gift giver API key
  const form = {key: GIFT_GIVER_KEY, user: account};

  // define gift giver API URL and header-content
  const url = 'https://giftgiver.me/partnerSubmit';
  const headers = {'Content-Type': 'application/x-www-form-urlencoded'}

  // submit post request to gift-giver
  request.post({ url: url, form: form, headers: headers}, function (e, r, body) {
      res.status(200).send(body);
  });

});
app.get('/*', ssrHandler);

export default app;
