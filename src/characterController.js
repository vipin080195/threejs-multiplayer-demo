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
        this.decceleration = new THREE.Vector3(-0.00005, -0.000001, -2.5)
        this.acceleration = new THREE.Vector3(0.1, 0.5, 5.0)
        this.velocity = new THREE.Vector3()

        /**
         * Instantiate controller input
         */
        this.input = new CharacterControllerInput(this.params.socket)

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
        const velocity = this.velocity

        const rotationOffset = new THREE.Quaternion()
        const rotationAxis = new THREE.Vector3(0, 1, 0)
        const targetRotation = this.target.quaternion.clone()

        /**
         * Auto deccelerate every frame
         */
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this.decceleration.x,
            velocity.y * this.decceleration.y,
            velocity.z * this.decceleration.z
        )
        frameDecceleration.multiplyScalar(deltaTime)
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z))

        velocity.add(frameDecceleration)

        /**
         * Find move velocity
         */
        if (this.input.controlKeys.w) {
            if (Math.abs(velocity.z + this.acceleration.z * deltaTime) > 3.0) {} else {
                velocity.z += this.acceleration.z * deltaTime
            }
        } else if (this.input.controlKeys.s) {
            if (Math.abs(velocity.z + this.acceleration.z * deltaTime) > 3.0) {} else {
                velocity.z -= this.acceleration.z * deltaTime
            }
        }

        /**
         * Find rotation
         */
        if (this.input.controlKeys.a) {
            rotationOffset.setFromAxisAngle(rotationAxis, 2.0 * Math.PI * deltaTime * this.acceleration.y)
            targetRotation.multiply(rotationOffset)
        } else if (this.input.controlKeys.d) {
            rotationOffset.setFromAxisAngle(rotationAxis, 2.0 * -Math.PI * deltaTime * this.acceleration.y)
            targetRotation.multiply(rotationOffset)
        }

        /**
         * Apply transformations
         */
        this.target.quaternion.copy(targetRotation)

        const oldPosition = new THREE.Vector3()
        oldPosition.copy(this.target.position)

        /**
         * Apply rotation depending on orientation
         */
        const forward = new THREE.Vector3(0, 0, 1)
        forward.applyQuaternion(this.target.quaternion)
        forward.normalize()

        const sideways = new THREE.Vector3(1, 0, 0)
        sideways.applyQuaternion(this.target.quaternion)
        sideways.normalize()

        forward.multiplyScalar(velocity.z * deltaTime)
        sideways.multiplyScalar(velocity.x * deltaTime)

        this.target.position.add(forward)
        this.target.position.add(sideways)

        // console.log(this.velocity)
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