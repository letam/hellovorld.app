
// Disable user-select when holding a button
function disableTouchSelect() {
  document.body.style.userSelect = "none"
  document.body.style.webkitUserSelect = "none"
}

function restoreTouchSelect() {
  document.body.style.userSelect = ""
  document.body.style.webkitUserSelect = ""
}

let allButtons = document.querySelectorAll("button")
for (let button of allButtons) {
  button.addEventListener("touchstart", disableTouchSelect)
  button.addEventListener("touchend", restoreTouchSelect)
}
// TODO Refactor possibly

setKeyArrowLeftEventListeners()
function setKeyArrowLeftEventListeners() {
  let arrowLeft = document.getElementById("key-arrow-left")
  arrowLeft.addEventListener("touchstart", function (e) {
    dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }))
  })
  arrowLeft.addEventListener("touchend", function (e) {
    dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowLeft" }))
  })
  arrowLeft.addEventListener("mousedown", function (e) {
    dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }))
  })
  arrowLeft.addEventListener("mouseup", function (e) {
    dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowLeft" }))
  })
}

setKeyArrowUpEventListeners()
function setKeyArrowUpEventListeners() {
  let arrowUp = document.getElementById("key-arrow-up")
  arrowUp.addEventListener("touchstart", function (e) {
    dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }))
  })
  arrowUp.addEventListener("touchend", function (e) {
    dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowUp" }))
  })
  arrowUp.addEventListener("mousedown", function (e) {
    dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }))
  })
  arrowUp.addEventListener("mouseup", function (e) {
    dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowUp" }))
  })
}

setKeyArrowRightEventListeners()
function setKeyArrowRightEventListeners() {
  let arrowRight = document.getElementById("key-arrow-right")
  arrowRight.addEventListener("touchstart", function (e) {
    dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))
  })
  arrowRight.addEventListener("touchend", function (e) {
    dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowRight" }))
  })
  arrowRight.addEventListener("mousedown", function (e) {
    dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))
  })
  arrowRight.addEventListener("mouseup", function (e) {
    dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowRight" }))
  })
}

// TODO: Allow multitouch on GUI buttons

