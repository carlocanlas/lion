import { css, html, DelegateMixin, SlotMixin } from '@lion/core';
import { LionLitElement } from '@lion/core/src/LionLitElement.js';

export class LionButton extends DelegateMixin(SlotMixin(LionLitElement)) {
  static get properties() {
    return {
      disabled: {
        type: Boolean,
        reflect: true,
      },
      role: {
        type: String,
        reflect: true,
      },
      tabindex: {
        type: Number,
        reflect: true,
      },
    };
  }

  render() {
    return html`
      <div class="btn">
        <slot></slot>
        <slot name="_button"></slot>
        <div class="click-area" @click="${this.__clickDelegationHandler}"></div>
      </div>
    `;
  }

  static get styles() {
    return [
      css`
        :host {
          display: inline-block;
          padding-top: 2px;
          padding-bottom: 2px;
          height: 40px; /* src = https://www.smashingmagazine.com/2012/02/finger-friendly-design-ideal-mobile-touchscreen-target-sizes/ */
          outline: 0;
          background-color: transparent;
          box-sizing: border-box;
        }

        .btn {
          height: 24px;
          display: flex;
          align-items: center;
          position: relative;
          border: 1px solid black;
          border-radius: 8px;
          background: whitesmoke;
          color: black;
          padding: 7px 15px;
        }

        :host .btn ::slotted(button) {
          position: absolute;
          visibility: hidden;
        }

        .click-area {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          margin: -3px -1px;
          padding: 0;
        }

        :host(:focus) {
          outline: none;
        }

        :host(:focus) .btn {
          border-color: lightblue;
          box-shadow: 0 0 8px lightblue, 0 0 0 1px lightblue;
        }

        :host(:hover) .btn {
          background: black;
          color: whitesmoke;
        }

        :host(:hover) .btn ::slotted(lion-icon) {
          fill: whitesmoke;
        }

        :host(:active) .btn,
        .btn.active {
          background: grey;
        }

        :host([disabled]) {
          pointer-events: none;
        }

        :host([disabled]) .btn {
          background: lightgray;
          color: gray;
          fill: gray;
          border-color: gray;
        }
      `,
    ];
  }

  _requestUpdate(name, oldValue) {
    super._requestUpdate(name, oldValue);
    if (name === 'disabled') {
      this.__onDisabledChanged(oldValue);
    }
  }

  get delegations() {
    return {
      ...super.delegations,
      target: () => this.$$slot('_button'),
      attributes: ['type'],
    };
  }

  get slots() {
    return {
      ...super.slots,
      _button: () => {
        if (!this.constructor._button) {
          this.constructor._button = document.createElement('button');
          this.constructor._button.setAttribute('slot', '_button');
          this.constructor._button.setAttribute('tabindex', '-1');
        }
        return this.constructor._button.cloneNode();
      },
    };
  }

  constructor() {
    super();
    this.disabled = false;
    this.role = 'button';
    this.tabindex = 0;
    this.__keydownDelegationHandler = this.__keydownDelegationHandler.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.__setupDelegation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__teardownDelegation();
  }

  __clickDelegationHandler(e) {
    e.stopPropagation(); // prevent click on the fake element and cause click on the native button
    this.$$slot('_button').click();
  }

  __setupDelegation() {
    this.addEventListener('keydown', this.__keydownDelegationHandler);
    this.addEventListener('keyup', this.__keyupDelegationHandler);
  }

  __teardownDelegation() {
    this.removeEventListener('keydown', this.__keydownDelegationHandler);
    this.removeEventListener('keyup', this.__keyupDelegationHandler);
  }

  __keydownDelegationHandler(e) {
    if (e.keyCode === 32 /* space */ || e.keyCode === 13 /* enter */) {
      e.preventDefault();
      this.shadowRoot.querySelector('.btn').classList.add('active');
    }
  }

  __keyupDelegationHandler(e) {
    // Makes the real button the trigger in forms (will submit form, as opposed to paper-button)
    // and make click handlers on button work on space and enter
    if (e.keyCode === 32 /* space */ || e.keyCode === 13 /* enter */) {
      e.preventDefault();
      this.shadowRoot.querySelector('.btn').classList.remove('active');
      this.$$slot('_button').click();
    }
  }

  __onDisabledChanged() {
    if (this.disabled) {
      this.__originalTabIndex = this.tabindex;
      this.tabindex = -1;
    } else {
      this.tabindex = this.__originalTabIndex;
    }
  }
}
