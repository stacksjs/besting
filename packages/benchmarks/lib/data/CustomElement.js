/**
 * CustomElement test class.
 */
class CustomElement extends HTMLElement {
	changedAttributes = [];

	/**
	 * Returns a list of observed attributes.
	 *
	 * @return Observered attributes.
	 */
	static get observedAttributes() {
		return ['key1', 'key2'];
	}

	/**
	 * Constructor.
	 */
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	/**
	 * @override
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		this.changedAttributes.push({ name, oldValue, newValue });
	}

	/**
	 * @override
	 */
	connectedCallback() {
		this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                div {
                    color: red;
                }
                .class1 {
                    color: blue;
                }
                .class1.class2 span {
                    color: green;
                }
                .class1[attr1="value1"] {
                    color: yellow;
                }
                [attr1="value1"] {
                    color: yellow;
                }
            </style>
            <div>
				<span>
					<div class="class1 class2" id="id">
						<!-- Comment 1 !-->
						<b>Bold</b>
						<!-- Comment 2 !-->
						<span><slot></slot></span>
					</div>
					<article class="class1 class2" id="id">
						<!-- Comment 1 !-->
						<b>Bold</b>
						<!-- Comment 2 !-->
					</article>
                </span>
            </div>
        `;
	}
}

module.exports = CustomElement;