import * as THREE from 'three'
import CharacterControllerInput from './characterControllerInput.js'
import ThirdPersonCamera from './thirdPersonCamera'
import FiniteStateMachine from './finiteStateMachine.js'

import { GLTFLoader } from './GLTFLoader.js'
import { DRACOLoader } from './DRACOLoader.js'

class Character {
    constructor(params) {
        this.init(params)
    }

    init(params) {
        this.isLoaded = false
        this.params = params
        this.sceneParent = params.scene
        this.scene = params.scene.scene
        this.camera = params.camera

        this.animations = {}

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
        this.stateMachine = new FiniteStateMachine({
            animations: this.animations
        })
        
        /**
         * TODO: Load models and Animations
         */
        // TODO: load an actual model
        this.loadModelAndAnimations()
    }

    loadModelAndAnimations() {
        /**
         * Send proxy object
         */
        const mesh = new THREE.Object3D()
        this.target = mesh
        this.userData = {
            model: 'proxy',
            mesh: mesh,
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z,
            rx: mesh.rotation.x,
            ry: mesh.rotation.y,
            rz: mesh.rotation.rz,
            clipAction: undefined
        }


        /**
         * load models and setup 3ps camera controls if controllable
         */
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('static/draco')

        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)

        gltfLoader.load('static/models/Soldier.glb', (glb) => {
            const mesh = glb.scene

            this.scene.add(mesh)

            /**
             * Set target
             */
            this.target = mesh

            /**
             * Set target for animations
             */
            this.mixer = new THREE.AnimationMixer(this.target)

            /**
             * Load animations
             */
            this.animations['idle'] = {
                clip: glb.animations[0],
                action: this.mixer.clipAction(glb.animations[0])
            }
            this.animations['walk'] = {
                clip: glb.animations[0],
                action: this.mixer.clipAction(glb.animations[3])
            }
            this.stateMachine.setState('idle')

            /**
             * Setup camera if controllable
             */
            if (this.params.isControllable) {
                this.thirdPersonCamera = new ThirdPersonCamera({
                    camera: this.camera,
                    mesh: mesh
                })
            }

            /**
             * Store relevant information
             */
            this.userData = {
                model: 'soldier',
                mesh: mesh,
                x: mesh.position.x,
                y: mesh.position.y,
                z: mesh.position.z,
                rx: mesh.rotation.x,
                ry: mesh.rotation.y,
                rz: mesh.rotation.z,
                clipAction: 'idle'
            }
            this.isLoaded = true
        })


    }

    onLoadAnimation(animationName, animation) {
        const clip = animation.animations[0]
        const action = this.mixer.clipAction(clip)

        this.animations[animationName] = {
            clip: clip,
            action: action
        }
    }

    checkIfCollision() {
        /**
         * Cast ray forward and backwards
         */
        /**
         * Define raycaster position
         */
        const raycasterPosition = this.target.position.clone()
        raycasterPosition.y += 1.5

        /**
         * Define raycaster direction
         */
        const raycasterDirection = new THREE.Vector3()
        this.target.getWorldDirection(raycasterDirection)
        
        /**
         * If moving forward, then negate direction
         * getWorldDirection() gives direction of +ve Z axis
         */
        if (this.input.controlKeys.w) {
            raycasterDirection.negate()
        }

        /**dw
         * Create raycaster
         */
        let raycaster = new THREE.Raycaster(raycasterPosition, raycasterDirection)

        /**
         * Cast ray
         */
        let intersects = raycaster.intersectObjects(this.sceneParent.colliders)

        /**
         * Determine if collision
         */
        if (intersects.length > 0) {
            if (intersects[0].distance < 0.5) {
                return true
            }
        }

        return false
    }

    update(deltaTime) {
        if (this.target == undefined) {
            return
        }

        if (!this.stateMachine.currentState) {
            return
        }
        this.stateMachine.update(deltaTime, this.input)

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
         * Find move velocity - FLIPPED SIGNS - FIX MODEL
         */
        if (this.input.controlKeys.w) { 
            velocity.z -= this.acceleration.z * deltaTime
        } else if (this.input.controlKeys.s) {
            velocity.z += this.acceleration.z * deltaTime
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
         * Check if collision occured
         * forward/ backward - remove veloity
         * left/ right - invert rotation
         */
        if (this.checkIfCollision()) {
            velocity.z = 0
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

        /**
         * Update mixer time
         */

        if (this.mixer) {
            this.mixer.update(deltaTime)
        }
    }
}

export default Character