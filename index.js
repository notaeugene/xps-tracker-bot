require('dotenv').config()

const { Telegraf, Extra } = require('telegraf')
const { MenuTemplate, MenuMiddleware } = require('telegraf-inline-menu')

const { Scrapper, Consoles } = require('./lib/scrapper')
const Scheduler = require('./lib/scheduler')
const connectDB = require('./lib/db')

const { TELEGRAM_BOT_TOKEN } = process.env

const bot = new Telegraf(TELEGRAM_BOT_TOKEN)
const menuTemplate = new MenuTemplate(() => 'Please, select one the following consoles:')

const commands = `
/help - show this message
/all - get the availability status for all consoles
/console - get the availability status by the specific console
`

const choices = {
  [Consoles.XBOX_SERIES_X]: 'Xbox Series X',
  [Consoles.XBOX_SERIES_S]: 'Xbox Series S',
  [Consoles.PLAYSTATION_5]: 'PlayStation 5',
  [Consoles.PLAYSTATION_5_DIGITAL]: 'PlayStation 5 Digital Edition',
}
menuTemplate.choose('unique', choices, {
  columns: 1,
	maxRows: 4,
  do: async ctx => {
    const consoleModel = ctx.match[1]
    const statusText = await ctx.analyzer.getByConsole(consoleModel)
    ctx.reply(statusText, Extra.webPreview(false))
    return false
  }
})

const bootstrap = async () => {
  bot.context.analyzer = new Scrapper()
  bot.context.db = await connectDB()

  const menuMiddleware = new MenuMiddleware('/', menuTemplate)
  const scheduler = new Scheduler(bot.telegram, bot.context.analyzer, bot.context.db)

  bot.start(async (ctx) => {
    const users = ctx.db.collection('users')
    await users.insertOne({ chatId: ctx.chat.id, name: ctx.chat.username })
    ctx.reply(`Welcome! This is the Xbox series X|S & PlayStation 5 availability analyzer bot.\nTo get started, enter "/help" command to see how to use the bot.`)
  })
  bot.use(menuMiddleware)
  bot.help((ctx) => ctx.reply(commands))

  bot.command('/all', async (ctx) => {
    const statusText = await ctx.analyzer.getAll()
    ctx.reply(statusText, Extra.webPreview(false))
  })
  bot.command('/console', async (ctx) => menuMiddleware.replyToContext(ctx))

  bot.launch()
  scheduler.schedule()
}

bootstrap()