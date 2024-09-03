//TODO
// Deshacer, crear un array de imageData cuando se deje de disbujar
// Añadir texto
// Bordes redondeados

//CONSTANTS
const MODES = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  PICKER: 'picker',
  CLEAR: 'clear'
}

//UTILITIES
const $ = el => document.querySelector(el)
const $$ = el => document.querySelectorAll(el)

//ELEMENTS
const $canvas = $('#canvas')
const $colorPicker = $('#color-picker')
const $clearBtn = $('#clear-btn')
const $drawBtn = $('#draw-btn')
const $rectangleBtn = $('#rectangle-btn')
const $ellipseBtn = $('#ellipse-btn')
const $eraseBtn = $('#erase-btn')
const $pickerBtn = $('#picker-btn')

const ctx = $canvas.getContext('2d')

//STATE
let isDrawing = false
let isShiftPressed = false
let startX, startY
let lastX = 0
let lastY = 0
let mode = MODES.DRAW
let imageData

//EVENTS
document.addEventListener('keyup', handleKeyUp)
document.addEventListener('keydown', handleKeyDown)

$canvas.addEventListener('mousedown', startDrawing)
$canvas.addEventListener('mousemove', draw)
$canvas.addEventListener('mouseup', stopDrawing)
$canvas.addEventListener('mouseleave', stopDrawing)

$canvas.addEventListener('touchstart', startDrawing)
$canvas.addEventListener('touchmove', draw)
$canvas.addEventListener('touchend', stopDrawing)
$canvas.addEventListener('touchleave', stopDrawing)

$colorPicker.addEventListener('change', handleChangeColor)
$clearBtn.addEventListener('click', clearCanvas)

$rectangleBtn.addEventListener('click', () => {
  setMode(MODES.RECTANGLE)
})

$drawBtn.addEventListener('click', () => {
  setMode(MODES.DRAW)
})

$ellipseBtn.addEventListener('click', () => {
  setMode(MODES.ELLIPSE)
})

$eraseBtn.addEventListener('click', () => {
  setMode(MODES.ERASE)
})

$pickerBtn.addEventListener('click', () => {
  setMode(MODES.PICKER)
})

//METHODS
function startDrawing(event) {
  event.preventDefault()
  isDrawing = true

  const { offsetX, offsetY } = event
  ;[startX, startY] = [offsetX, offsetY]
  ;[lastX, lastY] = [offsetX, offsetY]

  imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height)
}

function draw(event) {
  event.preventDefault()
  if(!isDrawing) return

  const { offsetX, offsetY } = event

  if(mode === MODES.DRAW || mode === MODES.ERASE){
    pencilDraw(offsetX, offsetY)
    return
  }

  if(mode === MODES.RECTANGLE){
    rectangleDraw(offsetX, offsetY)
    return
  }
}

function stopDrawing(event) {
  event.preventDefault()
  isDrawing = false
}

function handleChangeColor(event) {
  const { value } = $colorPicker

  ctx.strokeStyle = value
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

async function setMode(newMode) {
  let previousMode = mode
  mode = newMode

  $('button.active')?.classList.remove('active')

  if(mode === MODES.DRAW){
    $drawBtn.classList.add('active')
    $canvas.style.cursor = 'crosshair'
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineWidth = 2
    return
  }

  if(mode === MODES.RECTANGLE){
    $rectangleBtn.classList.add('active')
    $canvas.style.cursor = 'nw-resize'
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineWidth = 2
    return
  }

  if(mode === MODES.ELLIPSE){
    $ellipseBtn.classList.add('active')
    ctx.globalCompositeOperation = 'source-over'
    return
  }

  if(mode === MODES.ERASE){
    $eraseBtn.classList.add('active')
    $canvas.style.cursor = 'url("./cursors/erase.png") 0 24, auto'

    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = 20
    return
  }

  if(mode === MODES.PICKER){
    $pickerBtn.classList.add('active')
    $canvas.style.cursor = 'url("./cursors/picker.png") 0 24, auto'

    const eyeDropper = new window.EyeDropper()

    try {
      const { sRGBHex } = await eyeDropper.open()

      ctx.strokeStyle = sRGBHex
      $colorPicker.value = sRGBHex
      setMode(previousMode)
    }catch(e){
      //if error or user has not choose any color
    }

    return
  }
}

function pencilDraw(offsetX, offsetY){
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(offsetX, offsetY)
  ctx.stroke()

  ;[lastX, lastY] = [offsetX, offsetY]
}

function rectangleDraw(offsetX, offsetY){
  ctx.putImageData(imageData, 0, 0)

  let width = offsetX - startX
  let height = offsetY - startY

  if(isShiftPressed){
    const sideLength = Math.min(
      Math.abs(width),
      Math.abs(height)
    )

    width = width > 0 ? sideLength : -sideLength
    height = height > 0 ? sideLength : -sideLength
  }

  ctx.beginPath()
  ctx.rect(startX, startY, width, height)
  ctx.stroke()
}

function handleKeyUp({ key }) {
  if(key === 'Shift') isShiftPressed = false
}

function handleKeyDown({ key }){
  isShiftPressed = key === 'Shift'
}

//INIT
setMode(MODES.DRAW)

//Show picker if browser has support
if(typeof window.EyeDropper !== undefined){
  $pickerBtn.removeAttribute('disabled')
}