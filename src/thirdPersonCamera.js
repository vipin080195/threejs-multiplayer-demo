import * as THREE from 'three'

class ThirdPersonCamera {
    constructor(params) {
        this.params = params
        this.camera = params.camera
        this.target = params.mesh

        /**
         * Setup back camera and make target it's parent
         */
        this.backCamera = new THREE.Object3D()
        this.backCamera.position.set(0, 2, 3)
        this.backCamera.parent = this.target

        this.backCameraPosition = new THREE.Vector3()
        this.idealLookAt = new THREE.Vector3()
    }

    update(deltaTime) {
        if (this.target != undefined) {
            this.backCamera.getWorldPosition(this.backCameraPosition)
            this.camera.position.lerp(this.backCameraPosition, deltaTime)

            this.idealLookAt.copy(this.target.position)
            this.idealLookAt.y += 0.5
            this.camera.lookAt(this.idealLookAt)
        }
    }
}


export default ThirdPersonCamera