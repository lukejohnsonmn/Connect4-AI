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
    private searchedLeafNodes : number;
    private turnNum: number;
    private difficulty: number; // 0: beginner, 1: easy, 2: medium, 3: hard, 4: expert
    private isHoldingSlider: boolean;
    private thinkReady: boolean;

    private prevMove: number;
    private prevBest: number;
    private prevEval: number;
    private currEval: number;
    

    private DEPTH: number;
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
    private menuBar1Text : paper.PointText | undefined;
    private menuBar2Text : paper.PointText | undefined;
    private menuBar3Text : paper.PointText | undefined;
    private menuBar4Text : paper.PointText | undefined;
    private menuBar5Text : paper.PointText | undefined;
    private eval1Text : paper.PointText | undefined;
    private eval2Text : paper.PointText | undefined;
    private eval3Text : paper.PointText | undefined;
    private eval4Text : paper.PointText | undefined;
    private eval5Text : paper.PointText | undefined;
    private eval6Text : paper.PointText | undefined;
    private eval7Text : paper.PointText | undefined;
    private menuBarTitleText : paper.PointText | undefined;
    private sideRedText : paper.PointText | undefined;
    private sideYellowText : paper.PointText | undefined;
    private evaluationText : paper.PointText | undefined;
    private consoleText : paper.PointText | undefined;
    private menuHighlight : paper.Path | undefined;
    private moveHighlight : paper.Path | undefined;
    private evaluationBack : paper.Path | undefined;
    private evaluationMid : paper.Path | undefined;
    private evaluationYellow : paper.Path | undefined;
    private evaluationRed : paper.Path | undefined;
    private evaluationBar : paper.Path | undefined;
    private sideBack : paper.Path | undefined;
    private consoleBack : paper.Path | undefined;
    private titleBack : paper.Path | undefined;
    private helpBack : paper.Path | undefined;
    private menuBack : paper.Path | undefined;
    private menuBar : paper.Path | undefined;
    private slider : paper.Path | undefined;
    private sliderBack : paper.Path | undefined;
    


    private gameBoard : Array<Array<number>>;
    private spaceValues : Array<Array<number>>;
    
    constructor()
    {
        paper.setup('canvas');
        this.width = 1200;
        this.height = 800;
        this.GAME_HEIGHT = 280;
        this.GAME_SHIFT_X = -160;
        this.GAME_SHIFT_Y = -95;
        this.coolDown = true;
        this.gameReady = false;
        this.gameStarted = false;
        this.gameOver = false;
        this.isRedTurn = true;
        this.isPlayerTurn = false;
        this.gameType = 0;
        this.elapsedTime = 0;
        this.timer = 0;
        this.searchedLeafNodes = 1;
        this.turnNum = 0;
        this.difficulty = 2;
        this.isHoldingSlider = false;
        this.thinkReady = false;

        this.prevMove = 0;
        this.prevBest = 0;
        this.prevEval = 0;
        this.currEval = 0;
        
        this.DEPTH = 1;
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
        paper.view.onMouseUp = (event: paper.MouseEvent) => {this.onMouseUp(event);};
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
        this.winText = new paper.PointText(new paper.Point(200, -70));
        this.winText.justification = "center";
        this.winText.fontSize = 64;
        this.winText.shadowColor = new paper.Color(this.colorGray);
        this.winText.shadowBlur = 50;
        this.winText.content = "Connect 4!";
        this.winText.fillColor = new paper.Color('#1260cc');
        this.winText.addTo(this.game);

        // Setup display for help text
        this.helpText = new paper.PointText(new paper.Point(200, 423));
        this.helpText.justification = "center";
        this.helpText.fontSize = 24;
        this.helpText.shadowColor = new paper.Color(this.colorGray);
        this.helpText.shadowBlur = 12;
        this.helpText.fillColor = new paper.Color("gold");
        this.helpText.visible = true;
        this.helpText.content = "Click one of the options\nabove to start a new game!"
        this.helpText.addTo(this.game);

        // Setup display for menu text
        this.menuRedText = new paper.PointText(new paper.Point(130, 100));
        this.menuRedText.justification = "center";
        this.menuRedText.fontSize = 30;
        this.menuRedText.shadowColor = new paper.Color(this.colorGray);
        this.menuRedText.shadowBlur = 75;
        this.menuRedText.fillColor = new paper.Color("red");
        this.menuRedText.visible = true;
        this.menuRedText.content = "Player\n\nAI\n\nPlayer"
        this.menuRedText.addTo(this.game);

        // Setup display for menu text
        this.menuWhiteText = new paper.PointText(new paper.Point(200, 100));
        this.menuWhiteText.justification = "center";
        this.menuWhiteText.fontSize = 30;
        this.menuWhiteText.shadowColor = new paper.Color(this.colorGray);
        this.menuWhiteText.shadowBlur = 75;
        this.menuWhiteText.fillColor = new paper.Color("white");
        this.menuWhiteText.visible = true;
        this.menuWhiteText.content = "vs\n\nvs\n\nvs"
        this.menuWhiteText.addTo(this.game);

        // Setup display for menu text
        this.menuYellowText = new paper.PointText(new paper.Point(270, 100));
        this.menuYellowText.justification = "center";
        this.menuYellowText.fontSize = 30;
        this.menuYellowText.shadowColor = new paper.Color(this.colorGray);
        this.menuYellowText.shadowBlur = 75;
        this.menuYellowText.fillColor = new paper.Color("yellow");
        this.menuYellowText.visible = true;
        this.menuYellowText.content = "AI\n\nPlayer\n\nPlayer"
        this.menuYellowText.addTo(this.game);

        // Setup display for menu bar text
        this.menuBarTitleText = new paper.PointText(new paper.Point(-112, 20));
        this.menuBarTitleText.justification = "right";
        this.menuBarTitleText.fontSize = 24;
        this.menuBarTitleText.shadowColor = new paper.Color(this.colorGray);
        this.menuBarTitleText.shadowBlur = 12;
        this.menuBarTitleText.fillColor = new paper.Color("white");
        this.menuBarTitleText.visible = true;
        this.menuBarTitleText.content = "Difficulty       Depth"
        this.menuBarTitleText.addTo(this.game);

        // Setup display for menu bar text
        this.menuBar1Text = new paper.PointText(new paper.Point(-117, 7));
        this.menuBar1Text.fontFamily = "Consolas";
        this.menuBar1Text.justification = "right";
        this.menuBar1Text.fontSize = 16;
        this.menuBar1Text.shadowColor = new paper.Color(this.colorGray);
        this.menuBar1Text.shadowBlur = 12;
        this.menuBar1Text.fillColor = new paper.Color('#32cd32');
        this.menuBar1Text.visible = true;
        this.menuBar1Text.content = "\n\n\nBEGINNER        MIN   "
        this.menuBar1Text.addTo(this.game);

        // Setup display for menu bar text
        this.menuBar2Text = new paper.PointText(new paper.Point(-117, 7));
        this.menuBar2Text.fontFamily = "Consolas";
        this.menuBar2Text.justification = "right";
        this.menuBar2Text.fontSize = 16;
        this.menuBar2Text.shadowColor = new paper.Color(this.colorGray);
        this.menuBar2Text.shadowBlur = 12;
        this.menuBar2Text.fillColor = new paper.Color('#2ab258');
        this.menuBar2Text.visible = true;
        this.menuBar2Text.content = "\n\n\n\n\n\nEASY        LOW   "
        this.menuBar2Text.addTo(this.game);

        // Setup display for menu bar text
        this.menuBar3Text = new paper.PointText(new paper.Point(-117, 7));
        this.menuBar3Text.fontFamily = "Consolas";
        this.menuBar3Text.justification = "right";
        this.menuBar3Text.fontSize = 16;
        this.menuBar3Text.shadowColor = new paper.Color(this.colorGray);
        this.menuBar3Text.shadowBlur = 12;
        this.menuBar3Text.fillColor = new paper.Color('#22967f');
        this.menuBar3Text.visible = true;
        this.menuBar3Text.content = "\n\n\n\n\n\n\n\n\nMEDIUM        MEDIUM"
        this.menuBar3Text.addTo(this.game);

        // Setup display for menu bar text
        this.menuBar4Text = new paper.PointText(new paper.Point(-117, 7));
        this.menuBar4Text.fontFamily = "Consolas";
        this.menuBar4Text.justification = "right";
        this.menuBar4Text.fontSize = 16;
        this.menuBar4Text.shadowColor = new paper.Color(this.colorGray);
        this.menuBar4Text.shadowBlur = 12;
        this.menuBar4Text.fillColor = new paper.Color('#1a7ba6');
        this.menuBar4Text.visible = true;
        this.menuBar4Text.content = "\n\n\n\n\n\n\n\n\n\n\n\nHARD        HIGH  "
        this.menuBar4Text.addTo(this.game);

        // Setup display for menu bar text
        this.menuBar5Text = new paper.PointText(new paper.Point(-117, 7));
        this.menuBar5Text.fontFamily = "Consolas";
        this.menuBar5Text.justification = "right";
        this.menuBar5Text.fontSize = 16;
        this.menuBar5Text.shadowColor = new paper.Color(this.colorGray);
        this.menuBar5Text.shadowBlur = 12;
        this.menuBar5Text.fillColor = new paper.Color('#1260cc');
        this.menuBar5Text.visible = true;
        this.menuBar5Text.content = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nEXPERT        MAX   "
        this.menuBar5Text.addTo(this.game);

        // Setup display for evaluation text
        this.eval1Text = new paper.PointText(new paper.Point(-320, 50));
        this.eval1Text.fontFamily = "Consolas";
        this.eval1Text.justification = "left";
        this.eval1Text.fontSize = 16;
        this.eval1Text.shadowBlur = 10;
        this.eval1Text.fillColor = new paper.Color('yellow');
        this.eval1Text.visible = false;
        this.eval1Text.content = "\n\n\n\n   1"
        this.eval1Text.addTo(this.game);

        // Setup display for evaluation text
        this.eval2Text = new paper.PointText(new paper.Point(-320, 50));
        this.eval2Text.fontFamily = "Consolas";
        this.eval2Text.justification = "left";
        this.eval2Text.fontSize = 16;
        this.eval1Text.shadowBlur = 10;
        this.eval2Text.fillColor = new paper.Color('red');
        this.eval2Text.visible = false;
        this.eval2Text.content = "\n\n\n\n\n   1"
        this.eval2Text.addTo(this.game);

        // Setup display for evaluation text
        this.eval3Text = new paper.PointText(new paper.Point(-320, 50));
        this.eval3Text.fontFamily = "Consolas";
        this.eval3Text.justification = "left";
        this.eval3Text.fontSize = 16;
        this.eval1Text.shadowBlur = 10;
        this.eval3Text.fillColor = new paper.Color('yellow');
        this.eval3Text.visible = false;
        this.eval3Text.content = "\n\n\n\n\n\n   1"
        this.eval3Text.addTo(this.game);

        // Setup display for evaluation text
        this.eval4Text = new paper.PointText(new paper.Point(-320, 50));
        this.eval4Text.fontFamily = "Consolas";
        this.eval4Text.justification = "left";
        this.eval4Text.fontSize = 16;
        this.eval1Text.shadowBlur = 10;
        this.eval4Text.fillColor = new paper.Color('red');
        this.eval4Text.visible = false;
        this.eval4Text.content = "\n\n\n\n\n\n\n   1"
        this.eval4Text.addTo(this.game);

        // Setup display for evaluation text
        this.eval5Text = new paper.PointText(new paper.Point(-320, 50));
        this.eval5Text.fontFamily = "Consolas";
        this.eval5Text.justification = "left";
        this.eval5Text.fontSize = 16;
        this.eval1Text.shadowBlur = 10;
        this.eval5Text.fillColor = new paper.Color('yellow');
        this.eval5Text.visible = false;
        this.eval5Text.content = "\n\n\n\n\n\n\n\n   1"
        this.eval5Text.addTo(this.game);

        // Setup display for evaluation text
        this.eval6Text = new paper.PointText(new paper.Point(-320, 50));
        this.eval6Text.fontFamily = "Consolas";
        this.eval6Text.justification = "left";
        this.eval6Text.fontSize = 16;
        this.eval1Text.shadowBlur = 10;
        this.eval6Text.fillColor = new paper.Color('red');
        this.eval6Text.visible = false;
        this.eval6Text.content = "\n\n\n\n\n\n\n\n\n   1"
        this.eval6Text.addTo(this.game);

        // Setup display for evaluation text
        this.eval7Text = new paper.PointText(new paper.Point(-320, 50));
        this.eval7Text.fontFamily = "Consolas";
        this.eval7Text.justification = "left";
        this.eval7Text.fontSize = 16;
        this.eval1Text.shadowBlur = 10;
        this.eval7Text.fillColor = new paper.Color('yellow');
        this.eval7Text.visible = false;
        this.eval7Text.content = "\n\n\n\n\n\n\n\n\n\n   1"
        this.eval7Text.addTo(this.game);

        // Setup display for side text
        this.sideYellowText = new paper.PointText(new paper.Point(530, 273));
        this.sideYellowText.justification = "center";
        this.sideYellowText.fontSize = 30;
        this.sideYellowText.shadowColor = new paper.Color(this.colorGray);
        this.sideYellowText.shadowBlur = 50;
        this.sideYellowText.fillColor = new paper.Color("yellow");
        this.sideYellowText.visible = false;
        this.sideYellowText.addTo(this.game);

        // Setup display for side text
        this.sideRedText = new paper.PointText(new paper.Point(530, 100));
        this.sideRedText.justification = "center";
        this.sideRedText.fontSize = 30;
        this.sideRedText.shadowColor = new paper.Color(this.colorGray);
        this.sideRedText.shadowBlur = 50;
        this.sideRedText.fillColor = new paper.Color("red");
        this.sideRedText.visible = false;
        this.sideRedText.addTo(this.game);

        // Setup display for side text
        this.evaluationText = new paper.PointText(new paper.Point(530, 181));
        this.evaluationText.justification = "center";
        this.evaluationText.fontSize = 16;
        this.evaluationText.fillColor = new paper.Color("white");
        this.evaluationText.visible = false;
        this.evaluationText.content = "OPENING";
        this.evaluationText.addTo(this.game);



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

        var rec6 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(100, 30));
        this.evaluationMid = new paper.Path.Rectangle(rec6);
        this.evaluationMid.fillColor = new paper.Color(this.colorDark);
        this.evaluationMid.strokeColor = new paper.Color(this.colorGray);
        this.evaluationMid.strokeWidth = 3;
        this.evaluationMid.position.x = 530;
        this.evaluationMid.position.y = 175;
        this.evaluationMid.addTo(this.game!);
        this.evaluationMid.sendToBack();
        this.evaluationMid.visible = false;

        var rec4 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(20, 0));
        this.evaluationBar = new paper.Path.Rectangle(rec4);
        this.evaluationBar.visible = false;

        var rec5 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(145, 360));
        this.sideBack = new paper.Path.Rectangle(rec5);
        this.sideBack.fillColor = new paper.Color(this.colorDark);
        this.sideBack.strokeColor = new paper.Color(this.colorGray);
        this.sideBack.strokeWidth = 5;
        this.sideBack.position.x = 525;
        this.sideBack.position.y = 175;
        this.sideBack.addTo(this.game!);
        this.sideBack.sendToBack();
        this.sideBack.visible = false;


        var rec7 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(300, 270));
        this.consoleBack = new paper.Path.Rectangle(rec7);
        this.consoleBack.fillColor = new paper.Color(this.colorDark);
        this.consoleBack.strokeColor = new paper.Color(this.colorGray);
        this.consoleBack.strokeWidth = 5;
        this.consoleBack.position.x = -188;
        this.consoleBack.position.y = 150;
        this.consoleBack.addTo(this.game!);
        this.consoleBack.sendToBack();
        this.consoleBack.visible = false;


        var rec9 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(440, 80));
        this.titleBack = new paper.Path.Rectangle(rec9);
        this.titleBack.fillColor = new paper.Color(this.colorDark);
        this.titleBack.strokeColor = new paper.Color(this.colorGray);
        this.titleBack.strokeWidth = 5;
        this.titleBack.position.x = 200;
        this.titleBack.position.y = -90;
        this.titleBack.addTo(this.game!);
        this.titleBack.sendToBack();
        this.titleBack.visible = true;

        var rec11 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(440, 80));
        this.helpBack = new paper.Path.Rectangle(rec11);
        this.helpBack.fillColor = new paper.Color(this.colorDark);
        this.helpBack.strokeColor = new paper.Color(this.colorGray);
        this.helpBack.strokeWidth = 5;
        this.helpBack.position.x = 200;
        this.helpBack.position.y = 430;
        this.helpBack.addTo(this.game!);
        this.helpBack.sendToBack();
        this.helpBack.visible = true;

        var rec13 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(440, 340));
        this.menuBack = new paper.Path.Rectangle(rec13);
        this.menuBack.fillColor = new paper.Color(this.colorDark);
        this.menuBack.strokeColor = new paper.Color(this.colorGray);
        this.menuBack.strokeWidth = 5;
        this.menuBack.position.x = 200;
        this.menuBack.position.y = 175;
        this.menuBack.addTo(this.game!);
        this.menuBack.sendToBack();
        this.menuBack.visible = true;

        var rec14 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(10, 250));
        this.menuBar = new paper.Path.Rectangle(rec14);
        this.menuBar.fillColor = new paper.Color(this.colorDark);
        this.menuBar.strokeColor = new paper.Color(this.colorGray);
        this.menuBar.strokeWidth = 3;
        this.menuBar.position.x = -205;
        this.menuBar.position.y = 175;
        this.menuBar.addTo(this.game!);
        this.menuBar.sendToBack();
        this.menuBar.visible = true;
        
        this.slider = new paper.Path.Circle(new paper.Point(-150, 175), 15);
        this.slider.fillColor = new paper.Color('#ffffff');
        this.slider.strokeColor = new paper.Color('#bbbbbb');
        this.slider.strokeWidth = 3;
        this.slider.position.x = -205;
        this.slider.position.y = 175;
        this.slider.addTo(this.game!);
        this.slider.visible = true;
        
        var rec15 = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(250, 400));
        this.sliderBack = new paper.Path.Rectangle(rec15);
        this.sliderBack.fillColor = new paper.Color(this.colorDark);
        this.sliderBack.strokeColor = new paper.Color(this.colorGray);
        this.sliderBack.strokeWidth = 5;
        this.sliderBack.position.x = -205;
        this.sliderBack.position.y = 175;
        this.sliderBack.addTo(this.game!);
        this.sliderBack.sendToBack();
        this.sliderBack.visible = true;
        
        

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

                if (this.thinkReady) {
                    this.moveHighlight!.visible = false;
                    this.thinkReady = false;
                    this.think();
                }

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
                            if (!this.isPlayerTurn && !this.gameOver) {
                                this.moveHighlight!.visible = false;
                                this.thinkReady = true;
                            }

                            // pvp evaluation
                            if (!this.gameOver && this.gameType == 2) {
                                this.updateEvalutationBar(0);
                            }
                        } 
                    }
                }
    
            }
        
        // Account for time lost from think() and barThink() algorithms
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

            // Menu functionality
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

            // Slider functionality
            if (this.isHoldingSlider) {
                if (y < 219) {
                    this.slider!.position.y = 59;
                } else if (y >= 219 && y < 279) {
                    this.slider!.position.y = 117;
                } else if (y >= 279 && y < 337) {
                    this.slider!.position.y = 175;
                } else if (y >= 337 && y < 397) {
                    this.slider!.position.y = 233;
                } else if (y >= 397) {
                    this.slider!.position.y = 291;
                }
            }


        } else if (this.gameReady && !this.coolDown && !this.gameOver) {
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
        
        if (!this.coolDown && !this.gameOver) {
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

            if (!this.isHoldingSlider && Math.abs(189 - x) < 20 && Math.abs(this.slider!.position.y + 133 - y) < 20) {
                this.isHoldingSlider = true;
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

    private onMouseUp(event: paper.MouseEvent) : void
    {
        var mouseVector = event.point.subtract(paper.view.center);

        var x = event.point.x + this.GAME_SHIFT_X;
        var y = event.point.y + this.GAME_SHIFT_Y;

        if (!this.gameReady) {

            // Slider functionality
            if (this.isHoldingSlider) {
                this.isHoldingSlider = false;
                if (y < 219) {
                    this.slider!.position.y = 59;
                    this.difficulty = 0;
                } else if (y >= 219 && y < 279) {
                    this.slider!.position.y = 117;
                    this.difficulty = 1;
                } else if (y >= 279 && y < 337) {
                    this.slider!.position.y = 175;
                    this.difficulty = 2;
                } else if (y >= 337 && y < 397) {
                    this.slider!.position.y = 233;
                    this.difficulty = 3;
                } else if (y >= 397) {
                    this.slider!.position.y = 291;
                    this.difficulty = 4;
                }
            }
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

        this.helpText!.fontSize = 40;
        this.helpText!.position.y = 430;

        
        
        this.menuRedText!.visible = false;
        this.menuWhiteText!.visible = false;
        this.menuYellowText!.visible = false;
        this.menuHighlight!.visible = false;
        this.menuBack!.visible = false;
        this.menuBar1Text!.visible = false;
        this.menuBar2Text!.visible = false;
        this.menuBar3Text!.visible = false;
        this.menuBar4Text!.visible = false;
        this.menuBar5Text!.visible = false;
        this.menuBarTitleText!.visible = false;
        this.menuBar!.visible = false;
        this.slider!.visible = false;
        this.sliderBack!.visible = false;

        this.sideRedText!.visible = true;
        this.sideYellowText!.visible = true;
        this.evaluationText!.visible = true;
        this.evaluationBack!.visible = true;
        this.evaluationMid!.visible = true;
        this.evaluationYellow!.visible = true;
        this.evaluationRed!.visible = true;
        this.sideBack!.visible = true;
        
        this.winText!.fontSize = 40;
        this.winText!.shadowBlur = 25;
        this.winText!.position.y = -90;

        if (type < 2) {
            

            if (this.difficulty == 0) {
                
                this.winText!.content = "Difficulty: Beginner";
                this.winText!.fillColor = new paper.Color('#32cd32');
            } else if (this.difficulty == 1) {
                this.winText!.content = "Difficulty: Easy";
                this.winText!.fillColor = new paper.Color('#2ab258');
            } else if (this.difficulty == 2) {
                this.winText!.content = "Difficulty: Medium";
                this.winText!.fillColor = new paper.Color('#22967f');
            } else if (this.difficulty == 3) {
                this.winText!.content = "Difficulty: Hard";
                this.winText!.fillColor = new paper.Color('#1a7ba6');
            } else if (this.difficulty == 4) {
                this.winText!.content = "Difficulty: Expert";
                this.winText!.fillColor = new paper.Color('#1260cc');
            }
        } else {
            if (this.difficulty == 0) {
                this.winText!.content = "Bar Depth: Minimum";
                this.winText!.fillColor = new paper.Color('#32cd32');
            } else if (this.difficulty == 1) {
                this.winText!.content = "Bar Depth: Low";
                this.winText!.fillColor = new paper.Color('#2ab258');
            } else if (this.difficulty == 2) {
                this.winText!.content = "Bar Depth: Medium";
                this.winText!.fillColor = new paper.Color('#22967f');
            } else if (this.difficulty == 3) {
                this.winText!.content = "Bar Depth: High";
                this.winText!.fillColor = new paper.Color('#1a7ba6');
            } else if (this.difficulty == 4) {
                this.winText!.content = "Bar Depth: Maximum";
                this.winText!.fillColor = new paper.Color('#1260cc');
            }

            this.eval1Text!.visible = true;
            this.eval2Text!.visible = true;
            this.eval3Text!.visible = true;
            this.eval4Text!.visible = true;
            this.eval5Text!.visible = true;
            this.eval6Text!.visible = true;
            this.eval7Text!.visible = true;

            var myString = "";
            myString += "MOVE EVALUATIONS" + "\n";
            myString += "+------+------+--------------+" + "\n";
            myString += "| move | best |  evaluation  |" + "\n";
            myString += "+------+------+--------------+" + "\n";
            for (var i = 0; i < 7; i++) {
                myString += "|      |      |              |" + "\n";
            }
            myString += "+------+------+--------------+"

            this.consoleText!.content = myString;
        }

        this.consoleText!.visible = true;
        this.consoleBack!.visible = true;

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
        this.prevMove = col;

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
        this.winText!.fontSize = 64;
        this.winText!.position.y = -88;
        if (color == 1) {
            this.winText!.content = "Red wins!";
            this.winText!.fillColor = new paper.Color("red");
        } else {
            this.winText!.content = "Yellow wins!";
            this.winText!.fillColor = new paper.Color("yellow");
        }
        this.winText!.bringToFront();
        this.winText!.visible = true;

        this.helpText!.fontSize = 24;
        this.helpText!.position.y = 429;
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
        if (this.countLegalMoves() == 0) {
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
        this.updateEvalutationBar(moves[bestMove]);
        var myString = "";
        if (this.FIRST_MOVE) {
            this.FIRST_MOVE = false;
            myString += "OPENING" + "\n";
        } else {
            if (this.turnNum <= 3) {
                this.consoleText!.position.y = 152;
            }
            
            myString += "DEPTH: " + this.DEPTH + "\n";
            if (this.searchedLeafNodes > 1) {
                myString += "ANALYZED: " + this.searchedLeafNodes + " positions\n";
            } else {
                myString += "ANALYZED: " + this.searchedLeafNodes + " position\n";
            }
            
            //myString += "POSITIONS ANALYZED: " + this.searchedLeafNodes + "\n";
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
	}

    private updateEvalutationBar(bestMove : number) : void
    {

        // Update DEPTH if pvp
        if (this.gameType == 2) {
            this.updateDEPTH();
        }

        // An accurate evaluation comes when turnNum and DEPTH are both even-even or odd-odd
        // When they are different, a new evaluation is needed with depth decreased by 1
        var depth = this.DEPTH;

        // Update depth and rethink if necessary
        if (this.turnNum % 2 != depth % 2) {
            depth--;
            bestMove = this.barThink(depth);
        
        // If not pvp, then just use bestMove from think
        } else if (this.gameType == 2) {
            bestMove = this.barThink(depth);
        }

        if (this.turnNum > 2 || (this.turnNum >= 2 && this.gameType < 2)) {
            this.evaluationText!.content = "DEPTH: " + depth;
        }
        

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
        
        this.evaluationBar.visible = true;

        if (this.gameType == 2) {
            this.eval7Text!.content = "\n" + this.eval6Text!.content;
            this.eval6Text!.content = "\n" + this.eval5Text!.content;
            this.eval5Text!.content = "\n" + this.eval4Text!.content;
            this.eval4Text!.content = "\n" + this.eval3Text!.content;
            this.eval3Text!.content = "\n" + this.eval2Text!.content;
            this.eval2Text!.content = "\n" + this.eval1Text!.content;

            this.eval7Text!.fillColor = this.eval6Text!.fillColor;
            this.eval6Text!.fillColor = this.eval5Text!.fillColor;
            this.eval5Text!.fillColor = this.eval4Text!.fillColor;
            this.eval4Text!.fillColor = this.eval3Text!.fillColor;
            this.eval3Text!.fillColor = this.eval2Text!.fillColor;
            this.eval2Text!.fillColor = this.eval1Text!.fillColor;
            this.eval1Text!.fillColor = this.eval3Text!.fillColor;

            this.eval7Text!.shadowColor = this.eval6Text!.shadowColor;
            this.eval6Text!.shadowColor = this.eval5Text!.shadowColor;
            this.eval5Text!.shadowColor = this.eval4Text!.shadowColor;
            this.eval4Text!.shadowColor = this.eval3Text!.shadowColor;
            this.eval3Text!.shadowColor = this.eval2Text!.shadowColor;
            this.eval2Text!.shadowColor = this.eval1Text!.shadowColor;

            this.eval1Text!.shadowBlur = 10;
            this.eval2Text!.shadowBlur = 10;
            this.eval3Text!.shadowBlur = 10;
            this.eval4Text!.shadowBlur = 10;
            this.eval5Text!.shadowBlur = 10;
            this.eval6Text!.shadowBlur = 10;
            this.eval7Text!.shadowBlur = 10;

            var strength = bestMove - this.prevEval;
            this.prevEval = bestMove;
            var evaluation = "";

            if (this.prevMove == this.prevBest) {
                evaluation = "Best move"
                this.eval1Text!.shadowColor = new paper.Color('green');
            } else if (strength > 0) {
                evaluation = "Brilliant!"
                this.eval1Text!.shadowColor = new paper.Color('blue');
            } else if (strength > -5) {
                evaluation = "Good move"
                this.eval1Text!.shadowColor = new paper.Color('lime');
            } else if (strength > -15) {
                evaluation = "Inaccuracy"
                this.eval1Text!.shadowColor = new paper.Color('yellow');
            } else if (strength > -30) {
                evaluation = "Mistake!"
                this.eval1Text!.shadowColor = new paper.Color('orange');
            } else {
                evaluation = "Blunder!!"
                this.eval1Text!.shadowColor = new paper.Color('red');
            }
            this.eval1Text!.content = "\n\n\n\n   " + this.prevMove + "      " + this.prevBest + "      " + evaluation;
        }
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

    // Update the depth of thinking based on predicted number of moves
	private updateDEPTH() : void {

        if (this.difficulty > 0) {
            var ones = this.countOnes();
            var twos = this.countTwos();
            var cols = this.countLegalMoves();
            this.DEPTH = Math.ceil(this.difficulty/4 * this.getDepth(cols, ones, twos));
        }
        this.searchedLeafNodes = 0;
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









    // Setup calls to minMaxSearch(), find best move and publish to gameBoard
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
        
		// Use pre-defined opening moves for first move
		if (this.FIRST_MOVE) {
            moves = this.openingMove();
        } else {

            //Update search depth based on projected searches
            this.updateDEPTH();

            for (var col = 0; col < moves.length; col++) {
			
                // Check if move is legal
                if (board[5][col] == 0) {
                    moves[col] = this.minMaxSearch(board, col, 1, this.DEPTH-1, -this.MAX_VALUE);
                } else {
                    moves[col] = -this.MAX_VALUE;
                }
            }
        }

		var bestMove = this.indexOfBestMove(moves);
		this.printHeuristics(moves, bestMove);
        this.elapsedTime = new Date().getTime() - startTime;

        // Play the best move. Will always be last line of think().
        this.addPiece(bestMove);
		
    }


    private minMaxSearch(board : Array<Array<number>>, col : number, color : number, depth : number, beta : number) : number {

		// Deep copy of board
        var newBoard = new Array<Array<number>>();
        for (var i = 0; i < board.length; i++) {
            newBoard[i] = board[i].slice();
        }

		// Add requested move to board
		newBoard = this.pretendAddPiece(newBoard, col, color);
		
		// Base case, return heuristic analysis of board
		if (depth <= 0) {
            this.searchedLeafNodes++;
			return this.heuristic(newBoard);
		}
		
		// Found a win, return win value
		if (this.heuristic(newBoard) == this.WIN_VALUE * color) {
			return this.WIN_VALUE * color;
		}
		
		// Strongest response, initially set to worst possible response
		var alpha = color * this.MAX_VALUE;
		
        // Iterate through all columns
        var noLegalMoves = true;
		for (col = 0; col < 7; col++) {
			
			// Check if move is legal
			if (newBoard[5][col] == 0) {
                noLegalMoves = false;

				if (color == 1) { // Minimizing player
					alpha = Math.min(alpha, this.minMaxSearch(newBoard, col, color * -1, depth-1, alpha));
                    if (alpha <= beta) { // alpha-beta pruning
                        return alpha;
                    }
                }

				else { // Maximizing player       
					alpha = Math.max(alpha, this.minMaxSearch(newBoard, col, color * -1, depth-1, alpha));
                    if (alpha >= beta) { // alpha-beta pruning
                        return alpha;
                    }
				}
			}
		}
		
		// No playable moves found, return 0 (draw)
		if (noLegalMoves) {
            this.searchedLeafNodes++;
			return 0;
		}
		
		// Return strongest response
		return alpha;
	}









    // Evaluates a given board based on algorithm listed below
    // - Divides board into all possible subsets of 4's (horizontally, vertically, diagonally up, diagonally down)
    // - Subsets that consist of only one color (+1 or -1) and empty spaces are worth one point per color in set
    // - Subsets with conflicting colors (both colors present in subset) are worth 0 points
    // - The lower the subsets highest empty space is, the more value the subset is worth
    // - Subsets with values of +/- 4 are worth MAX_VALUE (+/- 1000)
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





    // Executes the think() algorithm, but specifically for the evalutation bar
    private barThink(depth : number) : number
    {
        this.timer = 0;
        this.elapsedTime = 0;
        var startTime = new Date().getTime();

        var color = 1;
        // Manually set colors if pvp
        if (this.gameType == 2 && this.turnNum % 2 == 1) {
            color = -1;
        }

        var alpha = -color * this.MAX_VALUE;
        
        // If opening, get evaluation from opening data
		if (this.turnNum <= 2) {
            var moves = this.openingMove();
            for (var col = 0; col < 7; col++) {
                if (color == 1) {
                    alpha = Math.max(alpha, moves[col]);
                } else {
                    alpha = Math.min(alpha, moves[col]);
                }
                
            }   
            alpha = Math.abs(alpha);
            
		} else {
            var alpha = -color * this.MAX_VALUE;
            var prev = -color * this.MAX_VALUE;
            for (var col = 0; col < 7; col++) {
                // Check if move is legal
                if (this.gameBoard[5][col] == 0) {
                    if (color == 1) { // Maximizing player
                        alpha = Math.max(alpha, this.minMaxSearch(this.gameBoard, col, color, depth-1, alpha));
                        if (alpha > prev) {
                            this.prevBest = col;
                            prev = alpha;
                        }
                    }
    
                    else { // Minimizing player       
                        alpha = Math.min(alpha, this.minMaxSearch(this.gameBoard, col, color, depth-1, alpha));
                        if (alpha < prev) {
                            this.prevBest = col;
                            prev = alpha;
                        }
                    }
                }
            }
        }
        this.elapsedTime = new Date().getTime() - startTime;
		return alpha;
    }





    // Counts number of columns that are not full
    private countLegalMoves() : number {
        var legalMoves = 0;
        for (var col = 0; col < 7; col++) {
            if (this.gameBoard[5][col] == 0) {
                legalMoves++;
            }
        }
        return legalMoves;
    }

    // Counts number of columns with only one row open
    private countOnes() : number
    {
        var ones = 0;
        for (var col = 0; col < 7; col++) {
            if (this.gameBoard[5][col] == 0 && this.gameBoard[4][col] != 0) {
                ones++;
            }
        }
        return ones;
    }

    // Counts number of columns with only two rows open
    private countTwos() : number
    {
        var twos = 0;
        for (var col = 0; col < 7; col++) {
            if (this.gameBoard[5][col] == 0 && this.gameBoard[4][col] == 0 && this.gameBoard[3][col] == 0) {
                twos++;
            }
        }
        return twos;
    }

    // Use previous data collected to return a depth given:
    // # cols, # cols with only one row open, and # cols with only two rows open
    private getDepth(cols : number, ones : number, twos : number) : number
    {
        if (cols == 7) {
            var arr = [[7,7,7,8,8,9,11,7],[7,7,7,8,8,10,7],[7,7,8,8,9,8],[7,7,8,8,9],[7,7,8,9],[7,8,8],[7,8],[7]];
        } else if (cols == 6) {
            var arr = [[8,8,8,9,10,11,6],[8,8,8,9,12,7],[8,8,9,11,8],[8,8,9,9],[8,9,10],[8,10],[8]];
        } else if (cols == 5) {
            var arr = [[8,9,10,12,10,5],[8,9,10,11,6],[9,10,12,7],[9,11,8],[10,9],[10]];
        } else if (cols == 4) {
            var arr = [[10,11,14,9,4],[10,12,10,5],[11,11,6],[12,7],[8]];
        } else if (cols == 3) {
            var arr = [[12,13,8,3],[14,9,4],[10,5],[6]];
        } else if (cols == 2) {
            var arr = [[12,7,2],[8,3],[4]];
        } else {
            var arr = [[1,1],[1]];
        }
        return arr[twos][ones];
    }






    
}


    /* Testing function
    private myCountingFunc() : void
    {
        var cols = 1;
        var baseDepth = cols;
        for (var twos = 0; twos <= cols; twos++) {
            for (var ones = 0; ones <= cols-twos; ones++) {
                var depth = baseDepth;
                var curr = this.projectedSearches(cols, depth, ones, twos);
                var next = this.projectedSearches(cols, depth+1, ones, twos);
                while (next < this.MAX_SEARCHES && next > curr) {
                    depth++
                    curr = next;
                    next = this.projectedSearches(cols, depth+1, ones, twos);
                }
                console.log(twos, ones, '|', depth, '|', curr);
            }
            console.log('-');
        }
    }
    */

    /* testing function
    // Algorithm to set up calls to predict number of heuristic calls given game state and depth
    private projectedSearches(cols : number, depth : number, ones : number, twos : number) : number
    {
        /*
        // Copy gameboard into matrix of '1's
        var board = [[0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0]];
        
        
        // if 4 cols or less, do not take into account lowest wins
        if (this.countLegalMoves(this.gameBoard) > 4) {
            var arr = this.getLowestWins(this.gameBoard);
            for (var row = 0; row < 6; row++) {
                for (var col = 0; col < 7; col++) {
                    board[row][col] = Math.abs(this.gameBoard[row][col]);

                    // Set rows above a win in a col to '1's
                    // (since those branches wont be explored, block off searches)
                    if (row < 6 - arr[col]) {
                        board[row][col] = 1;
                    }
                }
            }
        }
        var _cols = 7;
        var _depth = 7;
        var _ones = 0;
        var _twos = 0;
        // cut off above

        var board = [[0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0]];


        for (var c = 0; c < 7-cols; c++) {
            for (var r = 0; r < 6; r++) {
                board[r][c] = 1;
            }
        }
        
        for (c; c < (7-cols)+ones; c++) {
            for (var r = 0; r < 5; r++) {
                board[r][c] = 1;
            }
        }

        for (c; c < (7-cols)+ones+twos; c++) {
            for (var r = 0; r < 4; r++) {
                board[r][c] = 1;
            }
        }
        

        // Board state represented, now call recursive counting algorithm.
        var count = 0;
        for (var col = 0; col < 7; col++) {
            count += this.countOutcomes(board, col, depth-1);
        }
        
        // To account for alpha-beta pruning, alter count by 7^(7-difficulty*2) 2: 7^3, 3: 7^1, 4: 7^-1 --> 1: 7^4 2: 7^3, 3: 7^1, 4: 7^0
        return count;// * Math.pow(7, 4/3 * (4 - this.difficulty));
    }
    */

    /* testing function
    private countOutcomes(board : Array<Array<number>>, col : number, depth : number) : number
    {
        if (depth <= 0) {
            return 1;
        }
        
        // Deep copy of board.
        var newBoard = new Array<Array<number>>();
        for (var i = 0; i < board.length; i++) {
            newBoard[i] = board[i].slice();
        }
        
        // Set top row of col to 1
        for (var row = 0; row < 6; row++) {
            if (newBoard[row][col] == 0) {
                newBoard[row][col] = 1;
                break;
            }
        }
        
        var total = 0;
        for (var col = 0; col < 7; col++) {
            // Check if move is legal
            if (newBoard[5][col] == 0) {
                total += this.countOutcomes(newBoard, col, depth-1);
            }
        }

        // No legal moves found, return 1 more checked position
        if (total == 0) {
            return 1;
        }
        return total;
    }
    */

    /* Useful function
    // Returns an arrays containing the lowest win on each col
    private getLowestWins(board : Array<Array<number>>) : Array<number>
    {
        var arr = [6,6,6,6,6,6,6];
		var setScore = 0; // Value of a set of 4
        var r = 0;
        var c = 0;
		// Horizontal sets
		for (var row = 0; row < board.length; row++) {
			for (var col = 0; col < 4; col++) {
				setScore = 0;
				for (var i = 0; i < 4; i++) {
                    setScore += board[row][col+i];
                    // Set empty row/col
                    if (board[row][col+i] == 0) {
						r = row;
                        c = col+i;
					}
				}
                // Update output to lower row
                if (Math.abs(setScore) == 3) {
                    arr[c] = Math.min(arr[c], r);
                }
			}
		}
		// Vertical sets
		for (var row = 0; row < 3; row++) {
			for (var col = 0; col < board[0].length; col++) {
				setScore = 0;
				for (var i = 0; i < 4; i++) {
                    setScore += board[row+i][col];
                    // Set empty row/col
                    if (board[row+i][col] == 0) {
						r = row+i;
                        c = col;
					}
				}
                // Update output to lower row
				if (Math.abs(setScore) == 3) {
                    arr[c] = Math.min(arr[c], r);
                }
			}
		}	
		// Diagonal up sets
		for (var row = 0; row < 3; row++) {
			for (var col = 0; col < 4; col++) {
				setScore = 0;
				for (var i = 0; i < 4; i++) {
                    setScore += board[row+i][col+i];
                    // Set empty row/col
                    if (board[row+i][col+i] == 0) {
						r = row+i;
                        c = col+i;
					}
				}
                // Update output to lower row
                if (Math.abs(setScore) == 3) {
                    arr[c] = Math.min(arr[c], r);
                }
			}
		}
		// Diagonal down sets
		for (var row = 3; row < board.length; row++) {
			for (var col = 0; col < 4; col++) {
				setScore = 0;
				for (var i = 0; i < 4; i++) {
                    setScore += board[row-i][col+i];
                    // Set empty row/col
                    if (board[row-i][col+i] == 0) {
                        r = row-i;
                        c = col+i;
                    }
				}
                // Update output to lower row
                if (Math.abs(setScore) == 3) {
                    arr[c] = Math.min(arr[c], r);
                }
			}
		}
        return arr;
    }
    */











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