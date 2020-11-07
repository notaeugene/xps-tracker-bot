const got = require('got')
const cheerio = require('cheerio')

const { UP2DATE_URL } = process.env

const http = got.extend({
  prefixUrl: UP2DATE_URL
});

const Consoles = {
  XBOX_SERIES_X: 'XBOX_SERIES_X',
  XBOX_SERIES_S: 'XBOX_SERIES_S',
  PLAYSTATION_5: 'PLAYSTATION_5',
  PLAYSTATION_5_DIGITAL: 'PLAYSTATION_5_DIGITAL',
}

class Scrapper {
  async getAll() {
    const consoleStatuses = Object.keys(Consoles)
      .map(consoleModel => this.getByConsole(consoleModel))
    const dividerStr = '\n---------------------------\n'

    return (await Promise.all(consoleStatuses)).join(dividerStr)
  }

  async getByConsole(consoleModel) {
    let slug;
    let title;

    switch (consoleModel) {
      case Consoles.XBOX_SERIES_X:
        slug = 'microsoft-xbox-series-x-1tb';
        title = 'Xbox Series X'
        break;
      case Consoles.XBOX_SERIES_S:
        slug = 'microsoft-xbox-series-s-512gb'
        title = 'Xbox Series S'
        break;
      case Consoles.PLAYSTATION_5:
        slug = 'sony-playstation-5-white-1tb';
        title = 'PlayStation 5'
        break;
      case Consoles.PLAYSTATION_5_DIGITAL:
        slug = 'sony-playstation-5-white-1tb-digital-edition'
        title = 'PlayStation 5 Digital Edition'
        break;
      default:
        throw new Error('Invalid console type.')
    }

    const pagePath = `${slug}.html`
    const res = await http(pagePath)

    const $ = cheerio.load(res.body)
    const $btnCart = $('#button-cart')
    const $price = $('.product-page-price');

    const price = $price.text()
    const inStock = $btnCart.text() !== 'Предзаказ'
    const productUrl = `${UP2DATE_URL}/${pagePath}`

    return this.generateConsoleMessage({
      title,
      price,
      inStock,
      productUrl
    })
  }

  generateConsoleMessage({
    title,
    price,
    inStock,
    productUrl
  }) {
    return `🏷Product: ${title}\n💰Price: ${price}\n${inStock ? '✅' : '⛔'}In Stock: ${inStock}\n🔗Link: ${productUrl}`
  }
}

exports.Scrapper = Scrapper
exports.Consoles = Consoles