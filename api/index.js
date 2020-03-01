const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const puppeteer = require('puppeteer')
const config = require('./env')

app.use(bodyParser.json())

app.post('/cotoha_parse', function(req, res) {
  const tokenUrl = 'https://api.ce-cotoha.com/v1/oauth/accesstokens'

  const tokenHeaders = {
    'Content-Type': 'application/json',
    charset: 'UTF-8'
  }

  const tokenData = {
    grantType: 'client_credentials',
    clientId: config.client_id,
    clientSecret: config.client_secret
  }

  fetch(tokenUrl, {
    method: 'POST',
    headers: tokenHeaders,
    body: JSON.stringify(tokenData)
  })
    .then((tokenRes) => tokenRes.json())
    .then((tokenJson) => {
      const accessToken = tokenJson.access_token

      const url = 'https://api.ce-cotoha.com/api/dev/nlp/v1/parse'

      const headers = {
        'Content-Type': 'application/json',
        charset: 'UTF-8',
        Authorization: `Bearer ${accessToken}`
      }

      const data = {
        sentence: req.body.sentence,
        type: 'default'
      }

      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })
        .then((r) => r.json())
        .then((json) => {
          res.send(JSON.stringify(json, null, '\t'))
        })
    })
})

app.get('/search_color_code', async function(req, res) {
  // ブラウザ起動と設定
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true
  })

  const page = await browser.newPage()

  let title = null
  const keyword = req.query.keyword
  try {
    // キーワードに ` 色 コード` を付与してググる
    await page.goto('https://www.google.co.jp', {
      waitUntil: 'networkidle2',
      timeout: 4000
    })
    await page.waitFor('input[name=q]')
    await page.type('input[name=q]', keyword + ' 色 コード')
    await page.keyboard.press('Enter')

    // 検索結果からキーワードと16進カラーコードを含むタイトルを決定する.
    await page.waitForSelector('h3', {
      waitUntil: 'networkidle2',
      timeout: 2000
    })
    const elems = await page.$$('h3')
    for (const elem of elems) {
      const jsHandle = await elem.getProperty('textContent')
      const text = await jsHandle.jsonValue()
      if (text.match(new RegExp(keyword)) && text.match(/#[0-9A-Fa-f]{6}/)) {
        title = text
        break
      }
    }
  } catch (e) {
    await browser.close()
    // process.exit(200)
    res.send(null)
  }

  await browser.close()
  res.send(title)
})

module.exports = {
  path: '/api/',
  handler: app
}
