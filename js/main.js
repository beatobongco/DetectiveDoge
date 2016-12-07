//constants
var startingSpeed = 750
var speedDecrement = 50

var app = new Vue({
  el: '.app',
  data: {
    state: "loading",
    progress: 0,
    level: 1,
    score: 0,
    detectiveState: "stand",
    hint: "",
    counter: 0,
    lastShot: "",
    aliveChoice: "",
    powerUpLocation: "",
    kills: 0,
    hammertime: null,
    gameLoop: null,
    bgm: null,
    bulletLocation: "",
  },
  computed: {
    formattedScore: function() {
      return this.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
  },
  methods: {
    removeControls: function() {
      document.onkeydown = null
      this.hammertime.off("swipeleft swipedown swipeup swiperight")
    },
    startGame: function() {
      this.state = "playing"
      this.gameLoop = setInterval(this.shootDetective, 1000)
      this.hammertime = new Hammer(document.querySelector(".app"))
      this.hammertime.on('tap', function(e) {
        if (app.detectiveState === "dead") {
          app.resetGame()
        }
      })
      this.hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
      this.setupControls()
      this.bgm = createjs.Sound.play("bgm", {loop: -1})
      createjs.Sound.play("footsteps", {loop: 1})
    },
    gameOver: function() {
      var mgs = createjs.Sound.play("machineGun")

      mgs.volume = 0.25
      createjs.Sound.play("death")

      this.powerUpLocation = ""
      this.hint = ""
      this.bgm.stop()

      this.removeControls()

      clearInterval(this.gameLoop)

      //play death animation, get visible
      document.querySelector(".detective." + app.detectiveState).classList.add("bounceOutDown")

      setTimeout(function() {
        document.querySelector(".detective." + app.detectiveState).classList.remove("bounceOutDown")
        document.onkeydown = checkReset
        app.detectiveState = "dead"
        app.bulletLocation = ""
      }, 500)
    },
    resetGame: function () {
      app.level = 1
      app.score = 0
      app.detectiveState = "stand"
      app.hint = ""
      app.counter = 0
      app.lastShot = ""
      app.powerUpLocation = ""
      app.prevPPLocation = ""
      app.kills = 0
      this.startGame()
    },
    shootDetective: function() {
      var shotChoices = ["left", "right", "duck"]
      //you cannot be shot in the same area as last time
      var index = shotChoices.indexOf(app.lastShot)

      if (index > -1) {
        shotChoices.splice(index, 1)
      }

      app.bulletLocation = ""

      //chance to spawn powerup
      if (app.level > 1 && Math.random() < 0.1) {
        app.powerUpLocation = "stand"
        app.aliveChoice = "stand"
        createjs.Sound.play("ahooga")
      }
      else {
        var aliveChoice = randomChoice(shotChoices)
        app.aliveChoice = aliveChoice
        app.lastShot = aliveChoice
        app.hint = aliveChoice
        createjs.Sound.play("bark")
      }

      setTimeout(function() {
        app.hint = ""
        if (app.detectiveState === app.aliveChoice) {
          if (app.aliveChoice === "stand") {
            createjs.Sound.play("pistol")
            createjs.Sound.play("wilhelm")
            app.score += app.level * 5000
            document.querySelector(".mobster:last-child").classList.add("bounceOut")
            setTimeout(function() {
              app.level--
            }, 500)
            app.kills++
          }
          else {
            var mgs = createjs.Sound.play("machineGun")
            mgs.volume = 0.25
            app.bulletLocation = app.aliveChoice
            app.score += app.level * 1000
          }
          app.surviveRound()
        }
        else {
          app.bulletLocation = app.aliveChoice
          app.gameOver()
        }
      }, startingSpeed - (app.level * speedDecrement))
    },
    surviveRound: function() {
      this.powerUpLocation = ""
      this.counter++

      if (this.counter % 5 === 0) {
        createjs.Sound.play("footsteps", {loop: 1})
        this.level++
      }
    },
    setupControls: function() {
      document.onkeydown = function(e) {
        e = e || window.event
        if (e.keyCode == '38' || e.keyCode == '87') {
          app.moveDetective("stand")
        }
        else if (e.keyCode == '40' || e.keyCode == '83') {
          app.moveDetective("duck")
        }
        else if (e.keyCode == '37' || e.keyCode == '65') {
          app.moveDetective("left")
        }
        else if (e.keyCode == '39' || e.keyCode == '68') {
          app.moveDetective("right")
        }
      }

      this.hammertime.on('swipeleft', function(e) {
        app.moveDetective("left")
      })
      this.hammertime.on('swiperight', function(e) {
        app.moveDetective("right")
      })
      this.hammertime.on('swipeup', function(e) {
        app.moveDetective("stand")
      })
      this.hammertime.on('swipedown', function(e) {
        app.moveDetective("duck")
      })
    },
    moveDetective: function(direction) {
      app.detectiveState = direction
      createjs.Sound.play("whoosh")
    }
  }
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
queue.loadFile({id: 'bark', src: 'sound/bark.mp3'})
queue.loadFile({id: 'machineGun', src: 'sound/machine_gun.mp3'})
queue.loadFile({id: 'death', src: 'sound/death.mp3'})
queue.loadFile({id: 'ahooga', src: 'sound/ahooga.mp3'})
queue.loadFile({id: 'footsteps', src: 'sound/footsteps.mp3'})
queue.loadFile("image/newspaper.jpg")
queue.loadFile("image/wall.jpg")
queue.loadFile("image/warnduck.png")
queue.loadFile("image/warnleft.png")
queue.loadFile("image/warnright.png")
queue.loadFile("image/mob.png")
queue.loadFile("image/headshot.png")
queue.loadFile("image/corgi_stand.png")
queue.loadFile("image/corgi_down.png")
queue.loadFile("image/corgi_left.png")
queue.loadFile("image/corgi_right.png")

function handleProgress(e) {
  app.progress = Math.floor(e.progress * 100)
}

function handleComplete() {
  app.state = "menu"
}

function checkReset(e) {
  e = e || window.event
  if (e.keyCode == '82') {
    app.resetGame()
  }
}

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}
