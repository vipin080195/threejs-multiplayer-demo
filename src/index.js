import * as THREE from 'three'
import Scene from './scene.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import CharacterController from './characterController.js'
import ThirdPersonCamera from './thirdPersonCamera'

/**
 * Setup Socket.io-client
 */
const socket = io()

/**
 * GUI - for tweaking parameters
 */
 const gui = new dat.GUI({
    closed: false
})

/**
 * Setup player local environment
 */
const playerScene = new Scene()

/**
 * Player local data
 */
const remoteData = {}
const renderedUsers = {}
let currentUserId = undefined
let currentUser = undefined

/**
 * Controllers
 */
let characterController = undefined
let thirdPersonCamera = undefined

/**
 * Animation function
 */
const clock = new THREE.Clock()

function animate() {
    /**
     * Update controls
     */
    if (currentUserId != undefined) {
        characterController.update(clock.getDelta())
        thirdPersonCamera.update()

        socket.emit('update', {
            id: currentUserId,
            model: currentUser.model,
            x: currentUser.mesh.position.x,
            y: currentUser.mesh.position.y,
            z: currentUser.mesh.position.z,
            h: currentUser.mesh.rotation.y,
            pb: currentUser.mesh.rotation.x
        })
    }

    /**
     * Update other users
     */
    if (renderedUsers) {
        updateUsers(0.1)
    }

    /**
     * Render scene
     */
    playerScene.renderer.render(playerScene.scene, playerScene.camera)

    window.requestAnimationFrame(() => {
        animate()
    })
}
animate()

/**
 * Web socket communication with server
 */

/**
 * Gather user socket ID
 */
socket.on('setId', function handleSetId(params) {
    currentUserId = params.id

    /**
     * Initialize Character and Camera
     */
    characterController = new CharacterController({
        id: currentUserId
    })

    /**
     * Load model and animations and add it to the scene
     */
    currentUser = characterController.user
    playerScene.scene.add(currentUser.mesh)

    /**
     * Instantiate 3ps camera
     */
    thirdPersonCamera = new ThirdPersonCamera({
        camera: playerScene.camera,
        mesh: currentUser.mesh
    })

    socket.emit('init', currentUser)
})

/**
 * Update local data with payloadDrop
 */
socket.on('payloadDrop', function handlePayloadDrop(params) {
    params.payload.forEach((user) => {
        if (user.id != currentUserId) {
            /**
             * Store payload
             */
            remoteData[user.id] = user

            /**
             * Render if new user
             */
            if (renderedUsers[user.id] == undefined) {
                renderedUsers[user.id] = new CharacterController({id: user.id}).target
                playerScene.scene.add(renderedUsers[user.id])
            }
        }
    })
})

function updateUsers(deltaTime) {
    Object.keys(renderedUsers).forEach((id) => {
        const mesh = renderedUsers[id]
        mesh.rotation.x = remoteData[id].pb
        mesh.rotation.y = remoteData[id].h
        mesh.position.lerp(new THREE.Vector3(remoteData[id].x, remoteData[id].y, remoteData[id].z), deltaTime)
    })
}

/**
 * Delete user that disconnected
 */
socket.on('deleteUser', function handleDeleteUser(params) {
    if (remoteData[params.id]) {
        playerScene.scene.remove(renderedUsers[params.id])
        delete renderedUsers[params.id]
        delete remoteData[params.id]
    }
})