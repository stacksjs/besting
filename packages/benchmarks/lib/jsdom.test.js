const HTMLPage = require('./data/HTMLPage');
const { performance } = require('perf_hooks');
let JSDOM;

function testImportJSDOM() {
    const time1 = performance.now();
    JSDOM = require('jsdom').JSDOM;
    const time2 = performance.now();
    console.log(`JSDOM -> Import: ${time2 - time1}ms`);
}

function parseHTML() {
    const time1 = performance.now();
    new JSDOM(HTMLPage);
    const time2 = performance.now();
    console.log(`JSDOM -> Parse HTML: ${time2 - time1}ms`);
}

function serializeHTML() {
    const dom = new JSDOM(HTMLPage);
    const time1 = performance.now();
    const xmlSerializer = new dom.window.XMLSerializer();
    xmlSerializer.serializeToString(dom.window.document);
    const time2 = performance.now();
    console.log(`JSDOM -> Serialize HTML: ${time2 - time1}ms`);
}

function querySelectorAllLiElements() {
    const dom = new JSDOM(HTMLPage);
    const time1 = performance.now();
    const elements = dom.window.document.querySelectorAll('li');
    const time2 = performance.now();
    console.log(`JSDOM -> querySelectorAll('li') found ${elements.length} elements: ${time2 - time1}ms`);
}

function querySelectorAllClassElements() {
    const dom = new JSDOM(HTMLPage);
    const time1 = performance.now();
    const elements = dom.window.document.querySelectorAll('.flex-shrink-0');
    const time2 = performance.now();
    console.log(`JSDOM -> querySelectorAll('.flex-shrink-0') found ${elements.length} elements: ${time2 - time1}ms`);
}

function querySelectorAllAttributeElements() {
    const dom = new JSDOM(HTMLPage);
    const time1 = performance.now();
    const elements = dom.window.document.querySelectorAll('[aria-label]');
    const time2 = performance.now();
    console.log(`JSDOM -> querySelectorAll('[aria-label]') found ${elements.length} elements: ${time2 - time1}ms`);
}

function querySelectorAllAttributeContainsElements() {
    const dom = new JSDOM(HTMLPage);
    const time1 = performance.now();
    const elements = dom.window.document.querySelectorAll('[class~="flex-shrink-0"]');
    const time2 = performance.now();
    console.log(`JSDOM -> querySelectorAll('[class~="flex-shrink-0"]') found ${elements.length} elements: ${time2 - time1}ms`);
}

function querySelectorAllNthChildElements() {
    const dom = new JSDOM(HTMLPage);
    const time1 = performance.now();
    const elements = dom.window.document.querySelectorAll(':nth-child(2n+1)');
    const time2 = performance.now();
    console.log(`JSDOM -> querySelectorAll(':nth-child(2n+1)') found ${elements.length} elements: ${time2 - time1}ms`);
}

function renderCustomElement() {
    const time1 = performance.now();
    const dom = new JSDOM(HTMLPage);
    const window = dom.window;
    global.HTMLElement = window.HTMLElement;
    window.customElements.define('custom-element', require('./data/CustomElement'));
    window.document.write(HTMLPage);
    const customElement = window.document.querySelector('custom-element');
    customElement.shadowRoot.innerHTML;
    delete global.HTMLElement;
    const time2 = performance.now();
    console.log(`JSDOM -> Render custom element': ${time2 - time1}ms`);
}

testImportJSDOM();
parseHTML();
serializeHTML();
querySelectorAllLiElements();
querySelectorAllClassElements();
querySelectorAllAttributeElements();
querySelectorAllAttributeContainsElements();
querySelectorAllNthChildElements();
renderCustomElement();