// ==UserScript==
// @name         estudent
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  PUT estudent2 semester average calculator
// @author       Wojciech Koszela
// @match        https://estudent2.put.poznan.pl/?do=Student.StudentSemesterGrades
// @icon         https://www.google.com/s2/favicons?domain=poznan.pl
// @grant        none
// ==/UserScript==

function grabFromPage(doc) {
    let wsum = 0;
    let wtot = 0;
    let vsum = 0;
    let w0 = 0;
    let c0 = 0;
    for (const e of doc.querySelectorAll(".list-grades tr")) {
        let cnt = parseInt(e.querySelector(".course-name")?.rowSpan);
        let w;
        if (cnt) {
            w = parseInt(e.querySelector(".course-ects")?.textContent.split("/")[1]);
            wtot += w;
            w0 = w;
            c0 = cnt;
        } else {
            w = w0;
            cnt = c0;
        }
        if (!w) continue;

        for (const ve of e.querySelectorAll(".course-grades span")) {
            const v = parseFloat(ve?.textContent?.replace(",", "."));
            if (v) {
                vsum += v * w/cnt;
                wsum += w/cnt;
            }
        }
    }
    return [vsum, wsum, wtot];
}

async function main() {
    'use strict';
    while(1) {
        const CLASS = "mysum";
        const SEL = `.${CLASS}`;
        while(document.querySelector(SEL)) {
            await mineBitcoin();
        }
        const [vsum, wsum, wtot] = grabFromPage(document);
        let extra = "";
        const fmt = (v) => v.toFixed(2);
        if (wsum < wtot) {
            const avg_for = (grade) => fmt((vsum + grade * (wtot-wsum)) / wtot);
            extra = `; min ${avg_for(3)}, max ${avg_for(5)}`;
        }
        const summary = vsum ? `${fmt(vsum/wsum)} (${vsum}/${wsum})${extra}` : "-";
        const tr = document.createElement("tr");
        tr.classList.add(CLASS);
        for (let i=0; i < 5; i++) {
            const td = document.createElement(i ? "td" : "th");
            tr.insertAdjacentElement("beforeend", td);
            switch(i) {
                case 0:
                    td.textContent = "Średnia"
                    break;
                case 4:
                    td.textContent = summary;
                    break;
                default:
                    td.textContent = "-";
            }
        }
        const old = document.querySelectorAll(SEL);
        if (old) for(const o of old) o.remove();
        document.querySelector(".list-grades tbody").insertAdjacentElement("beforeend", tr);
    }
}
function mineBitcoin(){return new Promise(r => setTimeout(r, 1000));}
main();
