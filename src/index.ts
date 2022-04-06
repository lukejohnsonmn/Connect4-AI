/* Assignment 1: Space Minesweeper
 * CSCI 4611, Spring 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as paper from 'paper';
import { Color, Layer, PaperScope } from 'paper/dist/paper-core';

class Game 
{
    // Width and height are defined in project coordinates
    // This is different than screen coordinates!
    private width : number;
    private height : number;
    private GAME_HEIGHT: number;
    private GAME_SHIFT_X: number;
    private GAME_SHIFT_Y: number;
    private gameType: number;
    private coolDown: boolean;
    private gameReady: boolean;
    private gameStarted: boolean;
    private gameOver: boolean;
    private isRedTurn: boolean;
    private isPlayerTurn: boolean;
    private elapsedTime: number;
    private timer : number;
    private heuristicCalls : number;
    private turnNum: number;

    private DEPTH: number;
    private MAX_SEARCHES : number;
    private MAX_VALUE: number;
    private WIN_VALUE: number;
    private TIEBREAK: boolean;
    private FIRST_MOVE: boolean;

    private colorDark : string;
    private colorGray : string;
    

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
    private sideRedText : paper.PointText | undefined;
    private sideYellowText : paper.PointText | undefined;
    private consoleText : paper.PointText | undefined;
    private menuHighlight : paper.Path | undefined;
    private moveHighlight : paper.Path | undefined;
    private evaluationBack : paper.Path | undefined;
    private evaluationYellow : paper.Path | undefined;
    private evaluationRed : paper.Path | undefined;
    private evaluationBar : paper.Path | undefined;
    private sideBack : paper.Path | undefined;
    private sideBackOutline : paper.Path | undefined;
    private consoleBack : paper.Path | undefined;
    private consoleBackOutline : paper.Path | undefined;
    private titleBack : paper.Path | undefined;
    private titleBackOutline : paper.Path | undefined;
    private helpBack : paper.Path | undefined;
    private helpBackOutline : paper.Path | undefined;
    private menuBack : paper.Path | undefined;
    private menuBackOutline : paper.Path | undefined;


    private gameBoard : Array<Array<number>>;
    private spaceValues : Array<Array<number>>;
    
    constructor()
    {
        paper.setup('canvas');
        this.width = 1200;
        this.height = 800;
        this.GAME_HEIGHT = 280;
        this.GAME_SHIFT_X = 0;
        this.GAME_SHIFT_Y = -90;
        this.coolDown = true;
        this.gameReady = false;
        this.gameStarted = false;
        this.gameOver = false;
        this.isRedTurn = true;
        this.isPlayerTurn = false;
        this.gameType = 0;
        this.elapsedTime = 0;
        this.timer = 0;
        this.heuristicCalls = 0;
        this.turnNum = 0
        
        this.DEPTH = 6;
        this.MAX_SEARCHES = 2000000;
        this.MAX_VALUE = 10000000;
        this.WIN_VALUE = 1000;
        this.TIEBREAK = false;
        this.FIRST_MOVE = true;

        this.colorDark = '#111111';
        this.colorGray = '#808080';

        this.gameBoard =    [[0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0]];
        
        this.spaceValues =  [[3,4,5,7,5,4,3],
                            [4,6,8,10,8,6,4],
                            [5,8,11,13,11,8,5],
                            [5,8,11,13,11,8,5],
                            [4,6,8,10,8,6,4],
                            [3,4,5,7,5,4,3]];
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
        this.winText = new paper.PointText(new paper.Point(200, -73));
        this.winText.justification = "center";
        this.winText.fontSize = 80;
        this.winText!.content = "Connect 4!";
        this.winText!.fillColor = new paper.Color("#1260cc");
        this.winText.addTo(this.game);

        // Setup display for help text
        this.helpText = new paper.PointText(new paper.Point(200, 440));
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



        // Setup display for side text
        this.sideYellowText = new paper.PointText(new paper.Point(530, 228));
        this.sideYellowText.justification = "center";
        this.sideYellowText.fontSize = 30;
        this.sideYellowText.fillColor = new paper.Color("yellow");
        this.sideYellowText.visible = false;
        this.sideYellowText.addTo(this.game);

        // Setup display for side text
        this.sideRedText = new paper.PointText(new paper.Point(530, 150));
        this.sideRedText.justification = "center";
        this.sideRedText.fontSize = 30;
        this.sideRedText.fillColor = new paper.Color("red");
        this.sideRedText.visible = false;
        this.sideRedText.addTo(this.game);



        // Setup display for console text
        this.consoleText = new paper.PointText(new paper.Point(-320, 50));
        this.consoleText.fontFamily = "Consolas";
        this.consoleText.justification = "left";
        this.consoleText.fontSize = 16;
        this.consoleText.fillColor = new paper.Color("white");
        this.consoleText.visible = false;
        var myString = "";
		myString += "OPENING" + "\n";
		myString += "+-----+-----------+----------+" + "\n";
		myString += "| col | heuristic | tiebreak |" + "\n";
		myString += "+-----+-----------+----------+" + "\n";
        for (var i = 0; i < 7; i++) {
            myString += "|     |           |          |" + "\n";
        }
        myString += "+-----+-----------+----------+"
        this.consoleText.content = myString;
        this.consoleText.addTo(this.game);




        var rec0 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(250, 50));
        this.menuHighlight = new paper.Path.Rectangle(rec0);
        this.menuHighlight.fillColor = new paper.Color('#222222');
        this.menuHighlight.position.x = 520;
        this.menuHighlight.position.y = 90;
        this.menuHighlight.addTo(this.game!);
        this.menuHighlight.sendToBack();
        this.menuHighlight.visible = false;

        var rec1 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(49, 300));
        this.moveHighlight = new paper.Path.Rectangle(rec1);
        this.moveHighlight.fillColor = new paper.Color('#222222');
        this.moveHighlight.position.x = 49;
        this.moveHighlight.position.y = 155;
        this.moveHighlight.addTo(this.game!);
        this.moveHighlight.sendToBack();
        this.moveHighlight.visible = false;

        var rec2 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(20, 160));
        this.evaluationYellow = new paper.Path.Rectangle(rec2);
        this.evaluationYellow.fillColor = new paper.Color('#404000');
        this.evaluationYellow.position.x = 450;
        this.evaluationYellow.position.y = 255;
        this.evaluationYellow.addTo(this.game!);
        this.evaluationYellow.sendToBack();
        this.evaluationYellow.visible = false;

        var rec2 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(20, 160));
        this.evaluationRed = new paper.Path.Rectangle(rec2);
        this.evaluationRed.fillColor = new paper.Color('#400000');
        this.evaluationRed.position.x = 450;
        this.evaluationRed.position.y = 95;
        this.evaluationRed.addTo(this.game!);
        this.evaluationRed.sendToBack();
        this.evaluationRed.visible = false;

        var rec3 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(30, 330));
        this.evaluationBack = new paper.Path.Rectangle(rec3);
        this.evaluationBack.fillColor = new paper.Color(this.colorGray);
        this.evaluationBack.position.x = 450;
        this.evaluationBack.position.y = 175;
        this.evaluationBack.addTo(this.game!);
        this.evaluationBack.sendToBack();
        this.evaluationBack.visible = false;

        var rec4 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(20, 0));
        this.evaluationBar = new paper.Path.Rectangle(rec4);
        this.evaluationBar.visible = false;

        

        var rec5 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(145, 360));
        this.sideBack = new paper.Path.Rectangle(rec5);
        this.sideBack.fillColor = new paper.Color(this.colorDark);
        this.sideBack.position.x = 525;
        this.sideBack.position.y = 175;
        this.sideBack.addTo(this.game!);
        this.sideBack.sendToBack();
        this.sideBack.visible = false;

        var rec6 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(155, 370));
        this.sideBackOutline = new paper.Path.Rectangle(rec6);
        this.sideBackOutline.fillColor = new paper.Color(this.colorGray);
        this.sideBackOutline.position.x = 525;
        this.sideBackOutline.position.y = 175;
        this.sideBackOutline.addTo(this.game!);
        this.sideBackOutline.sendToBack();
        this.sideBackOutline.visible = false;



        var rec7 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(300, 270));
        this.consoleBack = new paper.Path.Rectangle(rec7);
        this.consoleBack.fillColor = new paper.Color(this.colorDark);
        this.consoleBack.position.x = -188;
        this.consoleBack.position.y = 150;
        this.consoleBack.addTo(this.game!);
        this.consoleBack.sendToBack();
        this.consoleBack.visible = false;

        var rec8 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(310, 280));
        this.consoleBackOutline = new paper.Path.Rectangle(rec8);
        this.consoleBackOutline.fillColor = new paper.Color(this.colorGray);
        this.consoleBackOutline.position.x = -188;
        this.consoleBackOutline.position.y = 150;
        this.consoleBackOutline.addTo(this.game!);
        this.consoleBackOutline.sendToBack();
        this.consoleBackOutline.visible = false;

        var rec9 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(440, 100));
        this.titleBack = new paper.Path.Rectangle(rec9);
        this.titleBack.fillColor = new paper.Color(this.colorDark);
        this.titleBack.position.x = 200;
        this.titleBack.position.y = -100;
        this.titleBack.addTo(this.game!);
        this.titleBack.sendToBack();
        this.titleBack.visible = true;

        var rec10 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(450, 110));
        this.titleBackOutline = new paper.Path.Rectangle(rec10);
        this.titleBackOutline.fillColor = new paper.Color(this.colorGray);
        this.titleBackOutline.position.x = 200;
        this.titleBackOutline.position.y = -100;
        this.titleBackOutline.addTo(this.game!);
        this.titleBackOutline.sendToBack();
        this.titleBackOutline.visible = true;

        var rec11 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(440, 100));
        this.helpBack = new paper.Path.Rectangle(rec11);
        this.helpBack.fillColor = new paper.Color(this.colorDark);
        this.helpBack.position.x = 200;
        this.helpBack.position.y = 450;
        this.helpBack.addTo(this.game!);
        this.helpBack.sendToBack();
        this.helpBack.visible = true;

        var rec12 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(450, 110));
        this.helpBackOutline = new paper.Path.Rectangle(rec12);
        this.helpBackOutline.fillColor = new paper.Color(this.colorGray);
        this.helpBackOutline.position.x = 200;
        this.helpBackOutline.position.y = 450;
        this.helpBackOutline.addTo(this.game!);
        this.helpBackOutline.sendToBack();
        this.helpBackOutline.visible = true;

        var rec13 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(440, 340));
        this.menuBack = new paper.Path.Rectangle(rec13);
        this.menuBack.fillColor = new paper.Color(this.colorDark);
        this.menuBack.position.x = 200;
        this.menuBack.position.y = 175;
        this.menuBack.addTo(this.game!);
        this.menuBack.sendToBack();
        this.menuBack.visible = true;

        var rec14 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(450, 350));
        this.menuBackOutline = new paper.Path.Rectangle(rec14);
        this.menuBackOutline.fillColor = new paper.Color(this.colorGray);
        this.menuBackOutline.position.x = 200;
        this.menuBackOutline.position.y = 175;
        this.menuBackOutline.addTo(this.game!);
        this.menuBackOutline.sendToBack();
        this.menuBackOutline.visible = true;
        
        

        //this.displayBoard!.visible = true;

        this.coolDown = false;
    }

    private reset() : void
    {
        window.location.reload();
    }

    // This method will be called once per frame
    private update(event: GameEvent) : void
    {
        if (this.timer >= this.elapsedTime) {
            if (this.gameStarted) {

                // Help text
                if (!this.gameOver && this.isPlayerTurn) {
                    if (this.gameType == 2) {
                        if (this.isRedTurn) {
                            this.helpText!.content = "Player 1 turn";
                            this.helpText!.fillColor = new paper.Color('red');
                        } else {
                            this.helpText!.content = "Player 2 turn";
                            this.helpText!.fillColor = new paper.Color('yellow');
                        }
                    } else {
                        this.helpText!.content = "Player turn";
                        if (this.gameType == 0) {
                            this.helpText!.fillColor = new paper.Color('red');
                        } else {
                            this.helpText!.fillColor = new paper.Color('yellow');
                        }
                    }
                } else if (!this.gameOver) {
                    this.helpText!.content = "Analyzing...";
                    if (this.gameType == 0) {
                        this.helpText!.fillColor = new paper.Color('yellow');
                    } else {
                        this.helpText!.fillColor = new paper.Color('red');
                    }
                }

                // Game handling
                if (this.coolDown) {
                    if (this.GAME_HEIGHT - this.game!.firstChild.data.row * 49 > this.game!.firstChild.position.y) {
                        this.game!.firstChild.data.vel += event.delta * 2000;
                        this.game!.firstChild.position.y += this.game!.firstChild.data.vel * event.delta;
                    } else {
                        this.game!.firstChild.position.y = this.GAME_HEIGHT - this.game!.firstChild.data.row * 49;
                        if (this.coolDown) {
                            this.checkWin();
    
                            this.coolDown = false;
                            if (!this.isPlayerTurn && !this.gameOver) { //&& !this.botThinking) {
                                
                                this.think();
                                
                            }

                            /* pvp evaluation
                            if (!this.gameOver && this.gameType == 2) {
                                this.think();
                            }*/
                        } 
                    }
                }
    
            }
        
        // Account for time lost from think() algorithm
        } else {
            this.timer += event.delta * 1000;
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
                this.menuHighlight!.visible = true;
            } else if (x > 470 && x < 720 && y > 275 && y < 325) {
                this.menuHighlight!.position.x = 200;
                this.menuHighlight!.position.y = 162;
                this.menuHighlight!.visible = true;
            } else if (x > 470 && x < 720 && y > 350 && y < 400) {
                this.menuHighlight!.position.x = 200;
                this.menuHighlight!.position.y = 234;
                this.menuHighlight!.visible = true;
            } else {
                this.menuHighlight!.visible = false;
            }
        } else if (this.gameReady && !this.coolDown) {
            if (event.point.y > 175 && event.point.y < 600) {
                this.moveHighlight!.sendToBack();
                if (this.isPlayerTurn && this.isRedTurn) {
                    this.moveHighlight!.fillColor = new paper.Color('#400000');
                } else if (this.isPlayerTurn && !this.isRedTurn) {
                    this.moveHighlight!.fillColor = new paper.Color('#404000');
                } else {
                    this.moveHighlight!.fillColor = new paper.Color('#222222');
                }
                if (x > 425 && x < 474) {
                    this.moveHighlight!.position.x = 49;
                    this.moveHighlight!.visible = true;
                } else if (x > 474 && x < 523) {
                    this.moveHighlight!.position.x = 98;
                    this.moveHighlight!.visible = true;
                } else if (x > 523 && x < 572) {
                    this.moveHighlight!.position.x = 147;
                    this.moveHighlight!.visible = true;
                } else if (x > 572 && x < 621) {
                    this.moveHighlight!.position.x = 196;
                    this.moveHighlight!.visible = true;
                } else if (x > 621 && x < 670) {
                    this.moveHighlight!.position.x = 245;
                    this.moveHighlight!.visible = true;
                } else if (x > 670 && x < 719) {
                    this.moveHighlight!.position.x = 294;
                    this.moveHighlight!.visible = true;
                } else if (x > 719 && x < 768) {
                    this.moveHighlight!.position.x = 343;
                    this.moveHighlight!.visible = true;
                } else {
                    this.moveHighlight!.visible = false;
                }
            } else {
                this.moveHighlight!.visible = false;
            }
        }
        
        if (!this.coolDown) {
            if (x > 380 && x < 820 && y > -15 && y < 85) {
                this.titleBack!.fillColor = new paper.Color('#222222');
            } else {
                this.titleBack!.fillColor = new paper.Color('#111111');
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
        } else if (!this.gameOver && !this.coolDown && this.isPlayerTurn) {
            if (event.point.y > 175 && event.point.y < 600) {
                this.moveHighlight!.visible = false;
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
        
        if (x > 380 && x < 820 && y > -15 && y < 85) {
            this.reset();
        }
    }





    private displayBoard() : void
    {
        for (var i=0; i < this.game!.children.length; i++) {
            if (this.game!.children[i].data.isDisplay) {
                this.game!.children[i].visible = true;
            }
        }
    }


    private startGame(type : number) : void
    {
        this.gameReady = true;

        if (type == 0) {
            this.sideRedText!.content = "Player";
            this.sideYellowText!.content = "AI";
            this.helpText!.fillColor = new paper.Color('red');
            this.helpText!.content = "Player turn";
        } else if (type == 1) {
            this.sideRedText!.content = "AI";
            this.sideYellowText!.content = "Player";
            this.helpText!.fillColor = new paper.Color('red');
            this.helpText!.content = "Analyzing...";
        } else {
            this.sideRedText!.content = "Player 1";
            this.sideYellowText!.content = "Player 2";
            this.helpText!.fillColor = new paper.Color('red');
            this.helpText!.content = "Player 1 turn";
        }

        this.helpText!.position.y = 448;

        
        
        this.menuRedText!.visible = false;
        this.menuWhiteText!.visible = false;
        this.menuYellowText!.visible = false;
        this.menuHighlight!.visible = false;
        this.menuBack!.visible = false;
        this.menuBackOutline!.visible = false;

        this.sideRedText!.visible = true;
        this.sideYellowText!.visible = true;
        this.evaluationBack!.visible = true;
        this.evaluationYellow!.visible = true;
        this.evaluationRed!.visible = true;
        this.sideBack!.visible = true;
        this.sideBackOutline!.visible = true;
        
        

        if (type < 2) {
            this.consoleText!.visible = true;
            this.consoleBack!.visible = true;
            this.consoleBackOutline!.visible = true;
        }
        //this.winText!.visible = false;
        if (type == 1) {
            this.isPlayerTurn = false;
        } else {
            this.isPlayerTurn = true;
        }

        this.gameType = type;
        
        this.displayBoard();

        if (type == 1) {
            this.think();
        }
    }

    

    


    // for color: 1 = red, -1 = yellow.
    private addPiece(col : number) : boolean
    {
        this.coolDown = true;
        this.turnNum++;

        if (!this.gameStarted) {
            this.gameStarted = true;
        }

        var color;
        if (this.isRedTurn) {
            color = 1;
        } else {
            color = -1;
        }

        // Ensure that AI always plays as positive numbers
        if (this.gameType == 0) {
            color = -color;
        }
        
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

        // Switch back colors for display
        if (this.gameType == 0) {
            color = -color;
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

        if (this.gameType < 2) {
            this.isPlayerTurn = !this.isPlayerTurn;
        }

		return openCol;
    }

    private drawWinArrow(arrowPos : number, arrowDir : number, color : number) : void
    {
        this.gameOver = true;

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

        // Flip for yellow AI
        if (this.gameType == 0) {
            color = -color;
        }

        // Update win text
        if (color == 1) {
            this.winText!.content = "Red wins!";
            this.winText!.fillColor = new paper.Color("red");
        } else {
            this.winText!.content = "Yellow wins!";
            this.winText!.fillColor = new paper.Color("yellow");
        }
        this.winText!.bringToFront();
        this.winText!.visible = true;

        this.helpText!.fillColor = new paper.Color("gold");
        this.helpText!.content = "Click anywhere to play again!";
        this.helpText!.visible = true;
        
    }

    
    private drawnGame() : void
    {
        this.gameOver = true;
        this.winText!.content = "Draw!";
        this.winText!.fillColor = new paper.Color("white");
        this.winText!.bringToFront();
        this.winText!.visible = true;

        this.helpText!.fillColor = new paper.Color("gold");
        this.helpText!.content = "Click anywhere to play again!";
        this.helpText!.visible = true;
    }
    

    private checkWin() : number {

        var color;
        
        if (this.isRedTurn) { // Yellow just played, check yellow
            color = -1;
        } else { // Otherwise, check red
            color = 1;
        }

        // Flip colors for yellow AI
        if (this.gameType == 0) {
            color = -color;
        }

        var result = this.checkHorizontal(color);
        if (result > -1) {
            this.drawWinArrow(result, 0, color);
            return color;
        }
        result = this.checkVertical(color);
        if (result > -1) {
            this.drawWinArrow(result, 1, color);
            return color;
        }
        result = this.checkDiagonalUp(color);
        if (result > -1) {
            this.drawWinArrow(result, 2, color);
            return color;
        }
        result = this.checkDiagonalDown(color);
        if (result > -1) {
            this.drawWinArrow(result, 3, color);
            return color;
        }
        if (this.countLegalMoves(this.gameBoard) == 0) {
            this.drawnGame();
            return 0;
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


    // Return highest unoccupied row of a col
	private getTopRowOfCol(board : Array<Array<number>>, col : number) : number
    {
		for (var row = 0; row < board.length; row++) {
			if (board[row][col] == 0) {
				return row;
			}
		}
		return -1;
	}


    // Retrieve space value from space_values array
	private spaceValue(col : number) : number
    {
		if (col < 0 || col > this.gameBoard[0].length) {
			return -1;
		}

        var row = this.getTopRowOfCol(this.gameBoard, col);
		
        if (row > 5) {
            return -1;
        }

        return this.spaceValues[row][col];
	}


    // Print formatting for heuristic values at each col
	private printHeuristics(moves : Array<number>, bestMove : number) : void
    {

        var myString = "";
        if (this.FIRST_MOVE) {
            this.FIRST_MOVE = false;
            myString += "OPENING" + "\n";
        } else {
            myString += "DEPTH: " + (this.DEPTH+1) + "\n";// + ", " + this.heuristicCalls + " outcomes analyzed" + "\n";
            if (this.heuristicCalls > 1) {
                myString += "ANALYZED: " + this.heuristicCalls + " positions\n";
            } else {
                myString += "ANALYZED: " + this.heuristicCalls + " position\n";
            }
            console.log("----------------------Actual:", this.heuristicCalls);
            
            //myString += "POSITIONS ANALYZED: " + this.heuristicCalls + "\n";
        }
		
		myString += "+-----+-----------+----------+" + "\n";
		myString += "| col | heuristic | tiebreak |" + "\n";
		myString += "+-----+-----------+----------+" + "\n";
		
		for (var i = 0; i < moves.length; i++) {

            // | col
			if (i == bestMove) {
				myString += "| *" + (i+1);
			} else {
				myString += "|  " + (i+1);
			}
			
            // col |
			if (moves[i] < 0) {
				myString += "  | " + moves[i];
			} else {
				myString += "  |  " + moves[i];
			}

            // heuristic |
            if (Math.abs(moves[i]) <= 9) {              // abs(x) <= 9
                myString += "        | ";
            } else if (Math.abs(moves[i]) <= 99) {      // abs(x) <= 99
                myString += "       | ";
            } else if (Math.abs(moves[i]) <= 999) {     // abs(x) <= 999
                myString += "      | ";
            } else if (Math.abs(moves[i]) <= 9999) {    // abs(x) <= 9999
                myString += "     | ";
            } else {                                    // abs(x) >= 10000
                myString += " | ";
            }
			
            // tiebreak |
			if (this.TIEBREAK && moves[i] == moves[bestMove]) {
                var value = this.spaceValue(i);
                if (value <= 9) {           // value <= 9
                    myString += value + "        |"
                } else {                    // value >= 10
                    myString += value + "       |"
                }
            } else {
                myString += "         |";
            }

			myString += "\n";
		}
		myString += "+-----+-----------+----------+" + "\n";
        this.consoleText!.content = myString;
        this.updateEvalutationBar(moves[bestMove]);
	}

    private updateEvalutationBar(bestMove : number) : void
    {

        // Flip for yellow display
        if (this.gameType == 0) {
            bestMove = -bestMove;
        }

        if (bestMove >= 1000) {
            this.evaluationBack!.fillColor = new paper.Color('red');
        } else if (bestMove <= -1000) {
            this.evaluationBack!.fillColor = new paper.Color('yellow');
        } else {
            this.evaluationBack!.fillColor = new paper.Color(this.colorGray);
        }

        // Max bar is 160
        if (bestMove > 160) {
            bestMove = 160;
        } else if (bestMove < -160) {
            bestMove = -160;
        }

        this.evaluationBar!.remove();

        var rec = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(20, bestMove));
        this.evaluationBar = new paper.Path.Rectangle(rec);

        if (bestMove > 0) {
            this.evaluationBar.fillColor = new paper.Color('red');
        } else if (bestMove < 0) {
            this.evaluationBar.fillColor = new paper.Color('yellow');
        } else {
            this.evaluationBar.visible = false;
            return;
        }
        this.evaluationBar.position.x = 450;
        this.evaluationBar.position.y = 175 - bestMove/2;
        this.evaluationBar.addTo(this.game!);
        
        this.evaluationBar!.visible = true;
    }


    // Calculate space values for each candidate best move
	private indexOfLargest(moves : Array<number>) : number {

        if (moves.length == 0) {
            return -1;
        }

        var index = 0;
        var value = this.spaceValue(moves[0]);
        var max = value;

        for (var i = 1; i < moves.length; i++) {
            value = this.spaceValue(moves[i]);
            if (value > max) {
                max = value;
                index = i;
            }
        }
        return moves[index];
	}

    // Place the best moves into an array, then return index of best move
	// If necessary, calculate space values to resolve a tie
	private indexOfBestMove(array : Array<number>) : number {

        if (array.length == 0)
            return -1;

        var bestMoves = new Array<number>();
        bestMoves.push(0);
        
        // Extract the best moves into an list
        for (var i = 1; i < array.length; i++) {
            if (array[i] > array[bestMoves[0]]) {
                bestMoves = new Array<number>();
                bestMoves.push(i);
            } else if (array[i] == array[bestMoves[0]]) {
                bestMoves.push(i);
            }
        }
        
        this.TIEBREAK = true;
        
        // No need to resolve tie if there is no tie
        if (bestMoves.length == 1) {
            this.TIEBREAK = false;
            return bestMoves[0];
        }
        
        return this.indexOfLargest(bestMoves);
	}



    // Place a piece on the 'pretend' board
    private pretendAddPiece(board : Array<Array<number>>, col : number, color : number) : Array<Array<number>> {
        for (var row = 0; row < board.length; row++) {
            if (board[row][col] == 0) {
                board[row][col] = color;
                row = board.length;
            }
        }
        return board;
    }


    // Used to update DEPTH
    private countLegalMoves(board : Array<Array<number>>) : number {
        var total = 0;
        for (var col = 0; col < 7; col++) {
            if (board[5][col] == 0) {
                total++;
            }
        }
        return total;
    }


    // Estimates the number of searches for a given depth on the current game board
    private projectedSearches(depth : number, cols : number) : number
    {
        // distance from top (rows)
        // each index (i) represents height
        // (0 = only the top row of column is empty)
        // (5 = col is completely open)
        // each value (v) represents # of columns at height (i)
        //      height = [0,1,2,3,4,5]
        var colHeights = [0,0,0,0,0,0];
        for (var c = 0; c < 7; c++) {
            var topRow = this.getTopRowOfCol(this.gameBoard, c);
            if (topRow > -1) {
                colHeights[5-topRow]++;
            }
        }   

        // Begin math

        depth++;
        var baseValue = Math.pow(cols, depth);
        var newValue = Math.pow(cols, depth);
        for (var h = 0; h < colHeights.length; h++) {
            newValue -= (baseValue - (baseValue * Math.pow(.7, colHeights[h])) ) * (Math.pow(.4,h));
        }
        if (cols == 6) {
            return newValue * 5/6;
        } else if (cols == 5) {
            return newValue * 1/2;
        } else if (cols == 4) {
            return newValue * 1/42;
        } else if (cols == 3) {
            return newValue * 1/100
        }
        return newValue;
    }


    // Update the depth of thinking as the number of open cols reduce
	private updateDEPTH(board : Array<Array<number>>) : void {
		var numOpenCols = this.countLegalMoves(board);

        
        //console.log("numOpenCols:", numOpenCols, " DEPTH:", this.DEPTH+1, " prevheuristicCalls:", this.heuristicCalls);
        if (numOpenCols == 1) {
            this.DEPTH = 7;
        } else if (numOpenCols == 2) {
            this.DEPTH = 13;
        } else {
            
            // Increase DEPTH until projectedSearches exceeds MAX_SEARCHES
            while (this.projectedSearches(this.DEPTH, numOpenCols) < this.MAX_SEARCHES) {
                this.DEPTH++;
            }
            this.DEPTH--;
        }

        // Keep depth with num of remaining moves
        if (this.DEPTH > 41 - this.turnNum) {
            this.DEPTH = 41 - this.turnNum;
            //console.log("turnNum:", this.turnNum, " DEPTH:", this.DEPTH+1,);
        }

        this.heuristicCalls = 0;
        //console.log("(result) DEPTH:", this.DEPTH+1,);
	}







    // Openings from https://connect4.gamesolver.org
    private openingMove() : Array<number>
    {
        if (this.gameType == 1) {
            return [-2,-1,0,1,0,-1,-2]
        }

        // Get col of first played move by player
        var col = 0;
        for (var i = 1; i < 7; i++) {
            if (this.gameBoard[0][i] == -1) {
                col = i;
            }
        }

        
        var openings =  [[-1,2,1,2,-1,1,-2],
                        [-2,0,1,0,-2,-2,-3],
                        [-2,-2,0,0,0,0,-3],
                        [-4,-2,-2,-1,-2,-2,-4],
                        [-3,0,0,0,0,-2,-2],
                        [-3,-2,-2,0,1,0,-2],
                        [-2,1,-1,2,1,2,-1]];

        return openings[col];
        
    }









    // Thinking algorithm
    private think() : void
    {
        this.timer = 0;
        this.elapsedTime = 0;
        var startTime = new Date().getTime();
        
        
		
        // Deep copy of gameBoard.
        var board = new Array<Array<number>>();
        var moves = new Array<number>();
        for (var i = 0; i < this.gameBoard.length; i++) {
            board.push(this.gameBoard[i].slice());
            moves.push(0);
        }
		moves.push(0);
        
		
		
        //this.DEPTH = 6;
		
		if (this.FIRST_MOVE) {
            moves = this.openingMove();


		} else {
            //Update search depth based on number of open cols
            this.updateDEPTH(board);

            for (var i = 0; i < moves.length; i++) {
			
                // Check if move is legal
                if (board[5][i] == 0) {
                    moves[i] = this.minMaxAlgorithm(board, i, 1, this.DEPTH);
                } else {
                    moves[i] = -this.MAX_VALUE;
                }
            }
        }
		
		
		
		var bestMove = this.indexOfBestMove(moves);
		
		this.printHeuristics(moves, bestMove);
		
        this.elapsedTime = new Date().getTime() - startTime;

        // Play the best move. Will always be last line of think().
        this.addPiece(bestMove);
		
    }


    private minMaxAlgorithm(board : Array<Array<number>>, col : number, color : number, depth : number) : number {
		
        

		// Deep copy of board.
        var newBoard = new Array<Array<number>>();
        for (var i = 0; i < board.length; i++) {
            newBoard[i] = board[i].slice();
        }

		// Add requested move.
		newBoard = this.pretendAddPiece(newBoard, col, color);
		
		// Base case for end of searching
		// Return heuristic analysis of board
		if (depth <= 0) {
            this.heuristicCalls++;
			return this.heuristic(newBoard);
		}
		
		// Found a win, return and do not continue searching
		if (this.heuristic(newBoard) == this.WIN_VALUE * color) {
			return this.WIN_VALUE * color;
		}
		
		// Find value of strongest response for opponent
		// Initially set to worst possible response
		var bestResponse = color * this.MAX_VALUE;
		
		var noLegalMoves = true;
		for (col = 0; col < 7; col++) {
			
			// Check if move is legal
			if (newBoard[5][col] == 0) {
				
				// If response is stronger than bestResponse, update bestResponse
				if (color == 1) {
					bestResponse = Math.min(bestResponse, this.minMaxAlgorithm(newBoard, col, color * -1, depth-1));
				} else {
					bestResponse = Math.max(bestResponse, this.minMaxAlgorithm(newBoard, col, color * -1, depth-1));
				}
				
				noLegalMoves = false;
			}
		}
		
		// No playable moves found, so return (draw)
		if (noLegalMoves) {
            //this.heuristicCalls--; // 2nd call on same position, so reset heuristicCalls
			return this.heuristic(newBoard);
		}
		
		// Return strength plus strongest response
		return bestResponse;
	}











    private heuristic(board : Array<Array<number>>) : number
    {
        
		var score = 0;
		var setScore = 0; // Value of a set of 4
		var color = 0;
		var multiplyer = 0;
		
		// Horizontal sets
		for (var row = 0; row < board.length; row++) {
			for (var col = 0; col < 4; col++) {
				
				setScore = 0;
				color = 0;
				multiplyer = 0;
				for (var i = 0; i < 4; i++) {
					if (color == 0 && board[row][col+i] == 1) {
						color = 1;
						setScore++;
					} else if (color == 0 && board[row][col+i] == -1) {
						color = -1;
						setScore--;
					} else if (board[row][col+i] == color) {
						setScore += color;
					} else if (board[row][col+i] == -color) {
						setScore = 0;
						break;
					}

                    // Extra points multiplyer for highest empty row in set
                    if (board[row][col+i] == 0) {
						multiplyer = Math.max(multiplyer, row - this.getTopRowOfCol(board, col+i));
					}
				}

				if (setScore == 4 || setScore == -4) {	// Found four in a row
					return this.WIN_VALUE * color; 		// setScore = +/- 1000
				}
                score += setScore * Math.floor(Math.pow((6 - multiplyer), 1.5));
			}
		}
		
		// Vertical sets
		for (var row = 0; row < 3; row++) {
			for (var col = 0; col < board[0].length; col++) {
				
				setScore = 0;
				color = 0;
				multiplyer = 0;
				for (var i = 0; i < 4; i++) {
					if (color == 0 && board[row+i][col] == 1) {
						color = 1;
						setScore++;
					} else if (color == 0 && board[row+i][col] == -1) {
						color = -1;
						setScore--;
					} else if (board[row+i][col] == color) {
						setScore += color;
					} else if (board[row+i][col] == -color) {
						setScore = 0;
						break;
					}

                    // Extra points multiplyer for highest empty row in set
                    if (board[row+i][col] == 0) {
						multiplyer = Math.max(multiplyer, row+i - this.getTopRowOfCol(board, col));
					}
				}

				if (setScore == 4 || setScore == -4) {	// Found four in a row
					return this.WIN_VALUE * color; 		// setScore = +/- 1000
				}
				score += setScore * Math.floor(Math.pow((6 - multiplyer), 1.5));
			}
		}
			
				
		// Diagonal up sets
		for (var row = 0; row < 3; row++) {
			for (var col = 0; col < 4; col++) {
				
				setScore = 0;
				color = 0;
				multiplyer = 0;
				for (var i = 0; i < 4; i++) {
					if (color == 0 && board[row+i][col+i] == 1) {
						color = 1;
						setScore++;
					} else if (color == 0 && board[row+i][col+i] == -1) {
						color = -1;
						setScore--;
					} else if (board[row+i][col+i] == color) {
						setScore += color;
					} else if (board[row+i][col+i] == -color) {
						setScore = 0;
						break;
					}

                    // Extra points multiplyer for highest empty row in set
                    if (board[row+i][col+i] == 0) {
						multiplyer = Math.max(multiplyer, row+i - this.getTopRowOfCol(board, col+i));
					}
				}

				if (setScore == 4 || setScore == -4) {	// Found four in a row
					return this.WIN_VALUE * color; 		// setScore = +/- 1000
				}
                
                score += setScore * Math.floor(Math.pow((6 - multiplyer), 1.5));
			}
		}
		
		// Diagonal down sets
		for (var row = 3; row < board.length; row++) {
			for (var col = 0; col < 4; col++) {
				
				setScore = 0;
				color = 0;
				multiplyer = 0;
				for (var i = 0; i < 4; i++) {
					if (color == 0 && board[row-i][col+i] == 1) {
						color = 1;
						setScore++;
					} else if (color == 0 && board[row-i][col+i] == -1) {
						color = -1;
						setScore--;
					} else if (board[row-i][col+i] == color) {
						setScore += color;
					} else if (board[row-i][col+i] == -color) {
						setScore = 0;
						break;
					}

                    // Extra points multiplyer for highest empty row in set
                    if (board[row-i][col+i] == 0) {
                        multiplyer = Math.max(multiplyer, row-i - this.getTopRowOfCol(board, col+i));
                    }
				}

				if (setScore == 4 || setScore == -4) {	// Found four in a row
					return this.WIN_VALUE * color; 		// setScore = +/- 1000
				}
                
                score += setScore * Math.floor(Math.pow((6 - multiplyer), 1.5));
				
			}
		}
		
		return score;		
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