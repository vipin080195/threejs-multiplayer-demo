import * as THREE from 'three'
import Scene from './scene.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'

/**
 * Setup Socket.io-client
 */
const socket = io()
 

/**
 * Utilities
 */
function getMesh() {
    return new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1, 3, 3, 3),
        new THREE.MeshBasicMaterial({
            wireframe: false
        })
    )
}

/**
 * Player scene
 */
const playerScene = new Scene()

/**
 * Local Data
 */
const userData = {}
let currentUser = undefined

/**
 * GUI
 */
const gui = new dat.GUI({
    closed: false
})


/**
 * Render other users
 */
socket.on('renderOtherUsers', function handleRenderOtherUsers (currentUserId, users) {
    currentUser = currentUserId
    Object.keys(users).forEach((id) => {
        if (id != currentUserId) {
            userData[id] = {
                mesh: getMesh()
            }

            userData[id].mesh.name = id
            userData[id].mesh.material.color = new THREE.Color(users[id].color)
            userData[id].mesh.position.set(...users[id].position)
            userData[id].mesh.rotation.set(...users[id].rotation)
            playerScene.scene.add(userData[id].mesh)
        }
    })
})

/**
 * Render the new user
 */
socket.on('renderNewUser', function handleRenderNewUser(newUserId, users) {
    userData[newUserId] = {
        mesh: getMesh()
    }

    userData[newUserId].mesh.name = newUserId
    userData[newUserId].mesh.material.color = new THREE.Color(users[newUserId].color)
    userData[newUserId].mesh.position.set(...users[newUserId].position)
    userData[newUserId].mesh.rotation.set(...users[newUserId].rotation)
    playerScene.scene.add(userData[newUserId].mesh)
})

/**
 * Remove user that left
 */
socket.on('userLeaving', function handleUserLeaving(userId) {
    playerScene.scene.remove(userData[userId].mesh)
    delete userData[userId]
})