import * as THREE from 'three'

class CharacterController {
    constructor(params) {
        this.init(params)
    }

    init(params) {
        this.params = params

        /**
         * Instantiate controller input
         */
        this.input = new CharacterControllerInput()

        /**
         * Instantiate FSM
         */

        /**
         * TODO: Load models and Animations
         */
    }
}

class CharacterControllerInput {
    constructor() {
        /**
         * Map to determine which keys are pressed
         */
        this.controlKeys = {
            w: false,
            a: false,
            s: false,
            d: false
        }

        window.addEventListener('keydown', (e) => this.handleKeyDown(e))
        window.addEventListener('keyup', (e) => this.handleKeyUp(e))
    }

    handleKeyDown(e) {
        const pressedKey = e.code.replace('Key', '').toLowerCase()
        switch(pressedKey) {
            case w:
                this.controlKeys.w = true
                break
            case a: 
                this.controlKeys.a = true
                break
            case s:
                this.controlKeys.s = true
                break
            case d:
                this.controlKeys.s = true
                break
        }
    }

    handleKeyUp(e) {
        const pressedKey = e.code.replace('Key', '').toLowerCase()
        switch(pressedKey) {
            case w:
                this.controlKeys.w = false
                break
            case a: 
                this.controlKeys.a = false
                break
            case s:
                this.controlKeys.s = false
                break
            case d:
                this.controlKeys.s = false
                break
        }
    }
}