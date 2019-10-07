export default class Component {
    constructor(node) {
        this.node = node;

        this.name = 'Component';
    
        if (this.node.addComponent) {
          this.node.addComponent(this);
        }
    }

    update (dt) {
        
    }

    onAttach () {

    }

    onDetach () {

    }

    detach () {
        this.node.removeComponent(this);

        this.node = null;

        this.onDetach();
    }
}