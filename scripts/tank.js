function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        };
    }
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var elemUI = document.getElementById('ui');
var elemTank = document.getElementById('tank');

var game = {
    //canvas的大小（和html中的canvas保持一致）
    w: 538,
    h: 490,
    status: 0, //游戏阶段，0：开始动态画面  1：动态坦克  2：
    mode: 0 //游戏模式，0: 打怪      1：对战
};
var tankSize = {
    w: 32,
    h: 32
};
var tankPicsNPC = {
    'top': [9, 27],
    'bottom': [81, 99],
    'left': [117, 135],
    'right': [45, 63]
};
var tankPicsP1 = {
    'top': [1, 19],
    'bottom': [73, 91],
    'left': [109, 127],
    'right': [37, 55]
};
var tankPicsP2 = {
    'top': [5, 23],
    'bottom': [77, 95],
    'left': [41, 59],
    'right': [113, 131]
};
var calPic = function(num) {
    //根据坦克所在位置来计算像素开始的位置
    return (num - 1) * 32;
};
var gameMode = {
    0: "Crazy Kill Mode",
    1: "Fight Club Mode"
};
var boolTankAni = false; //让选择画面的坦克动起来
var tankList = [];
/**
 * 渲染画布，不同阶段对应不同画面
 * @param {Num} status {0,1,2}
 * @param {Num} y
 */
function drawCanvas(status, y) {
    ctx.save();
    switch (status) {
        case 0:
            //开始画面
            ctx.clearRect(0, 0, game.w, game.h);
            ctx.font = "22px Arial Black";
            ctx.fillStyle = "#fff";
            ctx.fillText("War of Tanks:", 57, y + 75);
            ctx.drawImage(elemUI, 0, 0, 376, 140, 57, y + 110, 376, 140);
            ctx.fillText("Crazy Kill", 190, y + 300);
            ctx.fillText("Fight Club", 190, y + 330);
            // ctx.fillText("CONSTRUCTION", 190, uiStart.y + 360);
            ctx.font = "15px Arial White";
            ctx.fillText("@Author-J.C", 300, y + 450);
            break;
        case 1:
            //添加动态坦克
            if (game.mode === 0) {
                ctx.clearRect(150, 305, 32, 32);
                if (boolTankAni) {
                    ctx.drawImage(elemTank, 1152, 0, 32, 32, 150, 275, 32, 32);
                    boolTankAni = false;
                } else {
                    ctx.drawImage(elemTank, 1728, 0, 32, 32, 150, 275, 32, 32);
                    boolTankAni = true;
                }
            } else if (game.mode === 1) {
                ctx.clearRect(150, 275, 32, 32);
                if (boolTankAni) {
                    ctx.drawImage(elemTank, 1152, 0, 32, 32, 150, 305, 32, 32);
                    boolTankAni = false;
                } else {
                    ctx.drawImage(elemTank, 1728, 0, 32, 32, 150, 305, 32, 32);
                    boolTankAni = true;
                }
            }
            break;
        case 2:
            //选中以后关闭所有画面
            if (pageCurtain.x < game.w / 2) {
                ctx.fillStyle = "grey";
                ctx.fillRect(0, 0, pageCurtain.x, game.h);
                ctx.fillRect(game.w - pageCurtain.x, 0, game.w, game.h);
                pageCurtain.x += 2;
            } else {
                ctx.clearRect(0, 0, game.w, game.h);
                pageCurtain.x = 0; //重设为0 一会儿为新的幕布
                game.status = 3;
            }
            break;
        case 3:
            //进入游戏画面（打开幕布）
            crazyKill(mode0Stage);
    }
}
var mode0Stage = 0;
var crazyKill = function(stage) {
    if (stage === 0) {
        if (pageCurtain.x < game.w / 2) {
            // ctx.clearRect(0, 0, game.w, game.h);
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, game.w, game.h);

            ctx.drawImage(elemTank, 0, 0, 32, 32, game.w / 2 - 16, game.h / 2 - 16, 32, 32); //中间是p1
            // ctx.drawImage(elemTank, calPic(tankPicsNPC.bottom[0]), 0, 32, 32, 0, 0, 32, 32); //左上角
            // ctx.drawImage(elemTank, calPic(tankPicsNPC.top[0]), 0, 32, 32, 0, game.h - 32, 32, 32); //左下角
            // ctx.drawImage(elemTank, calPic(tankPicsNPC.bottom[0]), 0, 32, 32, game.w - 32, 0, 32, 32); //右上角
            // ctx.drawImage(elemTank, calPic(tankPicsNPC.top[0]), 0, 32, 32, game.w - 32, game.h - 32, 32, 32); //右下角
            ctx.fillStyle = "grey";
            pageCurtain.x += 2;
            pageCurtain.y += 2;
            ctx.fillRect(0, 0, game.w, game.h / 2 - pageCurtain.y);
            ctx.fillRect(0, game.h / 2 + pageCurtain.y, game.w, game.h);
        } else {
            mode0Stage = 1;
        }
    }
    if (stage === 1) {
        //创建坦克对象
        var p1 = new Tank(game.w / 2 - 16, game.h / 2 - 16, "top", "P1");
        var tank = new Tank(0, 0, "bottom", "NPC");
        tankList.push(p1); //注意p1一定要第一个push进去
        tankList.push(tank);
        mode0Stage = 2;
    }
    if (stage === 2) {
        // tankList[0].move();
        for (var i = 0; i < tankList.length; i++) {
            var tempTank = tankList[i];
            if (tempTank.type === "NPC") {
                npcDirTimer +=1;
                if (npcDirTimer===200) {
                    npcDirTimer =0;
                    tempTank.dir = randomDir();
                    // console.log(tempTank.dir);
                }
            }
            if (tempTank.boolKeyDown) {
                ctx.clearRect(tempTank.oldX, tempTank.oldY, 32, 32);
                if (tempTank.boolAni) {
                    ctx.drawImage(elemTank, calPic(tempTank.pics[tempTank.dir][0]), 0, 32, 32, tempTank.curX, tempTank.curY, 32, 32);
                    tempTank.boolAni = false;
                } else {
                    ctx.drawImage(elemTank, calPic(tempTank.pics[tempTank.dir][1]), 0, 32, 32, tempTank.curX, tempTank.curY, 32, 32);
                    tempTank.boolAni = true;
                }
                tempTank.move();
            }
        }
    }
};
var npcDirTimer = 0;
function randomDir() {
    var num = Math.floor((Math.random() * 100) + 1);
    var dir;
    if (num <= 25) {
        dir = "top";
    } else if (num > 25 && num <= 50) {
        dir = "bottom";
    } else if (num > 50 && num <= 75) {
        dir = "left";
    } else {
        dir = "right";
    }
    return dir;
}
var npcBornTimer = 0;
function createNewNPC() {
    npcBornTimer += 1；
    if(npcBornTimer === 100) {
        var tempTank = randomTank();
        for (var i = 0; i < tankList.length; i++) {
            ////////////////////////////////////
            ///判断在此位置上有没有坦克在走；
        }
    }
}
function randomTank() {
    var num = Math.floor((Math.random() * 100) + 1);
    var tank;
    if (num <= 25) {
        tank = new Tank(0, 0, "bottom", "NPC");
    } else if (num > 25 && num <= 50) {
        tank = new Tank(0, game.h - 32, "top", "NPC");
    } else if (num > 50 && num <= 75) {
        tank = new Tank(game.w - 32, game.h - 32, "top", "NPC");
    } else {
        tank = new Tank(game.w - 32, 0, "bottom", "NPC");
    }
    return tank;
}
/**
 * 坦克
 * @return {[type]} [description]
 */
function Tank(x, y, dir, type) {
    // var status;
    this.oldX = x;
    this.oldY = y;
    this.curX = x; //当前位置
    this.curY = y;
    this.dir = "top";
    this.type = type;
    this.boolKeyDown = this.type === "NPC" ? true : false; //判断方向是否按下

    this.speed = type !== "NPC" ? 2 : 1;
    this.pics = (function() {
        if (type === "NPC") return tankPicsNPC;
        if (type === "P1") return tankPicsP1;
        if (type === "P2") return tankPicsP2;
    })();
    this.boolAni = false;
    this.delay = 10;
    this.moveDist = 2;
}
Tank.prototype.fire = function() {
    // body...
};
// Tank.prototype.blocked = function(dir) {
//     var newX = this.curX;
//     var newY = this.curY;
//     if (dir === "left") {
//         newX += this.moveDist;
//     } else if (dir === "right") {
//         newX -= this.moveDist;
//     } else if (dir === "top") {
//         newY -= this.moveDist;
//     } else if (dir === "bottom") {
//         newY += this.moveDist;
//     }
//     for (var i = 0; i < tankList.length; i++) {
//         var obj = tankList[i];
//         var meet = overlap(newX, newY, obj.curX, obj.curY);
//     }
// };

function beBlocked(x, y) {
    //检查某个坦克是否将要被阻挡
    var b = [];
    for (var i = 0; i < tankList.length; i++) {
        if (overlap(x, y, tankList[i].curX, tankList[i].curY)) {
            b.push(true);
        }
    }
    if (b.length >= 2 || x < 0 || y < 0 || x + 32 > game.w || y + 32 > game.h) {
        return true;
    }
    return false;
}

function overlap(x1, y1, x2, y2) {
    if (x1 >= x2 && x1 <= x2 + 32 && y1 >= y2 && y1 <= y2 + 32) {
        return true;
    } else if (x1 + 32 >= x2 && x1 + 32 <= x2 + 32 && y1 >= y2 && y1 <= y2 + 32) {
        return true;
    } else if (x1 >= x2 && x1 <= x2 + 32 && y1 + 32 >= y2 && y1 + 32 <= y2 + 32) {
        return true;
    } else if (x1 + 32 >= x2 && x1 + 32 <= x2 + 32 && y1 + 32 >= y2 && y1 + 32 <= y2 + 32) {
        return true;
    }
    return false;
}
Tank.prototype.move = function() {
    var tempX = this.curX;
    var tempY = this.curY;
    if (this.boolKeyDown) {
        //移动坦克
        this.oldX = this.curX;
        this.oldY = this.curY;
        if (this.delay >= 100) {
            this.delay = 0;
            // ctx.clearRect(this.curX, this.curY, 32, 32);
            if (this.dir === "left") {
                tempX -= this.moveDist;
            } else if (this.dir === "right") {
                tempX += this.moveDist;
            } else if (this.dir === "top") {
                tempY -= this.moveDist;
            } else if (this.dir === "bottom") {
                tempY += this.moveDist;
            }
            if (!beBlocked(tempX, tempY)) {
                this.curX = tempX;
                this.curY = tempY;
            }
        } else {
            this.delay += this.speed * 100;
        }
    }
};

var pageStart = {
    y: 488
};
var pageCurtain = {
    x: 0,
    y: 0
};
var bindKeys = function() {
    window.onkeydown = function(e) {
        var keynum = window.event ? e.keyCode : e.which;
        if (game.status === 0) {
            if (keynum === 13) {
                pageStart.y = 0;
            }
        }
        if (game.status === 1) {
            //动态坦克准备好以后
            if (keynum === 83 || keynum === 40) {
                game.mode = 1;
            } else if (keynum === 87 || keynum === 38) {
                game.mode = 0;
            } else if (keynum === 13) {
                game.status = 2;
            }
        } else if (game.status === 3) {
            //进入游戏后
            if (mode0Stage === 2) {
                if (keynum === 83) {
                    tankList[0].boolKeyDown = true;
                    tankList[0].dir = "bottom";
                } else if (keynum === 87) {
                    tankList[0].boolKeyDown = true;
                    tankList[0].dir = "top";
                } else if (keynum === 65) {
                    tankList[0].boolKeyDown = true;
                    tankList[0].dir = "left";
                } else if (keynum === 68) {
                    tankList[0].boolKeyDown = true;
                    tankList[0].dir = "right";
                }
                // tankList[0].move();
            }
        }
    };
    window.onkeyup = function(e) {
        var keynum = window.event ? e.keyCode : e.which;
        if (game.status === 3) {
            if (mode0Stage === 2) {
                if (keynum === 83 || keynum === 87 || keynum === 65 || keynum === 68) {
                    tankList[0].boolKeyDown = false;
                }
            }
        }
    }
};
// var startTank; //开始界面选择游戏模式的坦克
var setInt = window.setInterval(function() {
    if (game.status === 0) {
        if (pageStart.y >= 0) {
            drawCanvas(game.status, pageStart.y);
            pageStart.y -= 2;
        } else {
            game.status = 1;
        }
    } else if (game.status === 1) {
        drawCanvas(game.status, pageStart.y);
        // window.clearInterval(setInt);
    } else if (game.status === 2) {
        drawCanvas(game.status, 0);
    } else if (game.status === 3) {
        drawCanvas(game.status, 0);
    }
}, 10);

addLoadEvent(setInt);
addLoadEvent(bindKeys);
// window.onload = setInt;
