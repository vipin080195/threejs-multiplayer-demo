import * as THREE from 'three'

/**
 * class to modify animation states
 */
class FiniteStateMachine {
    constructor(params) {
        /**
         * Map all states to their classes
         */
        this.states = {
            'idle': IdleState,
            'walk': WalkState
        }

        this.currentState = null
        this.animations = params.animations
    }
    /**
     * Set current state
     */
    setState(name) {
        const prevState = this.currentState

        if (prevState) {
            if (prevState.name == name) {
                return
            }

            prevState.exit()
        }

        /**
         * Create corresponding state with reference to FSM
         */
        const state = new this.states[name](this)

        this.currentState = state

        /**
         * Enter from prevState
         */
        state.enter(prevState)
    }

    update(deltaTime, input) {
        if (this.currentState) {
            this.currentState.update(deltaTime, input)
        }
    }
}

/**
 * Generic state interface
 */
class State {
    constructor(parent) {
        this.parent = parent
    }

    enter() {}
    exit() {}
    update() {}
}

/**
 * Specific classes for each state
 */
class IdleState extends State {
    constructor(parent) {
        super(parent)

        this.name = 'idle'
    }

    enter(prevState) {
        const idleAction = this.parent.animations['idle'].action

        if (prevState) {
            const prevAction = this.parent.animations[prevState.name].action

            idleAction.enabled = true
            idleAction.time = 0.0
            idleAction.crossFadeFrom(prevAction, 0.5, true)
            idleAction.play()
        } else {
            idleAction.play()
        }
    }

    exit() {

    }

    update(deltaTime, input) {
        /**
         * TODO: Modify state
         * TODO: implement turn
         */
        if (input.controlKeys.w) {
            // this.parent.setState('walk')
            console.log('WALKING')
        } else if (input.controlKeys.s) {
            console.log('WALKING BACKWARDS')
        }
    }
}

class WalkState extends State {
    constructor(parent) {
        super(parent)

        this.name = 'walk'
    }

    enter(prevState) {
        const walkAction = this.parent.animations['walk'].action

        if (prevState) {
            const prevAction = this.parent.animations[prevState.name].action

            walkAction.enabled = true

            /**
             * TODO: HANDLE RUN STATE CASE
             */

            walkAction.time = 0.0
            walkAction.crossFadeFrom(prevAction, 0.5, true)
            walkAction.play()
        } else {
            walkAction.play()
        }
    }

    exit() {

    }

    update(deltaTime, input) {
        if (input.controlKeys.w) {
            return
        }

        this.parent.setState('idle')
    }
}

export default FiniteStateMachine