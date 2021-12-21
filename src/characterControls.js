import * as THREE from 'three'

class CharacterControls {
    /**
     * Temporary Data
     */
    walkDirection = new THREE.Vector3()
    rotateAxis = new THREE.Vector3(0, 1, 0)
    rotateQuaternion = new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()

    /**
     * Constraints
     */
    walkVelocity = 2

    constructor(camera, orbitControls) {
        this.camera = camera
        this.orbitControls = orbitControls
    }

    getDirectionOffset(controlKeys) {
        let directionOffset = 0 // w

        if (controlKeys.w) {
            if (controlKeys.a) {
                directionOffset = Math.PI / 4 // w + a
            } else if (controlKeys.d) {
                directionOffset = - (Math.PI / 4) // w + d
            }
        } else if (controlKeys.s) {
            if (controlKeys.a) {
                directionOffset = 3 * (Math.PI / 4) // s + a
            } else if (controlKeys.d) {
                directionOffset = -3 * (Math.PI / 4) // s + d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (controlKeys.a) {
            directionOffset = Math.PI / 2 // a
        } else if (controlKeys.d) {
            directionOffset = - (Math.PI / 2) // d
        }

        return directionOffset

    }

    update(deltaTime, controlKeys, mesh) {
        if (controlKeys.a || controlKeys.d || controlKeys.w || controlKeys.s) {
            /**
             * Calculate the angle with which to turn to be inclined with camera's view
             */
            const angleYCameraDirection = Math.atan2(
                this.camera.position.x - mesh.position.x,
                this.camera.position.z - mesh.position.z
            )

            /**
             * Find directional offset
             */
            const directionalOffset = this.getDirectionOffset(controlKeys)

            /**
             * Rotate Mesh along the Y-axis about the offset and dispersion b/w mesh's and camera's view
             */
            this.rotateQuaternion.setFromAxisAngle(this.rotateAxis, angleYCameraDirection + directionalOffset)
            mesh.quaternion.rotateTowards(this.rotateQuaternion, 0.1)

            /**
             * Calculate direction
             */
            this.camera.getWorldPosition(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAxis, directionalOffset)

            /**
             * Move camera and mesh by scalling walkDirection vector by velocity
             */
            const moveX = this.walkDirection.x * this.walkVelocity * deltaTime
            const moveZ = this.walkDirection.z * this.walkVelocity * deltaTime
            mesh.position.x += moveX
            mesh.position.z += moveZ

            this.updateCameraPosition(mesh, moveX, moveZ)
        }
    }

    updateCameraPosition(mesh, moveX, moveZ) {
        /**
         * Move camera
         */
        this.camera.position.x += moveX
        this.camera.position.z += moveZ

        /**
         * Look at target
         */
        this.cameraTarget.x = mesh.position.x
        this.cameraTarget.y = mesh.position.y + 1
        this.cameraTarget.z = mesh.position.z
        this.orbitControls.target = this.cameraTarget
    }
}

export default CharacterControls