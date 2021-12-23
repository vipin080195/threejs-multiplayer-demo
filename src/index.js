import * as THREE from 'three'
import Scene from './scene.js'
import * as dat from 'dat.gui'
import Character from './character.js'

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

/**
 * Animation function
 */
const clock = new THREE.Clock()

function animate() {
    /**
     * Update controls & notify about changes
     */
    if (currentUserId && character.isLoaded) {
        character.update(clock.getDelta())
        character.thirdPersonCamera.update()

        socket.emit('update', {
            id: currentUserId,
            model: character.userData.model,
            x: character.target.position.x,
            y: character.target.position.y,
            z: character.target.position.z,
            rx: character.target.rotation.x,
            ry: character.target.rotation.y,
            rz: character.target.rotation.z
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
        scene: playerScene.scene,
        camera: playerScene.camera,
        isControllable: true
    })

    socket.emit('init', {
        model: character.userData.model,
        x: character.userData.x,
        y: character.userData.y,
        z: character.userData.z,
        rx: character.userData.rx,
        ry: character.userData.ry,
        rz: character.userData.rz
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
                    scene: playerScene.scene,
                    isControllable: false
                })
            }
        }
    })
})

/**
 * Delete user that disconnected
 */
socket.on('deleteUser', function handleDeleteUser(params) {
    if (remoteData[params.id]) {
        playerScene.scene.remove(renderedUsers[params.id].userData.mesh)
        delete renderedUsers[params.id]
        delete remoteData[params.id]
    }
})

/**
 * Update other users' co-ordinates
 */
 function updateUsers(deltaTime) {
    Object.keys(renderedUsers).forEach((id) => {
        const mesh = renderedUsers[id].target
        
        mesh.rotation.x = remoteData[id].rx
        mesh.rotation.y = remoteData[id].ry
        mesh.rotation.z = remoteData[id].rz

        mesh.position.lerp(new THREE.Vector3(remoteData[id].x, remoteData[id].y, remoteData[id].z), deltaTime)
    })
}