import * as THREE from 'three'

class ThirdPersonCamera {
    constructor(params) {
        this.params = params
        this.camera = params.camera

        this.currentPosition = new THREE.Vector3()
        this.currentLookAt = new THREE.Vector3()
    }

    update(timeElapsed) {
        /**
         * Camera offset from the user
         */
        const idealOffset = this.calculateIdealOffset()

        /**
         * Camera orientation towards the user
         */
        const idealLookAt = this.calculateIdealLookAt()

        this.currentPosition.copy(idealOffset)
        this.currentLookAt.copy(idealLookAt)

        this.camera.position(this.currentPosition)
        this.camera.lookAt(this.currentLookAt)
    }

    calculateIdealOffset() {
        const idealOffset = new THREE.Vector3(0, 2, -3)
        idealOffset.applyQuaternion(this.params.target.rotation)
        idealOffset.add(this.params.target.position)
        return idealOffset
    }

    calculateIdealLookAt() {
        const idealLookAt = new THREE.Vector3(0, 1, 5)
        idealLookAt.applyQuaternion(this.params.target.rotation)
        idealLookAt.add(this.params.target.position)
        return idealLookAt
    }
}


export default ThirdPersonCamera