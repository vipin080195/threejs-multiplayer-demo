import * as THREE from 'three'

class ThirdPersonCamera {
    constructor(params) {
        this.params = params
        this.camera = params.camera
        this.target = params.mesh

        this.currentPosition = new THREE.Vector3()
        this.currentLookAt = new THREE.Vector3()

        this.isInThirdPerson = true
        this.idealOffset = new THREE.Vector3(0, 2, 4)
    }

    update(input) {
        /**
         * Switch cameras
         */
        if (input.controlKeys.q) {
            this.idealOffset = new THREE.Vector3(0, 1.5, -0.5)
        } else {
            this.idealOffset = new THREE.Vector3(0, 2, 4)
        }

        /**
         * idealOffset - How far away from the target
         * idealLookAt - In which direction to look
         */
        const idealOffset = this.calculateIdealOffset()
        const idealLookAt = this.calculateIdealLookAt()

        /**
         * TODO - Remove hard coded values
         */
        this.currentPosition.lerp(idealOffset, 0.2)
        this.currentLookAt.lerp(idealLookAt, 0.2)

        this.camera.position.copy(this.currentPosition)
        this.camera.lookAt(this.currentLookAt)
    }

    calculateIdealOffset() {
        /**
         * Third person camera offset
         */
        // this.idealOffset = new THREE.Vector3(0, 2, 4)
        /**
         * First person camera offset
         */
        // this.idealOffset = new THREE.Vector3(0, 1.5, -0.5)

        const idealOffset = this.idealOffset


        idealOffset.applyQuaternion(this.target.quaternion)
        idealOffset.add(this.target.position)
        return idealOffset
    }

    calculateIdealLookAt() {
        const idealLookAt = new THREE.Vector3(0, 1, -5)
        idealLookAt.applyQuaternion(this.target.quaternion)
        idealLookAt.add(this.target.position)
        return idealLookAt
    }
}


export default ThirdPersonCamera