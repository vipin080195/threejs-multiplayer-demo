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
                    new THREE.BoxGeometry(0.2, 0.2, 0.2, 3, 3, 3),
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
            new THREE.BoxGeometry(0.2, 0.2, 0.2, 3, 3, 3),
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

/**
 * Remove user that left
 */
socket.on('userLeaving', function handleUserLeaving(userId) {
    playerScene.scene.remove(userData[userId].mesh)
    delete userData[userId]
})

/**
 * Handle synced movement
 */
window.addEventListener('keydown', function handleOnKeyDown(e) {
    socket.emit('moved', [playerScene.camera.position.x, playerScene.camera.position.y, playerScene.camera.position.z])
})

socket.on('updateUserPosition', function handleUpdateUserPosition(userId, newPosition) {
    /**
     * Lerp positions for smooth movement
     */
    const oldPosition = userData[userId].mesh.position

    const lerpedPosition = new THREE.Vector3()
    lerpedPosition.x = THREE.MathUtils.lerp(oldPosition.x, newPosition[0], 0.2)
    lerpedPosition.y = THREE.MathUtils.lerp(oldPosition.y, newPosition[1], 0.2)
    lerpedPosition.z = THREE.MathUtils.lerp(oldPosition.z, newPosition[2], 0.2)

    userData[userId].mesh.position.set(lerpedPosition.x, lerpedPosition.y, lerpedPosition.z)
})