import * as THREE from 'three'
import Scene from './scene.js'

/**
 * Setup Socket.io-client
 */
const socket = io()

/**
 * Player scene
 */
const playerScene = new Scene()
console.log(playerScene.scene)

/**
 * Local Data
 */
const userData = {}
let currentUser = undefined

/**
 * Render other users
 */
socket.on('renderOtherUsers', function handleRenderOtherUsers (currentUserId, users) {
    currentUser = currentUserId
    Object.keys(users).forEach((id) => {
        if (id != currentUserId) {
            userData[id] = {
                mesh: new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 0.2, 0.2),
                    new THREE.MeshBasicMaterial({
                        color: new THREE.Color(users[id].color),
                        wireframe: true
                    })
                )
            }

            userData[id].mesh.name = id
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
        mesh: new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.2),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(users[newUserId].color),
                wireframe: true
            })
        )
    }

    userData[newUserId].mesh.position.set(...users[newUserId].position)
    userData[newUserId].mesh.rotation.set(...users[newUserId].rotation)
    playerScene.scene.add(userData[newUserId].mesh)
})

socket.on('userLeaving', function handleUserLeaving(userId) {
    playerScene.scene.remove(userData[userId].mesh)
    delete userData[userId]
})

