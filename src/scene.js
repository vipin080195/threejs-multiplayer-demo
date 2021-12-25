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
        this.camera = new THREE.PerspectiveCamera(70, this.sizes.width / this.sizes.height, 0.1, 100)

        /**
         * Lights
         */
        const sunlight = new THREE.AmbientLight('#ffffff', 0.5)
        this.scene.add(sunlight)

        /**
         * Helpers
        */
        const gridHelper = new THREE.GridHelper(100, 100)
        this.scene.add(gridHelper)

        /**
         * Colliders
         */
        this.colliders = []
        this.createColliders()


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
         * Handlers
         */
        window.addEventListener('resize', (e) => { this.handleResize(e) })
    }

    handleResize(e) {
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight

        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    createColliders() {
        const geometry = new THREE.BoxGeometry(5, 5, 5, 5, 5, 5)
        const material = new THREE.MeshBasicMaterial({
            color: '#222222',
            wireframe: true
        })

        /**
         * Create box colliders
         */
        for (let i = 0; i < 1; i++) {
            const collider = new THREE.Mesh(geometry, material)
            collider.position.set(this.getRandomNumber(-25, 25), 2.5, this.getRandomNumber(-25, 25))
            this.scene.add(collider)
            this.colliders.push(collider)
        }

        /**
         * Create floor collider
         */
    }

    getRandomNumber(min, max) {
        return Math.random() * (max - min) + min
    }
}

export default Scene