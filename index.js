const news = require('./allnews');
const bodyParser = require('body-parser');
const express = require('express');
const consolidate = require('consolidate');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true,
}));

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname,'views'));

app.get('/', (req, res)=>{
  res.render('form')
})

let src = '';
let newsQty = '';
app.post('/', (req, res)=>{
  src = req.body.src;
  newsQty = +req.body.newsQtyInput -1;
  res.redirect('/news');
})

app.get('/news', async (req, res)=>{
  const receivedNews = await news.news(src);
  const newsArray = []
  if (newsQty > receivedNews.length-1){
    newsQty = receivedNews.length-1
  }
  for (let i=0; i<= newsQty; i++) {
    newsArray.push(receivedNews[i])
  }
  res.render('news', {news:newsArray})
})

app.listen(8888);