import * as THREE from 'three'
import CharacterControllerInput from './characterControllerInput.js'
import { GLTFLoader } from './GLTFLoader.js'
import { DRACOLoader } from './DRACOLoader.js'

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
         * load models
         */
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('static/draco')

        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)

        /**
         * Send proxy object
         */
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial()
        )
        this.target = mesh
        this.userData = {
            model: 'proxy',
            mesh: mesh,
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z,
            h: mesh.rotation.y,
            pb: mesh.rotation.x
        }

        gltfLoader.load('static/models/avatar.glb', (glb) => {
            const mesh = glb.scene.children[0]
            this.scene.add(mesh)

            /**
             * Set target
             */
            this.target = mesh

            /**
             * Store relevant information
             */
            this.userData = {
                model: 'girl',
                mesh: mesh,
                x: mesh.position.x,
                y: mesh.position.y,
                z: mesh.position.z,
                h: mesh.rotation.y,
                pb: mesh.rotation.x
            }
        })
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
        } else {
            velocity.z = 0
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