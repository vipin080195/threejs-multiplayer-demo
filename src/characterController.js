import * as THREE from 'three'

class CharacterController {
    constructor(params) {
        this.init(params)
    }

    init(params) {
        this.params = params

        /**
         * Initial values & constants
         */
        this.moveAcceleration = 0.1
        this.rotationAccelaration = 0.05
        this.velocity = 0.0


        /**
         * Instantiate controller input
         */
        this.input = new CharacterControllerInput()

        /**
         * TODO: Instantiate FSM
         */

        /**
         * TODO: Load models and Animations
         */

        /**
         * Set target
         */
        this.target = params.mesh
    }

    update(deltaTime) {
        if (this.target == undefined) {
            return
        }

        /**
         * Pull target position and rotation
         */
        const rotationOffset = new THREE.Quaternion()
        const rotationAxis = new THREE.Vector3(0, 1, 0)
        const targetRotation = this.target.quaternion.clone()

        /**
         * Find move velocity
         */
        if (this.input.controlKeys.w) {
            this.velocity += this.moveAcceleration * deltaTime
        } else if (this.input.controlKeys.s) {
            this.velocity -= this.moveAcceleration * deltaTime
        }

        /**
         * Find rotation
         */
        if (this.input.controlKeys.a) {
            rotationOffset.setFromAxisAngle(rotationAxis, 4.0 * Math.PI * deltaTime * this.rotationAccelaration)
            targetRotation.multiply(rotationOffset)
        } else if (this.input.controlKeys.d) {
            rotationOffset.setFromAxisAngle(rotationAxis, 4.0 * -Math.PI * deltaTime * this.rotationAccelaration)
            targetRotation.multiply(rotationOffset)
        }

        /**
         * Apply transformations
         */
        this.target.quaternion.copy(targetRotation)

        // const oldPosition = new THREE.Vector3()
        // oldPosition.copy(this.target.position)

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

export default CharacterController