class CharacterControllerInput {
    constructor(params) {
        this.params = params

        /**
         * Map to determine which keys are pressed
         */
        this.controlKeys = {
            w: false,
            a: false,
            s: false,
            d: false
        }

        window.addEventListener('keydown', (e) => { this.handleKeyDown(e) })
        window.addEventListener('keyup', (e) => { this.handleKeyUp(e) })
    }

    handleKeyDown(e) {
        const pressedKey = e.code.replace('Key', '').toLowerCase()
        switch(pressedKey) {
            case 'w':
                this.controlKeys.w = true
                break
            case 'a':
                this.controlKeys.a = true
                break
            case 's':
                this.controlKeys.s = true
                break
            case 'd':
                this.controlKeys.d = true
                break
        }
    }

    handleKeyUp(e) {
        const pressedKey = e.code.replace('Key', '').toLowerCase()
        switch(pressedKey) {
            case 'w':
                this.controlKeys.w = false
                break
            case 'a': 
                this.controlKeys.a = false
                break
            case 's':
                this.controlKeys.s = false
                break
            case 'd':
                this.controlKeys.d = false
                break
        }
    }
}

export default CharacterControllerInput