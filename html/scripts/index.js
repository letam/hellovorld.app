// eslint-disable-next-line no-unused-vars
import { sleep, strSplice, $ } from "./util.js"

console.log("hello")

let bag = {}
let currentTheme = localStorage.getItem("theme") || "dark"

function main() {
  // eslint-disable-next-line no-unused-vars
  let lesson = document.getElementById("lesson")
  // eslint-disable-next-line no-unused-vars
  let output = document.getElementById("output")
  // eslint-disable-next-line no-unused-vars
  let worldWrapper = document.getElementById("world-wrapper")

  let debugFunction = () => console.log("DEBUG: debugFunction is empty.")

  let shouldTransitionOnEval = true
  let transitionOnEvalTime = 0.05
  function setTransitionOnEvalTime(seconds = transitionOnEvalTime) {
    transitionOnEvalTime = seconds
    worldCanvas.style.transition = `opacity ${seconds}s ease-in-out`
  }
  function toggleTransitionOnEval(should = !shouldTransitionOnEval) {
    shouldTransitionOnEval = should
    setTransitionOnEvalTime()
  }

  /* eventListener management */
  let eventListeners = []
  window._addEventListener = window.addEventListener
  window.addEventListener = (type, listener, options) => {
    eventListeners.push({ type, listener, options })
    window._addEventListener(type, listener, options)
  }
  // eslint-disable-next-line no-unused-vars
  let ael = addEventListener

  /* requestAnimationFrame management */
  let requestAnimationFrameIds = []
  window._requestAnimationFrame = window.requestAnimationFrame
  window.requestAnimationFrame = (fn) => {
    requestAnimationFrameIds.push(window._requestAnimationFrame(fn))
  }

  /* setInterval management */
  let setIntervalIds = []
  window._setInterval = window.setInterval
  window.setInterval = (fn, timeout, ...args) => {
    setIntervalIds.push(window._setInterval(fn, timeout, ...args))
  }

  /* setTimeout management */
  let setTimeoutIds = []
  window._setTimeout = window.setTimeout
  window.setTimeout = (fn, timeout, ...args) => {
    setTimeoutIds.push(window._setTimeout(fn, timeout, ...args))
  }

  async function evalCode() {
    let { value: code } = editor
    try {
      // console.log('listeners', eventListeners)

      /* clear eventListeners */
      eventListeners.forEach(({ type, listener, options }) => {
        window.removeEventListener(type, listener, options)
      })
      eventListeners = []

      /* clear requestAnimationFrames */
      requestAnimationFrameIds.forEach((id) => window.cancelAnimationFrame(id))
      requestAnimationFrameIds = []

      /* clear setIntervals */
      setIntervalIds.forEach((id) => window.clearInterval(id))
      setIntervalIds = []

      /* clear setTimeouts */
      setTimeoutIds.forEach((id) => window.clearTimeout(id))
      setTimeoutIds = []

      if (shouldTransitionOnEval) {
        worldCanvas.style.opacity = 0
        await sleep(transitionOnEvalTime)
      }
      /* world functions made "global" to the editor */
      // let setFillColor = color => (world.fillStyle = setColor)
      // let fillRect = (...args) => world.fillRect(...args)

      let codeAsync = "(async function (){" + code + "\n" + "})()"
      eval(codeAsync)
      if (shouldTransitionOnEval) {
        await sleep(transitionOnEvalTime)
        // console.log('transition complete')
        worldCanvas.style.opacity = 1
      }
    } catch (e) {
      // TODO: Display error on screen, pointing to line number where error fails
      console.error(e)
      alert(e)
    }
  }

  function strokeLine(ctx, x0, y0, x1, y1) {
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
  }

  const WORLD_SIZE = {
    w: 450,
    h: 450,
  }

  const RULE_THICKNESS = 30
  const RULE_TICK_LENGTH = 10
  const RULE_LEGEND_FONT_SIZE = 16
  const RULE_FONT_SIZE = 16
  function getRuleCanvasWidthForX() {
    return WORLD_SIZE.w + RULE_TICK_LENGTH + RULE_LEGEND_FONT_SIZE
  }
  function getRuleCanvasHeightForY() {
    return WORLD_SIZE.h
  }

  let oruleCanvas = document.getElementById("orule")
  oruleCanvas.width = RULE_THICKNESS
  oruleCanvas.height = RULE_THICKNESS
  let orule = oruleCanvas.getContext("2d")
  let oruleBak = { strokeStyle: orule.strokeStyle }
  function createORule() {
    orule.strokeStyle = currentTheme === "dark" ? "white" : "black"
    orule.lineWidth = 0.8
    strokeLine(
      orule,
      oruleCanvas.width - 1,
      oruleCanvas.height - 1,
      oruleCanvas.width,
      oruleCanvas.height,
    )
    orule.strokeStyle = oruleBak.strokeStyle
  }

  let xruleCanvas = document.getElementById("xrule")
  xruleCanvas.width = getRuleCanvasWidthForX()
  xruleCanvas.height = RULE_THICKNESS
  let xrule = xruleCanvas.getContext("2d")
  let xruleBak = { strokeStyle: xrule.strokeStyle, fillStyle: xrule.fillStyle }
  function createXRule() {
    xrule.strokeStyle = currentTheme === "dark" ? "white" : "black"
    xrule.fillStyle = currentTheme === "dark" ? "white" : "black"
    xrule.initialFont = xrule.font
    xrule.lineWidth = 2
    strokeLine(xrule, 0, xruleCanvas.height, WORLD_SIZE.w, xruleCanvas.height)
    strokeLine(
      xrule,
      WORLD_SIZE.w,
      xruleCanvas.height,
      xruleCanvas.width - RULE_FONT_SIZE,
      xruleCanvas.height,
    )
    // draw x-arrow
    strokeLine(
      xrule,
      WORLD_SIZE.w + RULE_TICK_LENGTH / 2,
      xruleCanvas.height - RULE_TICK_LENGTH / 2,
      xruleCanvas.width - RULE_FONT_SIZE,
      xruleCanvas.height,
    )
    xrule.font = "16px Arial"
    xrule.fillText("x", xruleCanvas.width - 10, xruleCanvas.height)

    xrule.font = xrule.initialFont
    xrule.lineWidth = 0.8
    for (let i = 0; i < xruleCanvas.width; i += 50) {
      let tickLength = RULE_TICK_LENGTH
      if (i === 0) {
        xrule.fillText(i, i, xruleCanvas.height - 14)
      } else if (i % 100 === 0) {
        xrule.fillText(i, i - tickLength, xruleCanvas.height - 14)
      } else {
        tickLength -= tickLength / 2
      }
      strokeLine(xrule, i, xruleCanvas.height, i, xruleCanvas.height - tickLength)
    }

    xrule.strokeStyle = xruleBak.strokeStyle
    xrule.fillStyle = xruleBak.fillStyle
  }

  let yruleCanvas = document.getElementById("yrule")
  yruleCanvas.height = getRuleCanvasHeightForY()
  yruleCanvas.width = RULE_THICKNESS
  let yrule = yruleCanvas.getContext("2d")
  let yruleBak = { strokeStyle: yrule.strokeStyle, fillStyle: yrule.fillStyle }
  function createYRule() {
    yrule.strokeStyle = currentTheme === "dark" ? "white" : "black"
    yrule.fillStyle = currentTheme === "dark" ? "white" : "black"
    yrule.lineWidth = 2
    strokeLine(yrule, yruleCanvas.width, 0, yruleCanvas.width, yruleCanvas.height)
    // yrule.initialFont = yrule.font
    // yrule.font = "16px Arial"
    // yrule.fillText("y", yruleCanvas.width - 10, yruleCanvas.height - 5)
    // yrule.font = yrule.initialFont

    yrule.lineWidth = 0.8
    for (let i = 0; i <= yruleCanvas.height; i += 50) {
      let tickLength = RULE_TICK_LENGTH
      if (i === 0) {
        yrule.fillText(i, 12, i + 10)
      } else if (i % 100 === 0) {
        yrule.fillText(i, 0, i + 4)
      } else {
        tickLength -= tickLength / 2.5
      }
      strokeLine(yrule, yruleCanvas.width, i, yruleCanvas.width - tickLength, i)
    }

    yrule.strokeStyle = yruleBak.strokeStyle
    yrule.fillStyle = yruleBak.fillStyle
  }

  let yruleCanvas2 = document.getElementById("yrule2")
  yruleCanvas2.height = getRuleCanvasHeightForY()
  yruleCanvas2.width = RULE_THICKNESS
  let yrule2 = yruleCanvas2.getContext("2d")
  let yrule2Bak = { strokeStyle: orule.strokeStyle }
  function createYRule2() {
    yrule2.strokeStyle = currentTheme === "dark" ? "white" : "black"
    yrule2.lineWidth = 0.8
    strokeLine(yrule2, 0, 0, 0, yruleCanvas.height)
    for (let i = 0; i <= yruleCanvas.height; i += 50) {
      if (i !== 0) {
        let tickLength = RULE_TICK_LENGTH
        if (i % 100 !== 0) tickLength -= tickLength / 2.5
        strokeLine(yrule2, 0, i, 0 + tickLength, i)
      }
    }
    yrule2.strokeStyle = yrule2Bak.strokeStyle
  }

  let oruleCanvas2 = document.getElementById("orule2")
  oruleCanvas2.width = RULE_THICKNESS
  oruleCanvas2.height = RULE_THICKNESS
  let orule2 = oruleCanvas2.getContext("2d")
  let orule2Bak = { strokeStyle: orule2.strokeStyle, fillStyle: orule2.fillStyle }
  function createORule2() {
    orule2.strokeStyle = currentTheme === "dark" ? "white" : "black"
    orule2.fillStyle = currentTheme === "dark" ? "white" : "black"
    orule2.lineWidth = 2
    strokeLine(
      orule2,
      oruleCanvas2.width,
      0,
      oruleCanvas2.width,
      RULE_FONT_SIZE - RULE_FONT_SIZE / 4,
    )
    // draw y-arrow
    strokeLine(
      orule2,
      oruleCanvas2.width - RULE_TICK_LENGTH / 2,
      RULE_TICK_LENGTH / 2,
      oruleCanvas2.width,
      RULE_FONT_SIZE - RULE_FONT_SIZE / 4,
    )

    orule2.initialFont = orule2.font
    orule2.font = "16px Arial"
    orule2.fillText(
      "y",
      oruleCanvas2.width - 10,
      RULE_TICK_LENGTH + getFontSize(orule2),
    )

    orule2.strokeStyle = orule2Bak.strokeStyle
    orule2.fillStyle = orule2Bak.fillStyle
  }

  let xruleCanvas2 = document.getElementById("xrule2")
  xruleCanvas2.width = getRuleCanvasWidthForX()
  xruleCanvas2.height = RULE_THICKNESS
  let xrule2 = xruleCanvas2.getContext("2d")
  let xrule2Bak = { strokeStyle: orule.strokeStyle }
  function createXrule2() {
    xrule2.strokeStyle = currentTheme === "dark" ? "white" : "black"
    xrule2.lineWidth = 0.8
    strokeLine(xrule2, 0, 0, xruleCanvas2.width - 25, 0)
    for (let i = 0; i < xruleCanvas2.width; i += 50) {
      if (i !== 0) {
        let tickLength = RULE_TICK_LENGTH
        if (i % 100 !== 0) tickLength -= tickLength / 2.5
        strokeLine(xrule2, i, 0, i, tickLength)
      }
    }
    xrule2.strokeStyle = xrule2Bak.strokeStyle
  }

  bag.createCanvasRule = function () {
    createORule()
    createXRule()
    createYRule()
    createYRule2()
    createORule2()
    createXrule2()
  }

  let isRulesVisible = false
  function showRules() {
    document
      .querySelectorAll("#output [data-hidden='1']")
      .forEach((el) => el.setAttribute("data-hidden", 0))
    isRulesVisible = true
  }
  function hideRules() {
    document
      .querySelectorAll("#output [data-hidden='0']")
      .forEach((el) => el.setAttribute("data-hidden", 1))
    isRulesVisible = false
  }

  // eslint-disable-next-line no-unused-vars
  document.getElementById("console-toggle-rules").addEventListener("click", (e) => {
    if (isRulesVisible) {
      hideRules()
    } else {
      showRules()
    }
  })

  /* Expand editor vertical space (hiding other elements) */
  let isExpandedV = false
  const ICON_ARROW_UP = "⬆"
  const ICON_ARROW_DOWN = "⬇"
  // eslint-disable-next-line no-unused-vars
  document.getElementById("expand-editor-v").addEventListener("click", (e) => {
    if (!isExpandedV) {
      // Hide stuff
      Array.from(document.getElementsByClassName("stuff")).forEach((el) => {
        el.style.display = "none"
      })
      e.target.innerText = ICON_ARROW_DOWN
      document.querySelector("#editor").style.height = `calc(100vh - ${2 * 44}px)`
    } else {
      // Show stuff
      Array.from(document.getElementsByClassName("stuff")).forEach((el) => {
        el.style.display = ""
      })
      e.target.innerText = ICON_ARROW_UP
      document.querySelector("#editor").style.height = ``
    }
    isExpandedV = !isExpandedV
  })

  let midContainer = document
    .getElementById("console")
    .querySelector("[data-level='middle']")
  midContainer.style.height = WORLD_SIZE.h + "px"

  let worldCanvas = document.getElementById("world")
  worldCanvas.width = WORLD_SIZE.w
  worldCanvas.height = WORLD_SIZE.h
  let world = worldCanvas.getContext("2d")

  world.width = worldCanvas.width
  world.setWidth = function (width) {
    world.width = worldCanvas.width = width
    evalCode()
  }

  world.height = worldCanvas.height
  world.setHeight = function (height) {
    world.height = worldCanvas.height = height
    evalCode()
  }

  let initialState = {
    worldColor: "white",
    fillStyle: world.fillStyle,
    font: world.font,
  }

  world.reset = function () {
    world.fillStyle = initialState.fillStyle
    world.fillRect(0, 0, worldCanvas.width, worldCanvas.height)
  }

  world.getFontSize = getFontSize.bind(null, world)
  world.setFontSize = setFontSize.bind(null, world)

  // function renderCanvas() {
  //   // world.
  //   // world.fillStyle = "skyblue"
  //   // world.fillRect(0, 0, worldCanvas.width, worldCanvas.height)
  // }

  // renderCanvas()

  /* a method to insert text where x and y refer to its origin on the grid */
  world.text = function (text, x, y) {
    let fontHeight = world.getFontSize()
    world.fillText(text, x, y + fontHeight)
  }

  // eslint-disable-next-line no-unused-vars
  function setColor(color) {
    world.fillStyle = color
  }
  // eslint-disable-next-line no-unused-vars
  function sc(color) {
    world.fillStyle = color
  }

  // eslint-disable-next-line no-unused-vars
  function fillRect(x, y, w, h) {
    world.fillRect(x, y, w, h)
  }
  // eslint-disable-next-line no-unused-vars
  function fr(...args) {
    world.fillRect(...args)
  }

  let editor = document.getElementById("editor")
  editor.value = localStorage.getItem("editorContent")
  let cancelTypingInitialValue = false
  let editorContentInitialized = false
  // TODO: Refactor this mess
  function initializeEditorContent() {
    let delayUntilStartTyping = 1000 * 1.25
    if (editor.value.trim() === "") {
      editor.value = ""
      /* Load introduction message and script in editor */
      let welcomeMessage = getEditorWelcomeMessage()
      let welcomeMessageTypingSpeed = 30
      let initialScriptTypingSpeed = 15
      let initialScript = getEditorInitialScript()
      setTimeout(loadWelcomeMessage, delayUntilStartTyping)
      setTimeout(
        loadInitialScript,
        delayUntilStartTyping + welcomeMessageTypingSpeed * welcomeMessage.length,
      )
      setTimeout(() => {
        if (cancelTypingInitialValue) return
        evalCode()
        editorContentInitialized = true
      }, delayUntilStartTyping + welcomeMessageTypingSpeed * welcomeMessage.length + initialScriptTypingSpeed * initialScript.length)
      // TODO: Find out why Safari loads content with extra newlines at 'draw water'
      // TODO: Rewrite to use promises
      // TODO: Restructure to easily load scripts in chain/array
      function loadWelcomeMessage() {
        let i = 0
        for (let char of Array.from(welcomeMessage)) {
          if (cancelTypingInitialValue) break
          setTimeout(() => {
            if (cancelTypingInitialValue) return
            editor.value += char
          }, welcomeMessageTypingSpeed * i)
          i += 1
        }
      }
      function loadInitialScript() {
        let i = 0
        for (let char of Array.from(initialScript)) {
          if (cancelTypingInitialValue) break
          setTimeout(() => {
            if (cancelTypingInitialValue) return
            editor.value += char
          }, initialScriptTypingSpeed * i)
          i += 1
        }
      }
    } else {
      setTimeout(evalCode, delayUntilStartTyping)
      editorContentInitialized = true
    }
  }

  // If this document tab is active upon page load, then load editor content gradually
  if (!document.hidden) initializeEditorContent()

  /* BEGIN Detect document focus status change for initializing editor content {{{ */
  // Add listener to detect if document tab is not active
  // TODO: Find a way to clear/pause all timeouts above when status changes
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      // If user switches away from this tab, then load all content instantaneously
      if (editorContentInitialized) return
      cancelTypingInitialValue = true
      setTimeout(() => {
        let welcomeMessage = getEditorWelcomeMessage()
        let initialScript = getEditorInitialScript()
        editor.value = welcomeMessage + initialScript
      }, 300)
      editorContentInitialized = true
    } else {
      // If user switches to this tab for the first time, then load content gradually
      if (editorContentInitialized) return
      initializeEditorContent()
    }
  })
  /* }}} END Detect document focus status change for initializing editor content */

  editor.addEventListener("input", function (e) {
    // TODO: Create function to process value upon execution/saving
    // TODO: Update save event to strip alll trailing whitespace
    localStorage.setItem("editorContent", e.target.value)
  })

  let editorForm = document.getElementById("editor-form")
  editorForm.addEventListener("submit", function (e) {
    // console.log('===',e)
    e.preventDefault()
    evalCode()
  })

  editor.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      evalCode()
    }
  })

  /* INITIAL SETTINGS */
  toggleTransitionOnEval(true)
  showRules() // DEBUG

  /* utility functions */
  function getFontSize(ctx) {
    let split = ctx.font.split(" ")
    let size = split[split.length === 3 ? 1 : 0]
    return parseInt(size.split("p")[0])
  }
  function setFontSize(ctx, size = "10px") {
    let split = ctx.font.split(" ")
    if (typeof size === "number") size = size + "px"
    if (split.length === 3) {
      ctx.font = `${split[0]} ${size} ${split[2]}`
    } else {
      ctx.font = `${size} ${split[1]}`
    }
    return ctx
  }

  /* editor stuff */
  /* editor stuff -- event listeners */
  function checkGlobalKeyEvent(e) {
    switch (e.key) {
      case "e":
        evalCode()
        break
      case ".":
        console.log('global "."')
        break
      case "d": // DEBUG
        // TODO: Add ability to toggle keyboard shortcuts
        // if (statusKeyboardShortcutsValue === "on")
        e.preventDefault()
        console.log('global "d')
        debugFunction()
        break
      case " ":
        magicFn()
        break
      case "Enter":
      default:
        break
    }
  }
  window._addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey) {
      checkGlobalKeyEvent(e)
    }
  })

  /* editor stuff -- GUI events */
  let magicButton = document.getElementById("magic")
  magicButton.addEventListener("click", function (e) {
    magicFn()
  })

  /* editor stuff -- magic */
  function magicFn() {
    if (editor.value.includes("// Game Loop")) {
      return
    }

    // Stop the typing effect and prefill editor content as necessary
    cancelTypingInitialValue = true
    let welcomeMessage = getEditorWelcomeMessage()
    let initialScript = getEditorInitialScript()
    editor.value = welcomeMessage + initialScript

    editor.value += platformerScript
    setTimeout(() => scrollToBottomOfEditor(), 500)
    setTimeout(() => evalCode(), 1000)
  }

  /* editor stuff -- line changes */

  const NEW_LINE = 10

  function getLineStartIndex(editor) {
    let { value: code, selectionStart: index } = editor
    while (index > 0 && code[index - 1].charCodeAt(0) !== NEW_LINE) {
      index--
    }
    return index
  }

  function getLineEndIndex(editor) {
    let { value: code, selectionEnd } = editor
    let codeLength = code.length
    let index = selectionEnd
    while (index < codeLength && code[index].charCodeAt(0) !== NEW_LINE) {
      index++
    }
    return index
  }
  // debugFunction = () => {
  //   let { selectionStart } = editor
  //   editor.selectionStart = getLineEndIndex(editor)
  //   if (editor.selectionEnd === selectionStart) {
  //     editor.selectionEnd = editor.selectionStart
  //   }
  // }

  // editor.addEventListener("click", function(e) {
  //   let { value: code, selectionStart: start, selectionEnd: end } = e.target // editor
  //   if (start === code.length) {
  //     console.log("clicked end of code at code index", start)
  //     return
  //   }
  //   let startCode = code[start].charCodeAt(0)
  //   let endCode = code[end].charCodeAt(0)

  //   console.log("selectionStart", start, startCode)
  //   console.log("selectionEnd", end, endCode)
  // })
  editor.addEventListener("keydown", function (e) {
    // console.log('editor.keydown', e)
    if (editor.selectionStart !== undefined) {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        commentListener(e)
      } else if (e.key === "Tab") {
        e.preventDefault()
        tabListener(e)
      }
    }
  })
  function commentListener(e) {
    let editor = e.target
    let { value: code, selectionStart, selectionEnd } = editor
    let lineStartIndex = getLineStartIndex(editor)
    let lineEndIndex = getLineEndIndex(editor)
    let codeBeforeLine = code.substring(0, lineStartIndex)
    let codeAfterLine = code.substring(lineEndIndex)
    let line = code.substring(lineStartIndex, lineEndIndex)
    let isLineCommented = line.trimStart().indexOf("//") === 0
    if (isLineCommented) {
      uncommentSelection(
        code,
        lineStartIndex,
        line,
        codeBeforeLine,
        codeAfterLine,
        selectionStart,
        selectionEnd,
      )
    } else {
      // TODO: Place comment immediately to the left of statement
      commentSelection(code, lineStartIndex, selectionStart, selectionEnd)
    }
    localStorage.setItem("editorContent", editor.value)
    // TODO: Comment multiple lines
    // TODO: Uncomment multiple lines

    // LESSON IDEA: create your own javascript editor in the browser
    // LESSON IDEA: create your own domain-specific language
    // LESSON IDEA: create your own transpiler
  }
  function commentSelection(code, lineStartIndex, selectionStart, selectionEnd) {
    let charsAdded = 0
    let lines =
      selectionStart !== selectionEnd
        ? code.substring(lineStartIndex, selectionEnd).split("\n")
        : { length: 1 }
    // // TODO-DONE: Fine-tune to not use lines.join() and to not comment blank lines... must manually loop
    // editor.value =
    //   lines.length > 1
    //     ? "// " + lines.join("\n// ") + code.substring(selectionEnd)
    //     : strSplice(code, lineStartIndex, "// ")

    if (lines.length > 1) {
      let replacementCode = code.substring(0, lineStartIndex)
      lines.forEach((line, i) => {
        if (line !== "") {
          replacementCode += "// "
          charsAdded += "// ".length
        }
        replacementCode += line
        if (i < lines.length - 1) {
          replacementCode += "\n"
        }
      })
      editor.value = replacementCode + code.substring(selectionEnd)
    } else {
      charsAdded = "// ".length
      editor.value = strSplice(code, lineStartIndex, "// ")
    }
    /* Restore focus */
    editor.selectionStart = selectionStart + (lines[0] !== "" ? "// ".length : 0)
    if (selectionEnd === selectionStart) {
      // console.log("comment no highlight")
      editor.selectionEnd = editor.selectionStart
    } else {
      // console.log("comment yes highlight")
      editor.selectionEnd = selectionEnd + charsAdded
    }
  }
  const COMMENT_STYLES = ["// ", "//"]
  function uncommentSelection(
    code,
    lineStartIndex,
    line,
    codeBeforeLine,
    codeAfterLine,
    selectionStart,
    selectionEnd,
  ) {
    let commentIndex = line.indexOf("//")
    let commentStyle = line[commentIndex + 2] === " " ? "// " : "//"
    let charsRemoved = 0
    // // TODO! uncomment when a bunch of blank lines before
    // console.log("uncomment")
    let lines =
      selectionStart !== selectionEnd
        ? code.substring(lineStartIndex, selectionEnd).split("\n")
        : { length: 1 }
    if (lines.length > 1) {
      let replacementCode = code.substring(0, lineStartIndex)
      lines.forEach((line) => {
        let isCommented = false
        for (let i = 0, _len = COMMENT_STYLES.length; i < _len; i++) {
          let comment = COMMENT_STYLES[i]
          if (line.trimStart().startsWith(comment)) {
            replacementCode += line.replace(RegExp(comment), "") + "\n"
            isCommented = true
            charsRemoved += comment.length
            break
          }
        }
        if (!isCommented) {
          replacementCode += line + "\n"
        }
      })
      editor.value =
        replacementCode.substring(0, replacementCode.length - "\n".length) +
        code.substring(selectionEnd)
    } else {
      line = line.replace(new RegExp(commentStyle), "")
      editor.value = codeBeforeLine + line + codeAfterLine
    }

    /* restore selection */
    // restore selectionStart
    if (selectionStart === lineStartIndex) {
      editor.selectionStart = lineStartIndex
    } else if (selectionStart < lineStartIndex + commentIndex) {
      // cursor is before comment
      editor.selectionStart = selectionStart
    } else if (selectionStart >= lineStartIndex + commentIndex + commentStyle.length) {
      // cursor is after comment
      editor.selectionStart = selectionStart - commentStyle.length
    } else {
      // cursor is in the middle of comment
      editor.selectionStart = lineStartIndex + commentIndex
    }
    // restore selectionEnd
    if (selectionEnd === selectionStart) {
      editor.selectionEnd = editor.selectionStart
    } else if (lines.length > 1) {
      editor.selectionEnd = selectionEnd - charsRemoved
    } else {
      let lastLine = lines[lines.length - 1]
      let commentIndex = lastLine.indexOf("//")
      let commentStyle = lastLine[commentIndex + 2] === " " ? "// " : "//"
      editor.selectionEnd = selectionEnd - commentStyle.length
      // TODO LESSON IDEA (MATH): calculate cycles per second. Calculate how long it takes for a certain calulation to occur.
      // e.g. how long it takes to count the length of a very long string (containing code)
      // e.g. how long it takes for regex events
    }
  }

  function tabListener(e) {
    let editor = e.target
    if (e.shiftKey) {
      untabSelection(editor)
    } else {
      tabSelection(editor)
    }
    localStorage.setItem("editorContent", editor.value)
  }
  const TAB = "  "
  const SPACE = " "
  function tabSelection(editor) {
    let { value: code, selectionStart, selectionEnd } = editor
    let lineStartIndex = getLineStartIndex(editor)
    if (selectionStart === selectionEnd) {
      if (code.substring(lineStartIndex, selectionStart).trim() !== "") {
        editor.value =
          code.substring(0, selectionStart) + TAB + code.substring(selectionStart)
      } else {
        editor.value =
          code.substring(0, lineStartIndex) + TAB + code.substring(lineStartIndex)
      }
      editor.selectionStart = selectionStart + TAB.length
      editor.selectionEnd = selectionEnd + TAB.length
    } else {
      let lines =
        selectionStart !== selectionEnd
          ? code.substring(lineStartIndex, selectionEnd).split("\n")
          : { length: 1 }
      if (lines.length > 1) {
        let charsAdded = 0
        let replacementCode = code.substring(0, lineStartIndex)
        lines.forEach((line, i) => {
          // console.log('line')
          if (line !== "") {
            replacementCode += TAB + line
            charsAdded += TAB.length
          }
          if (i < lines.length - 1) {
            replacementCode += "\n"
          }
        })
        replacementCode += code.substring(selectionEnd)
        editor.value = replacementCode
        editor.selectionStart = selectionStart + (lines[0] !== "" ? TAB.length : "")
        editor.selectionEnd = selectionEnd + charsAdded
      } else {
        editor.value =
          code.substring(0, lineStartIndex) + TAB + code.substring(lineStartIndex)
        editor.selectionStart = selectionStart + TAB.length
        editor.selectionEnd = selectionEnd + TAB.length
      }
    }
  }
  function untabSelection(editor) {
    let { value: code, selectionStart, selectionEnd } = editor
    let lineStartIndex = getLineStartIndex(editor)
    if (selectionStart === selectionEnd) {
      let lineEndIndex = getLineEndIndex(editor)
      let charsRemoved = 0
      let line = code.substring(lineStartIndex, lineEndIndex)
      if (line.startsWith(TAB)) {
        editor.value =
          code.substring(0, lineStartIndex) +
          code.substring(lineStartIndex + TAB.length)
        charsRemoved = TAB.length
      } else if (line.startsWith(SPACE)) {
        editor.value =
          code.substring(0, lineStartIndex) +
          code.substring(lineStartIndex + SPACE.length)
        charsRemoved = SPACE.length
      }
      if (line.startsWith(SPACE)) {
        editor.selectionStart =
          selectionStart - charsRemoved < lineStartIndex
            ? lineStartIndex
            : selectionStart - charsRemoved
        editor.selectionEnd = editor.selectionStart
      }
    } else {
      let lines =
        selectionStart !== selectionEnd
          ? code.substring(lineStartIndex, selectionEnd).split("\n")
          : { length: 1 }
      if (lines.length > 1) {
        let replacementCode = code.substring(0, lineStartIndex)
        let charsRemoved = 0
        lines.forEach((line, i) => {
          if (line !== "") {
            if (line.startsWith(TAB)) {
              replacementCode += line.substring(TAB.length)
              charsRemoved += TAB.length
            } else if (line.startsWith(SPACE)) {
              replacementCode += line.substring(SPACE.length)
              charsRemoved += SPACE.length
            } else {
              replacementCode += line
            }
          }
          if (i < lines.length - 1) {
            replacementCode += "\n"
          }
        })
        replacementCode += code.substring(selectionEnd)
        editor.value = replacementCode
        let firstLine = lines[0]
        if (firstLine.startsWith(SPACE)) {
          let charsRemovedFromFirstLine = firstLine.startsWith(TAB)
            ? TAB.length
            : SPACE.length
          editor.selectionStart =
            selectionStart - charsRemovedFromFirstLine < lineStartIndex
              ? lineStartIndex
              : selectionStart - charsRemovedFromFirstLine
        } else {
          editor.selectionStart = selectionStart
        }
        editor.selectionEnd = selectionEnd - charsRemoved
      } else {
        let line = lines[0]
        if (line.startsWith(SPACE)) {
          let charsRemoved = line.startsWith(TAB) ? TAB.length : SPACE.length
          editor.value =
            code.substring(0, lineStartIndex) +
            code.substring(lineStartIndex + charsRemoved)
          editor.selectionStart =
            selectionStart - charsRemoved < lineStartIndex
              ? lineStartIndex
              : selectionStart - charsRemoved
          editor.selectionEnd = selectionEnd - charsRemoved
        }
      }
    }
  }

  window.v = {
    xruleCanvas,
    yruleCanvas,
    world,
  }
  window.f = {
    toggleTransitionOnEval,
    setTransitionOnEvalTime,
  }
  window.w = world
  window.log = (...args) => console.log(...args)

  themeConfiguration()
  //
}

function themeConfiguration() {
  let editor = document.getElementById("editor")
  function setDarkmodeTheme() {
    document.body.classList.add("bg-black-90", "near-white")
    document.body.dataset.theme = "dark"
    editor.classList.add("darkmode")
    currentTheme = "dark"
    localStorage.setItem("theme", currentTheme)
  }
  function setLightmodeTheme() {
    document.body.classList.remove("bg-black-90", "near-white")
    delete document.body.dataset.theme
    editor.classList.remove("darkmode")
    currentTheme = "light"
    localStorage.setItem("theme", currentTheme)
  }
  function setTheme(theme) {
    switch (theme) {
      case "dark":
        setDarkmodeTheme()
        break
      case "light":
        setLightmodeTheme()
        break
    }
    bag.createCanvasRule()
  }

  // eslint-disable-next-line no-unused-vars
  document.getElementById("toggle-theme").addEventListener("click", (e) => {
    if (currentTheme === "dark") {
      setTheme("light")
    } else if (currentTheme === "light") {
      setTheme("dark")
    }
  })
  setTheme(currentTheme)
  revealDocumentBody()
  revealEditor()
}

function revealDocumentBody() {
  // Set transition animation property
  let transitionDuration = 1.5
  let transitions = [
    `opacity ${transitionDuration}s ease-in-out`,
    `background-color ${transitionDuration}s`,
  ]
  document.body.style.transition = transitions.join()

  // Remove black background and restore full opacity
  document.body.classList.remove("bg-black")
  document.body.classList.remove("o-01")
}

function revealEditor() {
  // Set transition animation property
  let editor = document.getElementById("editor")
  let transitionDuration = 1.5
  let transitions = [
    `opacity ${transitionDuration}s ease-in-out`,
    `background-color ${transitionDuration}s`,
    `color ${transitionDuration}s`,
  ]
  editor.style.transition = transitions.join()

  // Remove black background and restore full opacity
  editor.classList.remove("bg-black")
  editor.classList.remove("o-01")
}

function getEditorWelcomeMessage() {
  return `// Hello there!
// This is a place for you to write a computer program, or "code script".

// Here's an example of how to create a body of water...

`
}

function getEditorInitialScript() {
  return `
// draw water
setColor('aqua')
fillRect(0, 0, world.width, world.height)

// draw bottom
var grassHeight = 50
setColor('green')
fillRect(0, world.height - grassHeight, world.width, grassHeight)


// Press CTRL+Space for some magic.

`
}

var platformerScript = `
// draw avatar
var avatarDimensions = {
  height: 25,
  width: 25
}
var avatarPosition = {
  x: 0,
  y: world.height - grassHeight - avatarDimensions.height,
  onGround: false,
}
var ad = avatarDimensions
var ap = avatarPosition
setColor('tan')
fillRect(ap.x, ap.y, ad.width, ad.height)

var moveDistance = 10

function drawWorld() {
  // draw water
  setColor('aqua')
  fillRect(0, 0, world.width, world.height)

  // draw bottom
  var grassHeight = 50
  setColor('green')
  fillRect(0, world.height - grassHeight, world.width, grassHeight)
}

function drawAvatar() {
  setColor('tan')
  fillRect(ap.x, ap.y, ad.width, ad.height)
}

// addEventListener('keydown', function(event) {
//   if (event.key == 'ArrowUp') {
//     ap.y = ap.y - moveDistance
//   } else if (event.key == 'ArrowRight') {
//     ap.x = ap.x + moveDistance
//   } else if (event.key == 'ArrowDown') {
//     ap.y = ap.y + moveDistance
//   } else if (event.key == 'ArrowLeft') {
//     ap.x = ap.x - moveDistance
//   }
// })

function updateUniverse() {
  // update state
  if (holdLeft) {
    avatarVelocity.x = -2
  }
  if (holdRight) {
    avatarVelocity.x = 2
  }
  avatarPosition.x = avatarPosition.x + avatarVelocity.x
  avatarPosition.y = avatarPosition.y + avatarVelocity.y
  if (avatarPosition.onGround) {
    avatarVelocity.x *= 0.8
  } else {
    avatarVelocity.y += gravity
  }
  avatarPosition.onGround = false
  checkIfOnGround()

  // draw universe
  drawWorld()
  drawAvatar()
}

// Begin logic for physics simulation
var gravity = 0.5
var holdLeft = false
var holdRight = false
var avatarVelocity = {
  x: 0,
  y: 0
}
var av = avatarVelocity

function checkIfOnGround() {
// TODO: Make easier to understand
  var grassY = world.height - grassHeight
  if(ap.y + ad.height > grassY) {
    ap.y = grassY - ad.height;
    ap.onGround = true;
  }
}

addEventListener('keydown', function(event) {
  if (event.key == 'ArrowLeft') {
    holdLeft = true
  }
  if (event.key == 'ArrowUp') {
    if (ap.onGround) {
      av.y = -10
    }
  }
  if (event.key == 'ArrowRight') {
    holdRight = true
  }
})

addEventListener('keyup', function(event) {
  if (event.key == 'ArrowLeft') {
    holdLeft = false
  }
  if (event.key == 'ArrowUp') {
    if (av.y < -3) {
      av.y = -3
    }
  }
  if (event.key == 'ArrowRight') {
    holdRight = false
  }
})


// Game Loop
setInterval(updateUniverse, 1000/60)
`

function scrollToLineOfTextarea(textarea, line) {
  let lineHeight = textarea.scrollHeight / textarea.rows
  let position = (line - 1) * lineHeight
  textarea.scroll({ behavior: "smooth", left: 0, top: position })
}

function scrollToBottomOfEditor() {
  let editor = document.getElementById("editor")
  scrollToLineOfTextarea(editor, editor.scrollHeight)
}


main()

import "./gui/buttons.js"
