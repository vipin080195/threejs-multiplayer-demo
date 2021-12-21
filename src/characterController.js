import * as THREE from 'three'

class CharacterController {
    constructor(params) {
        this.init(params)
    }

    init(params) {
        this.params = params

        /**
         * Instantiate controller input
         */
        this.input = new CharacterControllerInput()

        /**
         * Instantiate FSM
         */
        this.finiteStateMachine = new FiniteStateMachine()

        /**
         * TODO: Load models and Animations
         */
    }
}