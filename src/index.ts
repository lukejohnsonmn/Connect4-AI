/* Assignment 1: Space Minesweeper
 * CSCI 4611, Spring 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as paper from 'paper';

class Game 
{
    // Width and height are defined in project coordinates
    // This is different than screen coordinates!
    private width : number;
    private height : number;
    private GAME_HEIGHT: number;
    private GAME_SHIFT_X: number;
    private GAME_SHIFT_Y: number;
    private coolDown: boolean;
    private gameReady: boolean;
    private gameStarted: boolean;
    private gameOver: boolean;
    private isRedTurn: boolean;

    // TypeScript will throw an error if you define a type but don't initialize in the constructor
    // This can be prevented by including undefined as a second possible type
    private game : paper.Group | undefined;
    private yellowPiece : paper.SymbolDefinition | undefined;
    private redPiece : paper.SymbolDefinition | undefined;
    private winText : paper.PointText | undefined;
    private helpText : paper.PointText | undefined;
    private menuRedText : paper.PointText | undefined;
    private menuWhiteText : paper.PointText | undefined;
    private menuYellowText : paper.PointText | undefined;
    private menuHighlight : paper.Path | undefined;


    private gameBoard : Array<Array<number>>;
    
    constructor()
    {
        paper.setup('canvas');
        this.width = 1200;
        this.height = 800;
        this.GAME_HEIGHT = 280;
        this.GAME_SHIFT_X = 0;
        this.GAME_SHIFT_Y = -84;
        this.coolDown = true;
        this.gameReady = false;
        this.gameStarted = false;
        this.gameOver = false;
        this.isRedTurn = true;

        this.gameBoard =    [[0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0]];
    }

    start() : void 
    {
        this.createScene();
        this.resize();

        // This registers the event handlers for window and mouse events
        paper.view.onResize = () => {this.resize();};
        paper.view.onMouseMove = (event: paper.MouseEvent) => {this.onMouseMove(event);};
        paper.view.onMouseDown = (event: paper.MouseEvent) => {this.onMouseDown(event);};
        paper.view.onFrame = (event: GameEvent) => {this.update(event);};

    }

    private createScene() : void 
    {
        // Create a new group to hold the game graphic
        this.game = new paper.Group();

        // This line prevents the transformation matrix from being baked directly into its children
        // Instead, will be applied every frame
        this.game.applyMatrix = false;

        // This code block loads an SVG file asynchronously
        // It uses an arrow function to specify the code that gets executed after the file is loaded
        // We will go over this syntax in class

        paper.project.importSVG('./assets/gameboard.svg', (item: paper.Item) => {
            // The exclamation point tells TypeScript you are certain the variable has been defined
            //this.displayBoard = item;
            item.addTo(this.game!);
            item.data.isDisplay = true;
            item.visible = false;
            this.game!.scale(1);
            this.game!.position.x = this.width / 2;
            this.game!.position.y = this.height / 2;
        });

        // Add more code here
        var yellow = new paper.Path.Circle(new paper.Point(0, 0), 22);
        var red = new paper.Path.Circle(new paper.Point(0, 0), 22);

        yellow.fillColor = new paper.Color('yellow');
        red.fillColor = new paper.Color('red');

        this.yellowPiece = new paper.SymbolDefinition(yellow);
        this.redPiece = new paper.SymbolDefinition(red);


        // Setup display for win text
        this.winText = new paper.PointText(new paper.Point(200, -15));
        this.winText.justification = "center";
        this.winText.fontSize = 80;
        this.winText.fillColor = new paper.Color("red");
        this.winText!.content = "Connect 4!";
        this.winText!.fillColor = new paper.Color("blue");
        this.winText.addTo(this.game);

        // Setup display for help text
        this.helpText = new paper.PointText(new paper.Point(200, 405));
        this.helpText.justification = "center";
        this.helpText.fontSize = 30;
        this.helpText.fillColor = new paper.Color("gold");
        this.helpText.visible = true;
        this.helpText.content = "Click one of the options\nabove to start a new game!"
        this.helpText.addTo(this.game);

        // Setup display for menu text
        this.menuRedText = new paper.PointText(new paper.Point(130, 100));
        this.menuRedText.justification = "center";
        this.menuRedText.fontSize = 30;
        this.menuRedText.fillColor = new paper.Color("red");
        this.menuRedText.visible = true;
        this.menuRedText.content = "Player\n\nAI\n\nPlayer"
        this.menuRedText.addTo(this.game);

        // Setup display for menu text
        this.menuWhiteText = new paper.PointText(new paper.Point(200, 100));
        this.menuWhiteText.justification = "center";
        this.menuWhiteText.fontSize = 30;
        this.menuWhiteText.fillColor = new paper.Color("white");
        this.menuWhiteText.visible = true;
        this.menuWhiteText.content = "vs\n\nvs\n\nvs"
        this.menuWhiteText.addTo(this.game);

        // Setup display for menu text
        this.menuYellowText = new paper.PointText(new paper.Point(270, 100));
        this.menuYellowText.justification = "center";
        this.menuYellowText.fontSize = 30;
        this.menuYellowText.fillColor = new paper.Color("yellow");
        this.menuYellowText.visible = true;
        this.menuYellowText.content = "AI\n\nPlayer\n\nPlayer"
        this.menuYellowText.addTo(this.game);


        var rec = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(250, 50));
        this.menuHighlight = new paper.Path.Rectangle(rec);
        this.menuHighlight.fillColor = new paper.Color('#111111');
        this.menuHighlight.position.x = 520;
        this.menuHighlight.position.y = 90;
        
        this.menuHighlight.addTo(this.game!);
        this.menuHighlight.sendToBack();
        this.menuHighlight.visible = false;
        

        //this.displayBoard!.visible = true;

        this.coolDown = false;
    }

    private displayBoard() : void
    {
        for (var i=0; i < this.game!.children.length; i++) {
            if (this.game!.children[i].data.isDisplay) {
                this.game!.children[i].visible = true;
            }
        }
    }


    private reset() : void {
        window.location.reload();
    }

    private startGame(type : number) : void {
        this.gameReady = true;
        this.helpText!.visible = false;
        this.menuRedText!.visible = false;
        this.menuWhiteText!.visible = false;
        this.menuYellowText!.visible = false;
        this.menuHighlight!.visible = false;
        //this.winText!.visible = false;
        this.displayBoard();
    }

    


    // for color: 1 = red, -1 = yellow.
    private addPiece(col : number) : boolean
    {
        if (!this.gameStarted) {
            this.gameStarted = true;
        }

        var color;
        if (this.isRedTurn) {
            color = 1;
        } else {
            color = -1;
        }

        this.coolDown = true;
        
        var openCol = false;
        var row = 0
		for (row; row < this.gameBoard.length; row++) {
			
			if (this.gameBoard[row][col] == 0) {
				openCol = true;
				this.gameBoard[row][col] = color;
				break;
			}
		}

        if (!openCol) {
            return openCol;
        }
        
        if (color == -1) {
            var piece = this.yellowPiece!.place(new paper.Point(53 + col*49, 0));
        } else {
            var piece = this.redPiece!.place(new paper.Point(53 + col*49, 0));
        }
        piece.addTo(this.game!);
        piece.sendToBack();
        piece.data.row = row;
        piece.data.vel = 0;

        this.isRedTurn = !this.isRedTurn;

        

		return openCol;
    }

    private drawWinArrow(arrowPos : number, arrowDir : number, color : number) : void
    {
        var arrowX = arrowPos % 10;
        var arrowY = Math.floor(arrowPos / 10);

        var rot = 0;
        var deltaX = 0;
        var deltaY = 0;
        if (arrowDir == 0) {            // Horizontal
            deltaX = 73;
            var rec = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(196, 10));
        } else if (arrowDir == 1) {     // Vertical
            rot = 90;
            deltaY = -72;
            var rec = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(196, 10));
        } else if (arrowDir == 2) {     // Diagonal Up
            rot = -45;
            deltaX = 73;
            deltaY = -73;
            var rec = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(250, 10));
        } else {                        // Diagonal Down
            rot = 45;
            deltaX = 74;
            deltaY = 74;
            var rec = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(250, 10));
        }

        var path = new paper.Path.Rectangle(rec);
        path.fillColor = new paper.Color('gold');
        
        path.position.x = 53 + arrowX*49 + deltaX
        path.position.y = this.GAME_HEIGHT - arrowY * 49 + deltaY;
        path.rotation = rot;
        path.addTo(this.game!);

        // Update scoreboard
        if (color == 1) {
            this.winText!.content = "Red wins!";
            this.winText!.fillColor = new paper.Color("red");
        } else {
            this.winText!.content = "Yellow wins!";
            this.winText!.fillColor = new paper.Color("yellow");
        }
        this.winText!.bringToFront();
        this.winText!.visible = true;

        this.helpText!.content = "Click anywhere to play again!";
        this.helpText!.visible = true;
        this.gameOver = true;
    }

    

    // This method will be called once per frame
    private update(event: GameEvent) : void
    {
        // Add code here
        if (this.gameStarted) {

            if (this.coolDown) {
                if (this.GAME_HEIGHT - this.game!.firstChild.data.row * 49 > this.game!.firstChild.position.y) {
                    this.game!.firstChild.data.vel += event.delta * 2000;
                    this.game!.firstChild.position.y += this.game!.firstChild.data.vel * event.delta;
                } else {
                    this.game!.firstChild.position.y = this.GAME_HEIGHT - this.game!.firstChild.data.row * 49;
                    if (this.coolDown) {
                        this.checkWin();
                        this.coolDown = false;
                    } 
                }
            }

        }
        
    }

    // This handles dynamic resizing of the browser window
    // You do not need to modify this function
    private resize() : void
    {
        var aspectRatio = this.width / this.height;
        var newAspectRatio = paper.view.viewSize.width / paper.view.viewSize.height;
        if(newAspectRatio > aspectRatio)
            paper.view.zoom = paper.view.viewSize.width  / this.width;    
        else
            paper.view.zoom = paper.view.viewSize.height / this.height;
        
        paper.view.center = new paper.Point(this.width / 2, this.height / 2);
        
    }

    private onMouseMove(event: paper.MouseEvent) : void
    {
        // Get the vector from the center of the screen to the mouse position
        var mouseVector = event.point.subtract(paper.view.center);

        // Point the game towards the mouse cursor by converting the vector to an angle
        // This only works if applyMatrix is set to false
        //this.game!.rotation = mouseVector.angle + 90;
        var x = event.point.x + this.GAME_SHIFT_X;
        var y = event.point.y + this.GAME_SHIFT_Y;
        if (!this.gameReady && !this.coolDown) {
            if (x > 470 && x < 720 && y > 200 && y < 250) {
                this.menuHighlight!.position.x = 200;
                this.menuHighlight!.position.y = 90;
                this.menuHighlight!.sendToBack();
                this.menuHighlight!.visible = true;
            } else if (x > 470 && x < 720 && y > 275 && y < 325) {
                this.menuHighlight!.position.x = 200;
                this.menuHighlight!.position.y = 162;
                this.menuHighlight!.sendToBack();
                this.menuHighlight!.visible = true;
            } else if (x > 470 && x < 720 && y > 350 && y < 400) {
                this.menuHighlight!.position.x = 200;
                this.menuHighlight!.position.y = 234;
                this.menuHighlight!.sendToBack();
                this.menuHighlight!.visible = true;
            } else {
                this.menuHighlight!.visible = false;
            }
        }
    }

    private onMouseDown(event: paper.MouseEvent) : void
    {
        var mouseVector = event.point.subtract(paper.view.center);

        var x = event.point.x + this.GAME_SHIFT_X;
        var y = event.point.y + this.GAME_SHIFT_Y;
        if (!this.gameReady) {
            if (x > 470 && x < 720 && y > 200 && y < 250) {
                this.startGame(0);
            } else if (x > 470 && x < 720 && y > 275 && y < 325) {
                this.startGame(1);
            } else if (x > 470 && x < 720 && y > 350 && y < 400) {
                this.startGame(2);
            }
        } else if (!this.gameOver && !this.coolDown) {
            if (event.point.y > 175 && event.point.y < 600) {
                if (x > 425 && x < 474) {
                    this.addPiece(0);
                } else if (x > 474 && x < 523) {
                    this.addPiece(1);
                } else if (x > 523 && x < 572) {
                    this.addPiece(2);
                } else if (x > 572 && x < 621) {
                    this.addPiece(3);
                } else if (x > 621 && x < 670) {
                    this.addPiece(4);
                } else if (x > 670 && x < 719) {
                    this.addPiece(5);
                } else if (x > 719 && x < 768) {
                    this.addPiece(6);
                }
            }
        } else if (this.gameOver && !this.coolDown) {
            this.reset();
        }   
    }

    private checkWin() : number {

        var color;
        
        if (this.isRedTurn) { // Yellow just played, check yellow
            color = -1;
        } else { // Otherwise, check red
            color = 1;
        }

        var result = this.checkHorizontal(color);
        if (result > -1) {
            console.log(result, " Horizontal ", color);
            this.drawWinArrow(result, 0, color);
            return color;
        }
        result = this.checkVertical(color);
        if (result > -1) {
            console.log(result, " Vertical ", color);
            this.drawWinArrow(result, 1, color);
            return color;
        }
        result = this.checkDiagonalUp(color);
        if (result > -1) {
            console.log(result, " Diagonal Up ", color);
            this.drawWinArrow(result, 2, color);
            return color;
        }
        result = this.checkDiagonalDown(color);
        if (result > -1) {
            console.log(result, " Diagonal Down ", color);
            this.drawWinArrow(result, 3, color);
            return color;
        }
        return 0;
    }
    
    private checkHorizontal(color: number) : number
    {
        for (var row = 0; row < this.gameBoard.length; row++)
            for (var col = 0; col < 4; col++)
                if (this.gameBoard[row][col] == color && this.gameBoard[row][col+1] == color && this.gameBoard[row][col+2] == color && this.gameBoard[row][col+3] == color)
                    return row*10 + col;
        return -1;
    }
    
    private checkVertical(color: number) : number
    {
        for (var row = 0; row < 3; row++)
            for (var col = 0; col < this.gameBoard[0].length; col++)
                if (this.gameBoard[row][col] == color && this.gameBoard[row+1][col] == color && this.gameBoard[row+2][col] == color && this.gameBoard[row+3][col] == color)
                    return row*10 + col;
        return -1;
    }
    
    private checkDiagonalUp(color: number) : number
    {
        for (var row = 0; row < 3; row++)
            for (var col = 0; col < 4; col++)
                if (this.gameBoard[row][col] == color && this.gameBoard[row+1][col+1] == color && this.gameBoard[row+2][col+2] == color && this.gameBoard[row+3][col+3] == color)
                    return row*10 + col;
        return -1;
    }
    
    private checkDiagonalDown(color: number) : number 
{
        for (var row = 3; row < this.gameBoard.length; row++)
            for (var col = 0; col < 4; col++)
                if (this.gameBoard[row][col] == color && this.gameBoard[row-1][col+1] == color && this.gameBoard[row-2][col+2] == color && this.gameBoard[row-3][col+3] == color)
                    return row*10 + col;
        return -1;
    }










    
}
















// This is included because the paper is missing a TypeScript definition
// You do not need to modify it
class GameEvent
{
    readonly delta: number;
    readonly time: number;
    readonly count: number;

    constructor()
    {
        this.delta = 0;
        this.time = 0;
        this.count = 0;
    }
}
    
// Start the game
var game = new Game();
game.start();