export default class InputHandler {
    constructor(game){
        this.game = game;
        this.paused = false;
        window.addEventListener('keydown', e => {
            if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.game.keys.indexOf(e.key) === -1){
                this.game.keys.push(e.key);
            } else if (e.key === ' ' && !this.paused){ // Check for pause before shooting
                this.game.player.shootTop();
            } else if (e.key === 'd'){
                this.game.debug = !this.game.debug;
            } else if (e.key === 'p' && !this.paused){
                this.paused = true;
            } else if (e.key === 'r'){ // Resume when 'r' is pressed
                this.paused = false;
            }
        });
        window.addEventListener('keyup', e => {
            if (this.game.keys.indexOf(e.key) > -1){
                this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
            }
        });
    }
}
