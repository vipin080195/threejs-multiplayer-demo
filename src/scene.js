import * as THREE from 'three'
import { OrbitControls } from './OrbitControls.js'
import { FirstPersonControls } from './FirstPersonControls.js'

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
         * GUI
         */
        this.parameters = {
            
        }

        /**
         * Instantiating a scene
         */
        this.scene = new THREE.Scene()

        /**
         * Setup camera
         */
        this.camera = new THREE.PerspectiveCamera(70, this.sizes.width / this.sizes.height, 0.1, 10)
        this.scene.add(this.camera)

        /**
         * Controls
         */


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

        /**
         * Animate
         */
        this.clock = new THREE.Clock()
        this.animate()

        /**
         * Handling events
         */
        window.addEventListener('resize', (e) => { this.handleResize(e) })
    }

    animate() {
        this.renderer.render(this.scene, this.camera)

        window.requestAnimationFrame(() => {
            this.animate()
        })
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