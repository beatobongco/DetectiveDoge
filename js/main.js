//constants
var startingSpeed = 750
var speedDecrement = 50

var app = new Vue({
  el: '.app',
  data: {
    isLoaded: false,
    progress: 0,
    level: 1,
    score: 0,
    detectiveState: "stand",
    hint: "",
    counter: 0,
    lastShot: "",
    powerUpLocation: "",
    kills: 0
  },
  watch: {
    detectiveState: function(val) {
      if (val === this.powerUpLocation) {

        createjs.Sound.play("pistol")
        setTimeout(function() {
          createjs.Sound.play("wilhelm")
        }, 100)
        this.score += app.level * 5
        this.powerUpLocation = ""
        this.level--
        this.kills++
      }
    }
  },
})

//preload
var queue = new createjs.LoadQueue(true)
queue.installPlugin(createjs.Sound)
queue.on("complete", handleComplete)
queue.on("progress", handleProgress)
queue.loadFile({id: 'bgm', src: 'sound/fast_talkin.mp3'})
queue.loadFile({id: 'whoosh', src: 'sound/whoosh.mp3'})
queue.loadFile({id: 'pistol', src: 'sound/pistol.mp3'})
queue.loadFile({id: 'wilhelm', src: 'sound/wilhelm.mp3'})
queue.loadFile({id: 'woof', src: 'sound/woof.mp3'})
queue.loadFile({id: 'machineGun', src: 'sound/machine_gun.mp3'})
queue.loadFile({id: 'death', src: 'sound/death.mp3'})
queue.loadFile({id: 'ahooga', src: 'sound/ahooga.mp3'})
queue.loadFile("image/newspaper.jpg")
queue.loadFile("image/wall.jpg")
queue.loadFile("image/warnduck.png")
queue.loadFile("image/warnleft.png")
queue.loadFile("image/warnright.png")
queue.loadFile("image/mob.png")
queue.loadFile("image/headshot.png")

var gameLoop = null
var bgm = null

function handleProgress(e) {
  app.progress = Math.floor(e.progress * 100)
}

function handleComplete() {
  console.log("Loaded")
  app.isLoaded = true
  startGame()
}


//handle swipes
var hammertime = new Hammer(document.querySelector(".app"))

hammertime.on('tap', function(e) {
  if (app.detectiveState === "dead") {
    resetGame()
  }
})

function setupTouch() {
  hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
  hammertime.on('swipeleft', function(e) {
    app.detectiveState = "left"
    createjs.Sound.play("whoosh")
  })
  hammertime.on('swiperight', function(e) {
    app.detectiveState = "right"
    createjs.Sound.play("whoosh")
  })
  hammertime.on('swipeup', function(e) {
    app.detectiveState = "stand"
    createjs.Sound.play("whoosh")
  })
  hammertime.on('swipedown', function(e) {
    app.detectiveState = "duck"
    createjs.Sound.play("whoosh")
  })
}

function checkKey(e) {
  e = e || window.event
  if (e.keyCode == '38') {
    app.detectiveState = "stand"
    createjs.Sound.play("whoosh")
  }
  else if (e.keyCode == '40') {
    app.detectiveState = "duck"
    createjs.Sound.play("whoosh")
  }
  else if (e.keyCode == '37') {
    app.detectiveState = "left"
    createjs.Sound.play("whoosh")
  }
  else if (e.keyCode == '39') {
    app.detectiveState = "right"
    createjs.Sound.play("whoosh")
  }
}

function resetGame() {
  app.level = 1
  app.score = 0
  app.detectiveState = "stand"
  app.hint = ""
  app.counter = 0
  app.lastShot = ""
  app.powerUpLocation = ""
  app.kills = 0
  startGame()
}

function checkReset(e) {
  e = e || window.event
  if (e.keyCode == '82') {
    resetGame()
  }
}

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

function gameOver() {
  createjs.Sound.play("death")
  app.detectiveState = "dead"
  app.powerUpLocation = ""
  app.hint = ""
  hammertime.off("swipeleft swipedown swipeup swiperight")
  clearInterval(gameLoop)
  document.onkeydown = checkReset
  bgm.stop()
}

function shootDetective() {
  var shotChoices = ["duck", "left", "right"]
  var index = shotChoices.indexOf(app.lastShot)

  if (index > -1) {
    shotChoices.splice(index, 1)
  }

  var aliveChoice = randomChoice(shotChoices)

  app.lastShot = aliveChoice
  app.hint = aliveChoice

  createjs.Sound.play("woof")

  //chance to spawn powerup
  if (app.level > 1 && Math.random() < 0.2) {
    var arrowIndex = shotChoices.indexOf(aliveChoice)

    shotChoices.splice(arrowIndex, 1)
    app.powerUpLocation = randomChoice(shotChoices)
  }

  setTimeout(function() {
    app.hint = ""
    if (app.detectiveState === aliveChoice || app.powerUpLocation) {
      app.powerUpLocation = ""
      app.score += app.level
      app.counter++

      if (app.counter % 5 === 0) {
        createjs.Sound.play("ahooga")
        app.level++
      }
    }
    else {
      var mgs = createjs.Sound.play("machineGun")
      mgs.volume = 0.25
      gameOver()
    }
  }, startingSpeed - (app.level * speedDecrement))
}

function startGame() {
  gameLoop = setInterval(shootDetective, (startingSpeed + 500) - (app.level * speedDecrement))

  document.onkeydown = checkKey
  setupTouch()
  bgm = createjs.Sound.play("bgm", {loop: -1})
}
