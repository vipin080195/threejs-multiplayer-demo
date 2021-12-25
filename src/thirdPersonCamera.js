import * as THREE from 'three'

class ThirdPersonCamera {
    constructor(params) {
        this.params = params
        this.camera = params.camera
        this.target = params.mesh

        this.currentPosition = new THREE.Vector3()
        this.currentLookAt = new THREE.Vector3()
    }

    update(timeElapsed) {
        /**
         * idealOffset - How far away from the target
         * idealLookAt - In which direction to look
         */
        const idealOffset = this.calculateIdealOffset()
        const idealLookAt = this.calculateIdealLookAt()

        /**
         * TODO - Remove hard coded values
         */
        this.currentPosition.lerp(idealOffset, 0.1)
        this.currentLookAt.lerp(idealLookAt, 0.1)

        this.camera.position.copy(this.currentPosition)
        this.camera.lookAt(this.currentLookAt)
    }

    calculateIdealOffset() {
        const idealOffset = new THREE.Vector3(0, 2, 4)
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