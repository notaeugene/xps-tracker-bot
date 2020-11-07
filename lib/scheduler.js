const CronJob = require('cron').CronJob;
const { Extra } = require('telegraf')

class Scheduler {
  constructor(telegram, scrapper, db) {
    this.telegram = telegram 
    this.scrapper = scrapper
    this.db = db
  }

  schedule() {
    const job = new CronJob('0 0 19 * * *', async () => {
      const users = this.db.collection('users')
      const userList = await users.find({}).toArray()

      const statusText = await this.scrapper.getAll()
      userList.forEach(
        user => this.telegram.sendMessage(
          user.chatId,
          statusText,
          Extra.webPreview(false)
        )
      )
    }, null, false, 'Europe/Kiev');
    job.start()
  }
}

module.exports = Scheduler