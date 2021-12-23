import * as THREE from 'three'
import CharacterControllerInput from './characterControllerInput'

class Character {
    constructor(params) {
        this.init(params)
    }

    init(params) {
        this.params = params
        this.scene = params.scene

        if (this.params.isControllable) {
            /**
             * Initial values & constants
             */
            this.decceleration = new THREE.Vector3(-0.00005, -0.000001, -2.5)
            this.acceleration = new THREE.Vector3(0.1, 0.5, 5.0)
            this.velocity = new THREE.Vector3()

            /**
             * Instantiate controller input
             */
            this.input = new CharacterControllerInput()
        }

        /**
         * TODO: Instantiate FSM
         */
        
        /**
         * TODO: Load models and Animations
         */
        // TODO: load an actual model
        this.loadModelAndAnimations()
    }

    loadModelAndAnimations() {
        /**
         * Test cube
         */
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1, 3, 3, 3),
            new THREE.MeshBasicMaterial()
        )
        this.scene.add(mesh)

        /**
         * Set as target for controlled movement
         */
        this.target = mesh
        
        /**
         * Store relevant information
         */
        this.userData = {
            model: 'cube',
            mesh: mesh,
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z,
            h: mesh.rotation.y,
            pb: mesh.position.pb
        }
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
            velocity.z += this.acceleration.z * deltaTime
        } else if (this.input.controlKeys.s) {
            velocity.z -= this.acceleration.z * deltaTime
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
    }
}

export default Character