import React, { useEffect, useState, useRef, useContext } from 'react';
import { AppContext } from './MazeComponent.js';
import styles from '../styles/Game.module.scss';
const PF = require('pathfinding');

const GameComponent = () => {
    // eslint-disable-next-line no-unused-vars
    const { state, dispatch } = useContext(AppContext);
    const [resultValue, setResult] = useState('');
    const count = useRef(0);
    const path = useRef([]);

    let levels = [];
    levels[0] = {
        map: [
            [0, 0, 1, 0, 1, 0],
            [1, 0, 1, 0, 0, 0],
            [1, 0, 0, 0, 1, 1],
            [0, 0, 1, 0, 1, 0],
            [0, 1, 0, 0, 1, 0],
            [1, 1, 1, 0, 0, 0]
        ],
        player: {
            x: 0,
            y: 0
        },
        goal: {
            x: 5,
            y: 5
        },
        theme: 'default'
    };

    useEffect(() => {
        document.getElementById('overlay').style.display = 'block';

        let grid = new PF.Grid(levels[0].map);
        let finder = new PF.AStarFinder();
        path.current = finder.findPath(0, 0, 5, 5, grid);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // const pathButton = document.getElementById('pathButton');

        function Game(id, level) {
            this.el = document.getElementById(id);

            this.tileTypes = ['floor', 'wall'];
            this.tileDimensions = 75;

            this.map = level.map;
            this.theme = level.theme;

            this.player = { ...level.player };
            this.goal = { ...level.goal };

            this.player.el = null;

            this.active = true;
        };

        Game.prototype.checkActive = function () {
            document.addEventListener('keydown', (e) => {
                if (e.keyCode === 32) {
                    document.getElementById('overlay').style.display = 'none';
                    this.active = false;
                };
            });
        };

        Game.prototype.populateMap = function () {
            this.el.className = 'gameContainer ' + this.theme;

            let tiles = document.getElementById('tiles');

            for (let y = 0; y < this.map.length; ++y) {
                for (let x = 0; x < this.map[y].length; ++x) {
                    let tileCode = this.map[y][x];
                    let tileType = this.tileTypes[tileCode];

                    let tile = this.createElem(x, y, tileType);
                    tiles.appendChild(tile);
                }
            }
        };

        Game.prototype.createElem = function (x, y, type) {
            let elem = document.createElement('div');
            elem.className = type;

            elem.style.width = this.tileDimensions + 'px';
            elem.style.height = this.tileDimensions + 'px';

            elem.style.left = (x * this.tileDimensions) + 'px';
            elem.style.top = (y * this.tileDimensions) + 'px';

            return elem;
        };

        Game.prototype.sizeUp = function () {
            let map = this.el.querySelector('#gameMap');

            map.style.height = (this.map.length * this.tileDimensions) + 'px';
            map.style.height = (this.map[0].length * this.tileDimensions) + 'px';
        };

        Game.prototype.placeSprite = function (type) {
            let x = this[type].x;
            let y = this[type].y;

            let sprite = this.createElem(x, y, type);
            sprite.id = type;

            sprite.style.borderRadius = this.tileDimensions + 'px';
            if (sprite.id === 'player') {
                sprite.innerHTML = sessionStorage.getItem('emoji');
                sprite.style.fontSize = '52.5px';
            }

            let layer = this.el.querySelector('#sprites');
            layer.appendChild(sprite);

            return sprite;
        };

        Game.prototype.updateVertical = function () {
            this.player.el.style.top = (this.player.y * this.tileDimensions) + 'px';
        };

        Game.prototype.updateHorizontal = function () {
            this.player.el.style.left = (this.player.x * this.tileDimensions) + 'px';
        };

        Game.prototype.movePlayer = function () {
            this.player.x = path.current[count.current][0];
            this.player.y = path.current[count.current][1];
            this.updateHorizontal();
            this.updateVertical();
        };

        Game.prototype.checkGoal = function () {
            if (this.player.x === this.goal.x && this.player.y === this.goal.y) {
                console.log('Good Job!');
                sessionStorage.clear();
                window.location.href = 'http://localhost:3000/heroes';
            };
        };

        Game.prototype.generateTask = function () {
            if (state.inputText === resultValue && state.inputText !== '' && resultValue !== '') {
                count.current += 1;
                document.getElementById('error').textContent = "";
                
                this.movePlayer();
                this.checkGoal();

                // console.log(`x: ${path.current[count.current][0]}, y: ${path.current[count.current][1]}`);
                // console.log('Correct!');
                // console.log(`State: ${state.inputText}`);
                // console.log(`Result: ${resultValue}`);
            } else if (state.inputText !== resultValue) {
                document.getElementById('error').textContent = "Неправилен отговор!";
            };

            const numberOne = document.getElementById('numberOne');
            const numberTwo = document.getElementById('numberTwo');

            let randomNumberOne = Math.floor(Math.random() * 10) + 1;
            let randomNumberTwo = Math.floor(Math.random() * 10) + 1;

            numberOne.innerHTML = `${randomNumberOne}`;
            numberTwo.innerHTML = `${randomNumberTwo}`;

            let result = `${randomNumberOne * randomNumberTwo}`;
            setResult(result);
        };

        let mazeGame = new Game('gameContainer', levels[0]);
        mazeGame.populateMap();
        mazeGame.sizeUp();
        let playerSprite = mazeGame.placeSprite('player');
        mazeGame.player.el = playerSprite;
        mazeGame.placeSprite('goal');
        mazeGame.checkActive();
        mazeGame.generateTask();

        //  eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.inputText]);

    return (
        <div className={styles.innerContainer}>
            <div id="gameContainer" className="gameContainer">
                <div id="mapControls" className={styles.mapControls}>
                    <div id="gameMap" className={styles.gameMap}>
                        <div id="tiles" className={styles.tilesLayer}></div>
                        <div id="sprites" className={styles.spritesLayer}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GameComponent