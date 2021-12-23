import * as THREE from 'three'
import Scene from './scene.js'
import * as dat from 'dat.gui'
import Character from './character.js'
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

/**
 * Quick access to current character
 */
let currentUserId = undefined
let currentUser = undefined

/**
 * Controllers
 */
let character = undefined
let thirdPersonCamera = undefined

/**
 * Animation function
 */
const clock = new THREE.Clock()

function animate() {
    /**
     * Update controls & notify about changes
     */
    if (currentUserId != undefined) {
        character.update(clock.getDelta())
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
 *  ------ Web socket communication with server -----
 */

/**
 * Initial setup for user
 */
socket.on('setId', function handleSetId(params) {
    /**
     * Capture socket ID
     */
    currentUserId = params.id

    /**
     * Initialize Character and Camera
     */
    character = new Character({
        id: currentUserId,
        isControllable: true
    })

    /**
     * Load model and animations and add it to the scene
     */
    currentUser = character.user
    playerScene.scene.add(currentUser.mesh)

    /**
     * Instantiate 3ps camera
     */
    thirdPersonCamera = new ThirdPersonCamera({
        camera: playerScene.camera,
        mesh: currentUser.mesh
    })

    socket.emit('init', {
        model: currentUser.model,
        x: currentUser.x,
        y: currentUser.y,
        z: currentUser.z,
        h: currentUser.h,
        pb: currentUser.pb
    })
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
                renderedUsers[user.id] = new Character({
                    id: user.id,
                    isControllable: false
                }).user.mesh
                playerScene.scene.add(renderedUsers[user.id])
            }
        }
    })
})

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

/**
 * Update other users' co-ordinates
 */
 function updateUsers(deltaTime) {
    Object.keys(renderedUsers).forEach((id) => {
        const mesh = renderedUsers[id]
        mesh.rotation.x = remoteData[id].pb
        mesh.rotation.y = remoteData[id].h
        mesh.position.lerp(new THREE.Vector3(remoteData[id].x, remoteData[id].y, remoteData[id].z), deltaTime)
    })
}