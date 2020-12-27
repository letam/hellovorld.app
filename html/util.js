import "/polyfills/trimStart.js"

export function sleep(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}

// function wait(callback, seconds = 2) {
//   setTimeout(callback, seconds * 1000)
// }

export function strSplice(str, index, add = "") {
  if (index < 0) {
    throw new Error("Invalid index")
  }
  return str.slice(0, index) + add + str.slice(index)
}

export const $ = function (query) {
  if (query.includes(" ")) {
    return document.querySelectorAll(query)
  } else if (query.startsWith("#")) {
    return document.getElementById(query.substring(1))
  } else if (query.startsWith(".")) {
    return document.getElementsByClassName(query.substring(1))
  }
}

// let statusKeyboardShortcuts = $("#statusKeyboardShortcuts")
// let statusKeyboardShortcutsValue = localStorage.getItem("toggleKeyboardShortcuts") || 'off'
// statusKeyboardShortcuts.innerText = statusKeyboardShortcutsValue
// function toggleKeyboardShortcuts(status = !statusKeyboardShortcutsValue) {
//   status = statusKeyboardShortcutsValue
// }
// $("#toggleKeyboardShortcuts").addEventListener("click", e => {
//   if (isRulesVisible) {
//     hideRules()
//   } else {
//     showRules()
//   }
// })
