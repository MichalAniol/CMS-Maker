const editor = document.getElementById('editor'),
    effect = document.getElementById('effect'),
    result = document.getElementById('result'),
    leftBor = document.getElementById('left_border'),
    rightBor = document.getElementById('right_border'),
    sizeNow = document.getElementById('size_now'),
    changeImme = document.getElementById('chang_imme'),
    change = document.getElementById('change'),
    sourse = document.getElementById('sourse'),
    webSrc = document.getElementById('web_src');

const getH = item => item.getBoundingClientRect().height;
const getRect = item => item.getBoundingClientRect();

const testMode = true;

const v = {
    clickDown: false,
    posY: 0,
    posX: 0,
    editorH: 0,
    effectH: 0,
    resL: 0,
    resR: 0,
    resT: 0,
    resH: 0,
    resC: 0,
    resA: 0,
    leftBor: false,
    changeImme: false
}

var changeEvent = null;
const changeImmeOnOff = () => {
    if (v.changeImme) {
        v.changeImme = false;
        changeImme.innerHTML = 'change immediately: off';
        change.disabled = false;
        clearInterval(changeEvent)
    } else {
        v.changeImme = true;
        changeImme.innerHTML = 'change immediately: on'
        change.disabled = true;
        setChange();
        changeEvent = setInterval(() => {
            setChange();
        }, 300);
    }
}

const setChange = () => {
    let r1 = sourse.value;
    let p1 = r1.indexOf('src="/data/include/cms')
    console.log('%c p1:', 'background: #ffcc00; color: #003300', p1)
    while (p1 > -1) {
        r1 = r1.replace('src="/data/include/cms', 'src="' + webSrc.value + '/data/include/cms')
        p1 = r1.indexOf('src="/data/include/cms')
    }
    result.innerHTML = r1;
    effect.style.height = 'auto'
    measuerResult();
}

const setImmChange = () => {
    if (v.changeImme) {
        setTimeout(() => {
            setChange();
        }, 30);
    }
}

const clearWhiteSpaces = (r, fi, ci) => {
    r1 = r;
    r2 = ''

    p1 = r1.indexOf('<');
    while (p1 > -1) {
        let p2 = r1.indexOf('>')
        let a = r1.slice(0, p1);
        let b = r1.slice(p1, p2 + 1);
        let p3 = b.indexOf(fi);
        while (p3 > -1) {
            b = b.replace(fi, ci);
            p3 = b.indexOf(fi);
        }

        let c = r1.slice(p2 + 1, r1.length);
        r2 += a + b;
        r1 = c;

        p1 = r1.indexOf('<');
    }

    return r2;
}

const analise = () => {
    let cssList = [];
    let html = sourse.value;
    html = ChangeValue(html, '\\', '');

    let tempHtml = html;
    // tempHtml = ChangeValue(tempHtml, '\\\"', '"');

    let p1 = html.indexOf('<');
    let p2 = html.indexOf('>');
    while (p1 > -1) {
        let txt = html.slice(p1, p2 + 1);

        html = html.slice(p2 + 1, html.length);

        p1 = html.indexOf('<');
        p2 = html.indexOf('>');

        if (txt.indexOf('href=') == -1) {

            let back = false;
            if (txt.indexOf('</') == -1) {
                back = true
            }
            txt = txt.replace('</', '<')

            if (!cssList.some(e => e.txt == txt)) {
                cssList.push(back ?
                    { num: 0, txt: txt, end: 1 }
                    :
                    { num: 1, txt: txt, end: 0 }
                )
            } else {
                let item = cssList.find(e => e.txt == txt);
                if (back) {
                    item.end++
                } else {
                    item.num++
                }
            }
        }
    }
    if (testMode) console.log('%c tempHtml:', 'background: #ffcc00; color: #003300', tempHtml)
    if (testMode) console.log('%c cssList:', 'background: #ffcc00; color: #003300', cssList)



    let styleList = { style: [], class: [] };

    for (let css of cssList) {
        let styleOn = css.txt.indexOf('style=');
        let classOn = css.txt.indexOf('class=');

        const setStyle = (txt, num, end) => {
            let p1 = txt.indexOf('"');
            let tempCss = txt.slice(p1 + 1, txt.length);

            let p2 = tempCss.indexOf('"');

            if (p1 > -1) {
                let t = txt.slice(p1 + 1, p1 + p2 + 1);

                let n = num + end;
                if (!styleList.style.some(e => txt == t))
                    styleList.style.push({ txt: t, num: n })
            }
        }

        const setClass = (txt, num, end) => {
            let p1 = txt.indexOf('"');
            let tempCss = txt.slice(p1 + 1, txt.length);

            let p2 = tempCss.indexOf('"');

            if (p1 > -1) {
                let t = txt.slice(p1 + 1, p1 + p2 + 1);

                let n = num + end;
                if (!styleList.class.some(e => txt == t))
                    styleList.class.push({ txt: t, num: n })
            }
        }

        if (styleOn > -1 && classOn > -1) {
            if (styleOn < classOn) {
                let style_part = css.txt.slice(0, classOn);
                setStyle(style_part, css.num, css.end)

                let class_part = css.txt.slice(classOn, css.txt.length);
                setClass(class_part, css.num, css.end)
            }
            if (styleOn > classOn) {
                let class_part = css.txt.slice(0, styleOn);
                setClass(class_part, css.num, css.end)

                let style_part = css.txt.slice(styleOn, css.txt.length);
                setStyle(style_part, css.num, css.end)
            }
            continue
        }


        if (styleOn > -1) {
            setStyle(css.txt, css.num, css.end)
        }

        if (classOn > -1) {
            setClass(css.txt, css.num, css.end)
        }
    }
    if (testMode) console.log('%c styleList:', 'background: #ffcc00; color: #003300', styleList)

    styleList.tempHtml = tempHtml;

    return styleList;
}

const ChangeValue = (txt, old, rep) => {
    let index = txt.indexOf(old);

    while (index > -1) {
        txt = txt.replace(old, rep);
        index = txt.indexOf(old);
    }

    return txt;
}



const deleteClasses = () => {


    let styleList = analise();

    let tempHtml = styleList.tempHtml;

    for (let i = 0; i < styleList.class.length; ++i) {

        let styTemp = styleList.class[i].txt;

        let indexClass = tempHtml.indexOf(styTemp);
        while (indexClass > -1) {
            tempHtml = tempHtml.replace(styTemp, '');
            tempHtml = tempHtml.replace(' class=""', '');

            indexClass = tempHtml.indexOf(styTemp);
        }
    }

    if (testMode) console.log('%c tempHtml:', 'background: #ffcc00; color: #003300', tempHtml)
    sourse.value = tempHtml;
}

const deleteStyles = () => {

    let styleList = analise();


    let tempHtml = styleList.tempHtml;

    for (let i = 0; i < styleList.style.length; ++i) {

        let styTemp = styleList.style[i].txt;
        let sty = styleList.style[i].txt;

        let indexClass = tempHtml.indexOf(styTemp);
        while (indexClass > -1) {
            tempHtml = tempHtml.replace(styTemp, '');
            tempHtml = tempHtml.replace(' style=""', '');


            indexClass = tempHtml.indexOf(styTemp);
        }
    }

    if (testMode) console.log('%c tempHtml:', 'background: #ffcc00; color: #003300', tempHtml)
    sourse.value = tempHtml;
}

const copy = () => {
    sourse.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error(err)
    }
}

const moveSpliter = e => {
    if (!v.clickDown) {
        v.posY = e.clientY;
        v.editorH = getH(editor);
        v.effectH = getH(effect);
        v.clickDown = true;
    }
    let y = e.clientY - v.posY,
        ediH = v.editorH + y,
        effH = v.effectH - y;

    // if (ediH > 100 && (window.innerHeight - (ediH)) > 100) {
    editor.style.height = (ediH) + 'px';
    // effect.style.height = (effH) + 'px';
    measuerResult();
    // }
}

const fitBorders = () => {
    let r = getRect(result);
    v.resL = r.left - 10;
    v.resR = r.right - 10;

    leftBor.style.top = v.resT + 'px';
    leftBor.style.left = v.resL + 'px';
    leftBor.style.height = v.resH + 'px';

    rightBor.style.top = v.resT + 'px';
    rightBor.style.left = v.resR + 'px';
    rightBor.style.height = v.resH + 'px';

    sizeNow.innerHTML = 'width: ' + (r.width - 2) + 'px';
}

const measuerResult = () => {
    let r = getRect(result);
    v.resC = (r.left + r.right) / 2;
    v.resA = (r.right - r.left);
    v.resT = r.top;
    v.resH = r.height;

    fitBorders();
}

const setResultWith = (w = window.innerWidth - 60) => {
    result.style.width = w + 'px';
    fitBorders();
}

const changeResWidth = e => {
    if (!v.clickDown) {
        v.posX = e.clientX;
        v.clickDown = true;
        v.leftBor = v.posX < v.resC;
        measuerResult();
    }

    let x = v.leftBor ? ((v.resA / 2) - (e.clientX - v.posX)) * 2 : ((v.resA / 2) + (e.clientX - v.posX)) * 2;
    if (x < 320) { x = 320 }
    result.style.width = x + 'px';
    fitBorders();
}

const mouseDown = (e) => {
    if (e.target.className == 'spliter') {
        document.addEventListener('mousemove', moveSpliter)
    }
    if (e.target.className == 'border') {
        document.addEventListener('mousemove', changeResWidth)
    }
    v.clickDown = false;

}

const mouseUp = () => {
    document.removeEventListener('mousemove', moveSpliter);
    document.removeEventListener('mousemove', changeResWidth);
    let r = getRect(result);
    v.resA = (r.right - r.left);
}

const start = () => {
    document.body.onmousedown = e => mouseDown(e);
    document.body.onmouseup = e => mouseUp();
    measuerResult();
    measuerResult();
    setResultWith();
    // webSrc.value = 'https://185.157.83.50';
}

start();















if (false) {
    for (let d of data) {
        let cssList = []
        let html = d.html;
        let tempHtml = d.html;

        let p1 = html.indexOf('<');
        let p2 = html.indexOf('>');
        while (p1 > -1) {
            let txt = html.slice(p1, p2 + 1);

            html = html.slice(p2 + 1, html.length);

            p1 = html.indexOf('<');
            p2 = html.indexOf('>');

            if (txt.indexOf('href=') == -1) {

                let back = false;
                if (txt.indexOf('</') == -1) {
                    back = true
                }
                txt = txt.replace('</', '<')

                if (!cssList.some(e => e.txt == txt)) {
                    cssList.push(back ?
                        { num: 0, txt: txt, end: 1 }
                        :
                        { num: 1, txt: txt, end: 0 }
                    )
                } else {
                    let item = cssList.find(e => e.txt == txt);
                    if (back) {
                        item.end++
                    } else {
                        item.num++
                    }
                }
            }
        }


        let styleList = { style: [], class: [] };

        for (let css of cssList) {
            let styleOn = css.txt.indexOf('style=');
            let classOn = css.txt.indexOf('class=');

            const setStyle = (txt, num, end) => {
                let p1 = txt.indexOf('\"');
                let tempCss = txt.slice(p1 + 1, txt.length);

                let p2 = tempCss.indexOf('\"');

                if (p1 > -1) {
                    let t = txt.slice(p1 + 1, p1 + p2 + 1);

                    let n = num + end;
                    if (!styleList.style.some(e => txt == t))
                        styleList.style.push({ txt: t, num: n })
                }
            }

            const setClass = (txt, num, end) => {
                let p1 = txt.indexOf('\"');
                let tempCss = txt.slice(p1 + 1, txt.length);

                let p2 = tempCss.indexOf('\"');

                if (p1 > -1) {
                    let t = txt.slice(p1 + 1, p1 + p2 + 1);

                    let n = num + end;
                    if (!styleList.class.some(e => txt == t))
                        styleList.class.push({ txt: t, num: n })
                }
            }

            if (styleOn > -1 && classOn > -1) {
                if (styleOn < classOn) {
                    let style_part = css.txt.slice(0, classOn);
                    setStyle(style_part, css.num, css.end)

                    let class_part = css.txt.slice(classOn, css.txt.length);
                    setClass(class_part, css.num, css.end)
                }
                if (styleOn > classOn) {
                    let class_part = css.txt.slice(0, styleOn);
                    setClass(class_part, css.num, css.end)

                    let style_part = css.txt.slice(styleOn, css.txt.length);
                    setStyle(style_part, css.num, css.end)
                }
                continue
            }


            if (styleOn > -1) {
                setStyle(css.txt, css.num, css.end)
            }

            if (classOn > -1) {
                setClass(css.txt, css.num, css.end)
            }
        }



        let resHtml = '<style>';
        for (let i = 0; i < styleList.style.length; ++i) {

            let styTemp = styleList.style[i].txt;
            let sty = styleList.style[i].txt;

            for (let c of chenges) {
                sty = ChangeValue(sty, c[0], c[1]);
            }
            // let num = newStyle.indexOf(sty);

            // resHtml += '.cms_' + num + ' { ' + sty + ' } '

            if (sty != styTemp) {
                let indexClass = tempHtml.indexOf(styTemp);
                while (indexClass > -1) {
                    tempHtml = tempHtml.replace(styTemp, sty);

                    // tempHtml = tempHtml.replace(styTemp, '');
                    // tempHtml = tempHtml.replace('style=""', 'class="cms_' + num + '"');

                    indexClass = tempHtml.indexOf(styTemp);
                }
            }
        }
        // resHtml += '</style>' + tempHtml;
        resHtml = tempHtml;

        let obj = productSitesData.find(e => e.id == d.id);
        let url;
        if (typeof obj == 'undefined') {
            console.log('%c undefined: ' + d.id + ' ---------------------------------------------------------------------------------------------------', 'background: #ffcc00; color: #003300')
        } else {
            url = obj.url;
        }

        resHtml = ChangeValue(resHtml, '\n', '');
        // resHtml = ChangeValue(resHtml, '/data/include/cms', 'https://estesklep.pl/data/include/cms');
        new_html.push({
            url: url,
            html: resHtml
        })
    }
}