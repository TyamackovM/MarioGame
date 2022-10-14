import platform from '../img/platform.png'
import hills from '../img/hills.png'
import background from '../img/background.png'
import platformSmallTall from '../img/platformSmallTall.png'

import spriteRunLeft from '../img/spriteRunLeft.png'
import spriteRunRight from '../img/spriteRunRight.png'
import spriteStandLeft from '../img/spriteStandLeft.png'
import spriteStandRight from '../img/spriteStandRight.png'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = 1.5

class Player {
  constructor() {
    this.speed = 10
    this.position = {
      x: 100,
      y: 100
    }
    this.velocity = {
      x: 0,
      y: 0
    }

    this.width = 66;
    this.height = 150;

    this.image = createImage(spriteStandRight);
    this.frames = 0;
    this.sprites = {
      stand: {
        right: createImage(spriteStandRight),
        left: createImage(spriteStandLeft),
        cropWidth: 177,
        width: 66,
      },
      run: {
        right: createImage(spriteRunRight),
        left: createImage(spriteRunLeft),
        cropWidth: 341,
        width: 127.875,
      }
    }

    this.currentSprite = this.sprites.stand.right;
    this.currentCropWidth = 177
  }

  draw() {
    c.drawImage(
      this.currentSprite, 
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      400,
      this.position.x, 
      this.position.y, 
      this.width, 
      this.height)
  }

  update() {
    this.frames++
    if (this.frames > 59 && (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left)) this.frames = 0
    else if (this.frames > 29 && (this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left)) this.frames = 0
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    // * Гравитация
    if (this.position.y + this.height + this.velocity.y <= canvas.height ) {
      this.velocity.y += gravity
    }
  }
}

class Platform {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y
    }

    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class GenericObject {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y
    }

    this.image = image
    this.width = image.width
    this.height = image.height
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class Goomba {
  constructor({position, velocity}) {
    this.position = {
      x: position.x,
      y: position.y,
    }

    this.velocity = {
      x: velocity.x,
      y: velocity.y
    }

    this.width = 50
    this.height = 50
  }

  draw() {
    c.fillStyle = 'red'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y <= canvas.height ) {
      this.velocity.y += gravity
    }
  }
  
}


//* Функция для определенной картинки
function createImage(imageSrc) {
  const image = new Image()
  image.src = imageSrc
  return image
}

function createImageAsync(imageSrc) {
return new Promise((resolve) => {
  const image = new Image()
  image.onload = () => {
    resolve(image)
  }
  image.src = imageSrc
  })
}

let platformImage
let platformSmallTallImage

let player = new Player()
let platforms = []
let genericObjects = []
let goombas = []

let lastKey
const keys = {
  right: {
    pressed: false
  },
  left: {
    pressed: false
  }
}

//* Считаем значение переменной, до определенной точки "победы"
let scrollOffset = 0;

//*Функия гравитации для игрока и врагов
function isOnTopOfPlatform ({object, platform}) {
  return ( 
    object.position.y + object.height <= platform.position.y && 
    object.position.y + object.height + object.velocity.y >= platform.position.y && 
    object.position.x + object.width >= platform.position.x && 
    object.position.x <= platform.position.x + platform.width 
  )        
}
//* Функция обнаружения врага
function collisionTop ({object1, object2}) {
  return ( 
    object1.position.y + object1.height <= object2.position.y && 
    object1.position.y + object1.height + object1.velocity.y >= object2.position.y && 
    object1.position.x + object1.width >= object2.position.x && 
    object1.position.x <= object2.position.x + object2.width 
  )        
}

async function init() {

  platformImage = await createImageAsync(platform)
  platformSmallTallImage = await createImageAsync(platformSmallTall)

  player = new Player()
  
  goombas = [
    new Goomba({
      position: {
        x: 800, 
        y: 200
      },
      velocity: {
        x: -0.3,
        y: 0,
      }
    })
  ]
  
   platforms = [
    new Platform({
      x: platformImage.width * 4 + 300 - 2 + platformImage.width - platformSmallTallImage.width,
      y: 270, 
      image: createImage(platformSmallTall)
    }),
    new Platform({ 
      x: -1, 
      y: 470, 
      image: platformImage 
    }), 
    new Platform({
      x: platformImage.width - 3, 
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 2 + 100, 
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 3 + 300, 
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 4 + 300 - 2, 
      y: 470, 
      image: platformImage
    }),
    new Platform({
      x: platformImage.width * 5 + 700 - 2, 
      y: 470, 
      image: platformImage
    }),
    
  ]

    genericObjects = [
    new GenericObject({
    x: -1,
    y: -1,
    image: createImage(background)
    }),
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(hills)
    }),
  ]

  //* Считаем значение переменной, до определенной точки "победы"
  scrollOffset = 0;
}

function animate() {
  //* Очищает пиксели при движении рекурсивно запуская себя
  requestAnimationFrame(animate)
  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height)

  genericObjects.forEach(genericObjects => {
    genericObjects.draw()
  })

  platforms.forEach(platform => {
    platform.draw()
  })

  goombas.forEach((goomba, index) => {
    goomba.update()

    if (collisionTop({object1: player, object2: goomba})) {
      player.velocity.y -=40
      setTimeout(() => {
        goombas.splice(index, 1)
      }, 0)
    } else if (player.position.x + player.width >= goomba.position.x && 
      player.position.y + player.height >= goomba.position.y &&
      player.position.x <= goomba.position.x + goomba.width) {
      init()
    }
  })
  player.update()

//* Движение игрока
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed
  } else if ((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
    player.velocity.x = -player.speed
  } else {
    player.velocity.x = 0
//* Позиции платформы при движении игрока и обьектов бэкграунда(паралакс эффект && скролл)
    if (keys.right.pressed) {
      scrollOffset += player.speed
      platforms.forEach(platform => {
        platform.position.x -= player.speed
      })      
      genericObjects.forEach(genericObjects => {
        genericObjects.position.x -= player.speed * 0.66
      })
      goombas.forEach(goomba => {
        goomba.position.x -= player.speed
      })
    } else if (keys.left.pressed && scrollOffset > 0) { //* Запрет на выход за зону
      scrollOffset -= player.speed
      platforms.forEach(platform => {
        platform.position.x += player.speed
      })      
      genericObjects.forEach(genericObjects => {
        genericObjects.position.x += player.speed * 0.66
      })
      goombas.forEach(goomba => {
        goomba.position.x += player.speed
      })
    }
  }


  //* Обнаружение платформы
  platforms.forEach(platform => {
    if (
      isOnTopOfPlatform({object: player, platform})
    ) {
      player.velocity.y = 0
    }

    goombas.forEach(goomba => {
      if (isOnTopOfPlatform({object: goomba, platform})) goomba.velocity.y = 0
    })
    // if ()
  })  

  //* Переключение спрайтов персонажа
  if (keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.run.right) {
    player.frames = 1
    player.currentSprite = player.sprites.run.right
    player.currentCropWidth = player.sprites.run.cropWidth
    player.width = player.sprites.run.width
  } else if (keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.run.left) {
    player.currentSprite = player.sprites.run.left
    player.currentCropWidth = player.sprites.run.cropWidth
    player.width = player.sprites.run.width
  } else if (!keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.stand.left) {
    player.currentSprite = player.sprites.stand.left
    player.currentCropWidth = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  } else if (!keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.stand.right) {
    player.currentSprite = player.sprites.stand.right
    player.currentCropWidth = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  }

  // * Условие победы
  if (platformImage && scrollOffset > platformImage.width * 5 + 300 - 2) {
    console.log('you win')
  }

  // * Условие поражения
  if (player.position.y > canvas.height) {
    init()
  }
}

init()
animate()

window.addEventListener('keydown', ({ keyCode }) => {
  switch(keyCode) {
    case 65:
      console.log('left')
      keys.left.pressed = true
      lastKey = 'left'
      break;
    case 83:
      console.log('down')
      break;
    case 68:
      console.log('right')
      keys.right.pressed = true
      lastKey = 'right'
      break;
    case 87:
      console.log('up')
      player.velocity.y -= 25
      break;
  }

  console.log(keys.right.pressed)
})

window.addEventListener('keyup', ({ keyCode }) => {
  switch(keyCode) {
    case 65:
      console.log('left')
      keys.left.pressed = false
      break;
    case 83:
      console.log('down')
      break;
    case 68:
      console.log('right')
      keys.right.pressed = false
      break;
    case 87:
      console.log('up')
      break;
  }

  console.log(keys.right.pressed)
})
