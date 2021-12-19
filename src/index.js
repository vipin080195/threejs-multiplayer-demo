import * as THREE from 'three'
import Scene from './scene.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'

/**
 * Setup Socket.io-client
 */
const socket = io()

/**
 * Textures
 */
 const textureLoader = new THREE.TextureLoader()
 const minecraftTexture = textureLoader.load('./static/minecraft.png')
 

/**
 * Utilities
 */
function getRandomGeometry() {
    const random = Math.random()
    if (random > 0.5) {
        return new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.2, 3, 3, 3),
            new THREE.MeshBasicMaterial({
                wireframe: false,
                map: minecraftTexture
            })
        )
    } else {
        return new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshBasicMaterial({
                wireframe: false,
                map: minecraftTexture
            })
        )
    }
}
/**
 * Optimize texture
 */
minecraftTexture.generateMipmaps = false
minecraftTexture.minFilter = THREE.NearestFilter
minecraftTexture.magFilter = THREE.NearestFilter

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
 * Helicopter View
 */
gui.add(playerScene.parameters, 'heloView').name('Helicopter View')

/**
 * Trigger animation
 */
playerScene.parameters['triggerAnimation'] = function() {
    socket.emit('animationTriggered', currentUser)

    gsap.to(playerScene.camera.position, {
        duration: 2,
        y: 0.5,
        ease: 'power1.out'
    })
    gsap.to(playerScene.camera.position, {
        duration: 2,
        y: 0,
        ease: 'bounce.out',
        delay: 2
    })
}
gui.add(playerScene.parameters, 'triggerAnimation').name('Animate')

/**
 * Render other users
 */
socket.on('renderOtherUsers', function handleRenderOtherUsers (currentUserId, users) {
    currentUser = currentUserId
    Object.keys(users).forEach((id) => {
        if (id != currentUserId) {
            userData[id] = {
                mesh: getRandomGeometry()
            }

            userData[id].mesh.name = id
            // userData[id].mesh.material.color = new THREE.Color(users[id].color)
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
        mesh: getRandomGeometry()
    }

    userData[newUserId].mesh.name = newUserId
    // userData[newUserId].mesh.material.color = new THREE.Color(users[newUserId].color)
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
let count = 0
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

socket.on('updateAnimation', function handleUpdateAnimation(userId) {
    console.log('TEST')
    gsap.to(userData[userId].mesh.position, {
        duration: 2,
        y: 0.5,
        ease: 'power1.out'
    })
    gsap.to(userData[userId].mesh.position, {
        duration: 2,
        y: 0,
        ease: 'bounce.out',
        delay: 2
    })
})