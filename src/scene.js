import * as THREE from 'three'

/**
 * Setup the base of the scene and expose the animate function
 */
class Scene {
    constructor(
        canvas = document.querySelector('#webgl_handle'),
        width = window.innerWidth,
        height = window.innerHeight,
    ){
        /**
         * WebGL handle
         */
        this.canvas = canvas

        /**
         * Utilities
         */
        this.sizes = {
            width: width,
            height: height
        }

        /**
         * GUI tweakable parameters for testing
         */
        this.parameters = {
            
        }

        /**
         * Instantiating a scene
         */
        this.scene = new THREE.Scene()

        /**
         * Setup camera - FOV 70
         */
        this.camera = new THREE.PerspectiveCamera(70, this.sizes.width / this.sizes.height, 0.1, 10)
        this.camera.position.set(0, 2, 3)


        /**
         * Setup renderer
         */
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.setClearColor(new THREE.Color('#000000'))

        /**
         * Helpers
         */
        const gridHelper = new THREE.GridHelper(50, 50)
        this.scene.add(gridHelper)

        
    }

    handleResize(e) {
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight

        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
}

export default Scene