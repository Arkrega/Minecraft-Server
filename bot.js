const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const express = require('express')

const app = express()
const PORT = process.env.PORT || 8080

app.get('/', (req, res) => {
  res.send('Bot is running')
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server active on port ${PORT}`)
})

const botArgs = {
  host: 'mother-elsewhere.gl.joinmc.link',
  port: 25565,
  username: 'RegaBot',
  version: '1.21'
}

let bot
let sedangProsesTidur = false
const pesanRandom = [
  'Lagi afk bentar ya guys',
  'Servernya seru juga nih',
  'Alpine dan Farma kacung arka doang njir',
  'Alpine epeop',
  'Gw gak di ajak kah?',
  'Rega lagi di mana ya?',
  'Wah mapnya luas banget',
  'Ada yang mau trade barang?'
]

function createBot() {
  bot = mineflayer.createBot(botArgs)
  bot.setMaxListeners(0)
  bot.loadPlugin(pathfinder)

  bot.on('spawn', () => {
    console.log('STATUS: Bot berhasil masuk ke server')
    const defaultMove = new Movements(bot)
    bot.pathfinder.setMovements(defaultMove)
    sedangProsesTidur = false
    startAntiAFK()
    startAutoChat()
  })

  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    
    const pesan = message.toLowerCase()
    let balasan = ''
    
    if (pesan.includes('halo') || pesan.includes('hi') || pesan.includes('hello')) {
      balasan = 'Halo juga!'
    } else if (pesan.includes('rega')) {
      balasan = 'Ya ada apa panggil namaku?'
    } else if (pesan.includes('p') && pesan.length === 1) {
      balasan = 'Kenapa bang?'
    } else if (pesan.includes('siapa')) {
      balasan = 'Aku RegaBot salam kenal'
    }
    
    if (balasan) {
      setTimeout(() => {
        bot.chat(balasan)
      }, 2000 + Math.random() * 3000)
    }
  })

  bot.on('time', () => {
    const waktu = bot.time.timeOfDay
    if (waktu >= 13000 && waktu <= 23000) {
      if (!bot.isSleeping && !sedangProsesTidur && !bot.pathfinder.isMoving()) {
        goToSleep()
      }
    } else {
      if (bot.isSleeping) {
        bot.wake()
      }
      sedangProsesTidur = false
    }
  })

  bot.on('sleep', () => {
    sedangProsesTidur = true
    console.log('INFO: Bot sedang tidur')
  })

  bot.on('kicked', (reason) => {
    console.log('LOG: Bot dikeluarkan. Alasan: ' + reason)
    setTimeout(createBot, 10000)
  })

  bot.on('error', (err) => {
    console.log('ERROR: Terjadi masalah koneksi: ' + err.message)
    setTimeout(createBot, 10000)
  })

  bot.on('end', () => {
    console.log('LOG: Koneksi terputus. Mencoba masuk kembali...')
    setTimeout(createBot, 10000)
  })
}

function startAutoChat() {
  setInterval(() => {
    if (bot.isSleeping || sedangProsesTidur) return
    const teks = pesanRandom[Math.floor(Math.random() * pesanRandom.length)]
    bot.chat(teks)
  }, 600000 + Math.random() * 300000)
}

function startAntiAFK() {
  setInterval(() => {
    if (bot.pathfinder.isMoving() || bot.isSleeping || sedangProsesTidur) return
    
    const aksi = Math.floor(Math.random() * 8)
    
    if (aksi === 0) {
      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * Math.PI
      bot.look(yaw, pitch)
    } else if (aksi === 1) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 500)
    } else if (aksi === 2) {
      bot.setControlState('sneak', true)
      setTimeout(() => bot.setControlState('sneak', false), 1000)
    } else if (aksi === 3) {
      bot.swingArm()
    } else if (aksi === 4) {
      const slot = Math.floor(Math.random() * 9)
      bot.setQuickBarSlot(slot)
    } else if (aksi === 5) {
      bot.setControlState('forward', true)
      setTimeout(() => {
        bot.setControlState('forward', false)
        bot.setControlState('back', true)
        setTimeout(() => bot.setControlState('back', false), 500)
      }, 500)
    } else if (aksi === 6) {
      bot.setControlState('left', true)
      setTimeout(() => bot.setControlState('left', false), 400)
    } else if (aksi === 7) {
      bot.setControlState('right', true)
      setTimeout(() => bot.setControlState('right', false), 400)
    }
  }, 10000 + Math.random() * 10000)
}

async function goToSleep() {
  const bed = bot.findBlock({
    matching: block => bot.isABed(block),
    maxDistance: 5
  })
  
  if (bed) {
    sedangProsesTidur = true
    try {
      const goal = new goals.GoalGetToBlock(bed.position.x, bed.position.y, bed.position.z)
      await bot.pathfinder.goto(goal)
      await bot.lookAt(bed.position.offset(0.5, 0.5, 0.5))
      await bot.sleep(bed)
    } catch (err) {
      try {
        await bot.activateBlock(bed)
      } catch (e) {
        sedangProsesTidur = false
      }
    }
  }
}

createBot()

