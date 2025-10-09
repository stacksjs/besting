const HTMLPage = require("./data/HTMLPage");
const { performance } = require("perf_hooks");
let Window;

function testImportJSDOM() {
    const time1 = performance.now();
    Window = require("happy-dom").Window;
    const time2 = performance.now();
    console.log(`HappyDOM -> Import: ${time2 - time1}ms`);
}

function parseHTML() {
    const time1 = performance.now();
    const window = new Window();
    window.document.write(HTMLPage);
    const time2 = performance.now();
    console.log(`HappyDOM -> Parse HTML: ${time2 - time1}ms`);
}

function serializeHTML() {
    const window = new Window();

    window.document.write(HTMLPage);

    const time1 = performance.now();

    const xmlSerializer = new window.XMLSerializer();

    xmlSerializer.serializeToString(window.document);
    const time2 = performance.now();
    console.log(`HappyDOM -> Serialize HTML: ${time2 - time1}ms`);
}

function querySelectorAllLiElements() {
    const window = new Window();
    window.document.write(HTMLPage);
    const time1 = performance.now();
    const elements = window.document.querySelectorAll("li");
    const time2 = performance.now();
    console.log(
        `HappyDOM -> querySelectorAll('li') found ${
            elements.length
        } elements: ${time2 - time1}ms`
    );
}

function querySelectorAllClassElements() {
    const window = new Window();
    window.document.write(HTMLPage);
    const time1 = performance.now();
    const elements = window.document.querySelectorAll(".flex-shrink-0");
    const time2 = performance.now();
    console.log(
        `HappyDOM -> querySelectorAll('.flex-shrink-0') found ${
            elements.length
        } elements: ${time2 - time1}ms`
    );
}

function querySelectorAllAttributeElements() {
    const window = new Window();
    window.document.write(HTMLPage);
    const time1 = performance.now();
    const elements = window.document.querySelectorAll("[aria-label]");
    const time2 = performance.now();
    console.log(
        `HappyDOM -> querySelectorAll('[aria-label]') found ${
            elements.length
        } elements: ${time2 - time1}ms`
    );
}

function querySelectorAllAttributeContainsElements() {
    const window = new Window();
    window.document.write(HTMLPage);
    const time1 = performance.now();
    const elements = window.document.querySelectorAll(
        '[class~="flex-shrink-0"]'
    );
    const time2 = performance.now();
    console.log(
        `HappyDOM -> querySelectorAll('[class~="flex-shrink-0"]') found ${
            elements.length
        } elements: ${time2 - time1}ms`
    );
}

function querySelectorAllNthChildElements() {
    const window = new Window();
    window.document.write(HTMLPage);
    const time1 = performance.now();
    const elements = window.document.querySelectorAll(":nth-child(2n+1)");
    const time2 = performance.now();
    console.log(
        `HappyDOM -> querySelectorAll(':nth-child(2n+1)') found ${
            elements.length
        } elements: ${time2 - time1}ms`
    );
}

function renderCustomElement() {
    const time1 = performance.now();
    const window = new Window();
    global.HTMLElement = window.HTMLElement;
    window.customElements.define(
        "custom-element",
        require("./data/CustomElement")
    );
    window.document.write(HTMLPage);
    const customElement = window.document.querySelector("custom-element");
    customElement.shadowRoot.innerHTML;
    delete global.HTMLElement;
    const time2 = performance.now();
    console.log(`HappyDOM -> Render custom element': ${time2 - time1}ms`);
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
