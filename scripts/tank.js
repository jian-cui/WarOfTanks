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
    'left': [45, 63],
    'right': [117, 135]
};
var tankPicsP1 = {
    'top': [1, 19],
    'bottom': [73, 91],
    'left': [37, 55],
    'right': [109, 127]
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
                console.log("0");
                ctx.clearRect(150, 305, 32, 32);
                if (boolTankAni) {
                    ctx.drawImage(elemTank, 1152, 0, 32, 32, 150, 275, 32, 32);
                    boolTankAni = false;
                } else {
                    ctx.drawImage(elemTank, 1728, 0, 32, 32, 150, 275, 32, 32);
                    boolTankAni = true;
                }
            } else if (game.mode === 1) {
                console.log(1);
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
            console.log("status2");
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
            console.log("status3");
            // if (game.mode === 0) {
            //     if (pageCurtain.x < game.w / 2) {
            //         // ctx.clearRect(0, 0, game.w, game.h);
            //         ctx.fillStyle = "#000";
            //         ctx.fillRect(0, 0, game.w, game.h);

            //         ctx.drawImage(elemTank, 0, 0, 32, 32, game.w / 2 - 16, game.h / 2 - 16, 32, 32); //中间是p1
            //         ctx.drawImage(elemTank, calPic(tankPicsNPC.bottom[0]), 0, 32, 32, 0, 0, 32, 32); //左上角
            //         ctx.drawImage(elemTank, calPic(tankPicsNPC.top[0]), 0, 32, 32, 0, game.h - 32, 32, 32); //左下角
            //         ctx.drawImage(elemTank, calPic(tankPicsNPC.bottom[0]), 0, 32, 32, game.w - 32, 0, 32, 32); //右上角
            //         ctx.drawImage(elemTank, calPic(tankPicsNPC.top[0]), 0, 32, 32, game.w - 32, game.h - 32, 32, 32); //右下角
            //         ctx.fillStyle = "grey";
            //         pageCurtain.x += 2;
            //         pageCurtain.y += 2;
            //         ctx.fillRect(0, 0, game.w, game.h / 2 - pageCurtain.y);
            //         ctx.fillRect(0, game.h / 2 + pageCurtain.y, game.w, game.h);
            //     } else {
            //         //创建坦克对象 让坦克开始动起来
            //         var p1 = new Tank(game.w / 2 - 16, game.h / 2 - 16, "top", "P1");
            //         tankList.push(p1);
            //     }
            // } else if (game.mode === 1) {

            // }
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
            ctx.drawImage(elemTank, calPic(tankPicsNPC.bottom[0]), 0, 32, 32, 0, 0, 32, 32); //左上角
            ctx.drawImage(elemTank, calPic(tankPicsNPC.top[0]), 0, 32, 32, 0, game.h - 32, 32, 32); //左下角
            ctx.drawImage(elemTank, calPic(tankPicsNPC.bottom[0]), 0, 32, 32, game.w - 32, 0, 32, 32); //右上角
            ctx.drawImage(elemTank, calPic(tankPicsNPC.top[0]), 0, 32, 32, game.w - 32, game.h - 32, 32, 32); //右下角
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
        //创建坦克对象 让坦克开始动起来
        var p1 = new Tank(game.w / 2 - 16, game.h / 2 - 16, "top", "P1");
        tankList.push(p1);
        mode0Stage = 2;
    }
    if (stage === 2) {
        // tankList[0].move();
        for (var i = 0; i < tankList.length; i++) {
            var tempTank = tankList[i];
            ctx.clearRect(tempTank.oldX, tempTank.oldY, 32, 32);
            if (this.boolAni) {
                ctx.drawImage(elemTank, calPic(tempTank.pics[tempTank.dir][0]), 0, 32, 32, tempTank.curX, tempTank.curY, 32, 32);
                tempTank.boolAni = false;
            } else {
                ctx.drawImage(elemTank, calPic(tempTank.pics[tempTank.dir][1]), 0, 32, 32, tempTank.curX, tempTank.curY, 32, 32);
                tempTank.boolAni = true;
            }
        }
    }
}

/**
 * 坦克
 * @return {[type]} [description]
 */
function Tank(x, y, dir, type) {
    // var status;
    this.oldX;
    this.oldY;
    this.curX = x; //当前位置
    this.curY = y;
    this.dir = dir;
    // var picLocX1 = x1;
    // var picLocY1 = y1;
    // var picLocX2 = x2;
    // var picLocY2 = y2;
    // var ani = false;
    this.speed = type !== "NPC" ? 2 : 1;
    this.pics = (function() {
        if (type === "NPC") return tankPicsNPC;
        if (type === "P1") return tankPicsP1;
        if (type === "P2") return tankPicsP2;
    })();
    this.boolAni = false;
    this.delay = 10;
    this.moveDist = 8;
    // this.tireMove = setInterval(function() {
    //     if (ani) {
    //         console.log(this.curX);
    //         ctx.drawImage(elemTank, picLocX1, picLocY1, 32, 32, this.curX, this.curY, 32, 32);
    //         ani = false;
    //     } else {
    //         ctx.drawImage(elemTank, picLocX2, picLocY2, 32, 32, this.curX, this.curY, 32, 32);
    //         ani = true;
    //     }
    // }, 100);
    // //让坦克动起来
    // // setInterval(tireMove, 100);
    // this.setCurX = function(x) {
    //     curX = x;
    // };
    // this.getCurX = function() {
    //     return curX;
    // };
    // this.setCurY = function(y) {
    //     curY = y;
    // };
    // this.getCurY = function() {
    //     return curY;
    // };
}
Tank.prototype.fire = function() {
    // body...
};
Tank.prototype.blocked = function(dir) {
    var newX = this.curX;
    var newY = this.curY;
    if (dir === "left") {
        newX += this.moveDist;
    } else if (dir === "right") {
        newX -= this.moveDist;
    } else if (dir === "top") {
        newY -= this.moveDist;
    } else if (dir === "bottom") {
        newY += this.moveDist;
    }
    for (var i = 0; i < tankList.length; i++) {
        var obj = tankList[i];
        var meet = overlap(newX, newY, obj.curX, obj.curY);
    }
};


function overlap(x1, y1, x2, y2) {
    if (x2 < x1 && x1 < x2 + 32 && y2 < y1 && y1 < y2 + 32) {
        return true;
    } else if (x2 < x1 + 32 && x1 + 32 < x2 + 32 && y2 < y1 && y1 < y2 + 32) {
        return true;
    } else if (x2 < x1 && x1 < x2 + 32 && y2 < y1 + 32 && y1 + 32 < y2 + 32) {
        return true;
    } else if (x2 < x1 + 32 && x1 + 32 < x2 + 32 && y2 < y1 + 32 && y1 + 32 < y2 + 32) {
        return true;
    }
    return false;
}
Tank.prototype.move = function() {
    // //让坦克有动画效果
    // ctx.clearRect(this.curX, this.curY, 32, 32);
    // if (this.boolAni) {
    //     ctx.drawImage(elemTank, calPic(this.pics[this.dir][0]), 0, 32, 32, this.curX, this.curY, 32, 32);
    //     this.boolAni = false;
    // } else {
    //     ctx.drawImage(elemTank, calPic(this.pics[this.dir][1]), 0, 32, 32, this.curX, this.curY, 32, 32);
    //     this.boolAni = true;
    // }
    //移动坦克
    console.log("run move");
    this.oldX = this.curX;
    this.oldY = this.curY;
    if (this.delay >= 100) {
        this.delay = 0;
        ctx.clearRect(this.curX, this.curY, 32, 32);
        if (this.dir === "left") {
            this.curX -= this.moveDist;
            // ctx.drawImage(elemTank, calPic(this.pics[this.dir][0]), 0, 32, 32, this.curX, this.curY, 32, 32);
        } else if (this.dir === "right") {
            this.curX += this.moveDist;
        } else if (this.dir === "top") {
            this.curY -= this.moveDist;
        } else if (this.dir === "bottom") {
            this.curY += this.moveDist;
        }

        // ctx.drawImage(elemTank, this.pic);
    } else {
        this.delay += this.speed * 100;

    }
    // ctx.clearRect(this.curX, this.curY, 32, 32);
    // if (dir === "left") {
    //     ctx.drawImage()
    // }
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
        console.log(keynum);
        if (game.status === 0) {
            if (keynum === 13) {
                pageStart.y = 0;
            }
        }
        if (game.status === 1) {
            //动态坦克准备好以后
            // console.log(keynum);
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
                    tankList[0].dir = "bottom";
                } else if (keynum === 87) {
                    tankList[0].dir = "top";
                } else if (keynum === 65) {
                    tankList[0].dir = "left";
                } else if (keynum === 68) {
                    tankList[0].dir = "right";
                }
                tankList[0].move();
            }
        }
    };
};
// var startTank; //开始界面选择游戏模式的坦克
var setInt = window.setInterval(function() {
    if (game.status === 0) {
        if (pageStart.y >= 0) {
            drawCanvas(game.status, pageStart.y);
            pageStart.y -= 2;
        } else {
            // if (startTank === undefined) {
            //     // console.log("start tank");
            //     startTank = new Tank(150, 275, 1152, 0, 1728, 0);
            // }
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
