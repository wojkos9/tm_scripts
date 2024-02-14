// ==UserScript==
// @name         Kanji
// @namespace    http://tampermonkey.net/
// @version      2024-01-25
// @description  try to take over the world!
// @author       You
// @match        http*://jlptstudy.net/*/?kanji-list
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jlptstudy.net
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

function shuffle(array, rng) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor((rng ? rng.nextFloat() : Math.random()) * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function contextShuffle(e) {
    const NODES_IN_ROW = 27;
    let node = e.target.closest(".kanji-box");
    const freeList = [];
    const markList = [];
    for (let i = 0; i < NODES_IN_ROW && node != null; i++, node = node.nextElementSibling) {
        (node.classList.contains("shuf-mark") ? markList : freeList).push(node);
    }
    shuffle(freeList);
    shuffle(markList);
    if (markList.length > 0) {
        freeList[0].insertAdjacentElement("afterend", markList[0])
        markList.slice(1).forEach(n => markList[0].insertAdjacentElement("afterend", n));
    }
    freeList.slice(1).forEach(n => freeList[0].insertAdjacentElement("afterend", n));
}

function loadSet() {
    let storedSet = localStorage.getItem("markedSet");
    if (storedSet != null) {
        markedSet = new Set(JSON.parse(storedSet));
    }
}

function saveSet() {
    localStorage.setItem("markedSet", JSON.stringify([...markedSet]));
}

function initTileMarks() {
    const leftSet = new Set([...markedSet]);
    console.log("SET", leftSet);
    document.querySelectorAll(".kanji-box").forEach(e => {
        let k = e.innerText;
        if(leftSet.has(k)) {
            e.classList.add("shuf-mark");
            leftSet.delete(k);
        }
    });
    console.log("SET REMAINING:", leftSet);
}

function toggleTileMark(node) {
    while (node && node !== document.body) {
        let cl = node.classList;
        if (cl.contains('kanji-box')) {
            if (cl.contains('shuf-mark')) {
                cl.remove('shuf-mark');
                markedSet.delete(node.innerText);
                saveSet();
            } else {
                cl.add('shuf-mark');
                markedSet.add(node.innerText);
                saveSet();
            }
            break;
        }
        node = node.parentElement;
    }
}

function RNG(seed) {
    this.m = 0x80000000;
    this.a = 1103515245;
    this.c = 12345;
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}

RNG.prototype.nextFloat = function() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
}

function initShuffle() {
    const rng = new RNG(1);
    const kan = Array.from(document.querySelectorAll(".kanji-box"));

    let e0 = kan[0].parentElement;

    shuffle(kan, rng);

    for (const k of kan) {
        e0.insertAdjacentElement('beforeend', k);
    }
}

function onKanjiContentLoad(action) {
    const contentDiv = document.getElementById("content");
    new MutationObserver((ml, o) => {
        action();
        o.disconnect();
    }).observe(contentDiv, {childList: true});
}

function onToggleEvent(e) {
    toggleTileMark(e.target);
    e.preventDefault();
}

// let contextMenuEvent = null;
// addEventListener("contextmenu", e => {
//     contextMenuEvent = e;
// });
// GM_registerMenuCommand("Shuffle", () => contextShuffle(contextMenuEvent), "s")

GM_addStyle("#kanji-body .shuf-mark { color: #4400bb; } .kanji-box:nth-child(27n+1) {background-color: #00ff00;}")

let markedSet = new Set();

loadSet();
//document.body.addEventListener('auxclick', e => e.button == 1 && toggleTileMark(e.target));
onKanjiContentLoad(() => {
    initShuffle();
    initTileMarks();
    document.querySelectorAll(".kanji-box").forEach(k => k.addEventListener("contextmenu", onToggleEvent));
});
