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
var elemMisc = document.getElementById('misc');
var elemBoom = document.getElementById('boom');
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
var bombSize = {
    w: 64,
    h: 64
};
var dirList = ["top", "bottom", "left", "right"];
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
    'left': [113, 131],
    'right': [41, 59]
};
var bulletPics = {
    'top': [0, 0],
    'right': [8, 0],
    'bottom': [16, 0],
    'left': [24, 0]
};
var bulletSize = {
    w: 8,
    h: 8
};
var boomSize = {
    w: 64,
    h: 64
};
var pageStart = {
    y: 488
};
var pageCurtain = {
    x: 0,
    y: 0
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
var bulletList = [];
var bombList = [];

var npcDirTimer = 0;
var npcBornTimer = 0;
var tankLicense = 0; //新产生一个坦克就+1

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
            if (game.mode === 0) crazyKill(mode0Stage);
            if (game.mode === 1) fightClub(mode1Stage);

    }
}
var mode1Stage = 0;
var mode1StageStop = 3;
var fightClub = function(stage) {
    if (stage === 0) {
        if (pageCurtain.x < game.w / 2) {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, game.w, game.h);
            ctx.drawImage(elemTank, (tankPicsP1["right"][0]-1)*tankSize.w, 0, tankSize.w, tankSize.h, 0, (game.h - tankSize.h) / 2, tankSize.w, tankSize.h);
            ctx.drawImage(elemTank, (tankPicsP2["left"][0]-1)*tankSize.w, 0, tankSize.w, tankSize.h, game.w - tankSize.w, (game.h - tankSize.h) / 2, tankSize.w, tankSize.h);
            ctx.fillStyle = "grey";
            pageCurtain.x += 2;
            pageCurtain.y += 2;
            ctx.fillRect(0, 0, game.w, game.h / 2 - pageCurtain.y);
            ctx.fillRect(0, game.h / 2 + pageCurtain.y, game.w, game.h);
        } else {
            mode1Stage = 1;
        }
    }
    if (stage === 1) {
        var p1 = new Tank(0, (game.h - tankSize.h) / 2, "bottom", "P1");
        var p2 = new Tank(game.w - tankSize.w, (game.h - tankSize.h) / 2, "top", "P2");
        tankList.push(p1, p2);
        mode1Stage = 2;
    }
    if (stage === 2) {
        killBullet();
        for (var i = bulletList.length - 1; i >= 0; i--) {
            bulletList[i].fly();
            //如果子弹超出范围，从列表中消除
            if (bulletList[i].curX < 0 || bulletList[i].curX > game.w || bulletList[i].curY < 0 || bulletList[i].curY > game.h) {
                ctx.clearRect(bulletList[i].curX, bulletList[i].curY, bulletSize.w, bulletSize.h);
                bulletList.splice(i, 1);
            }
        }
        killTank();
        for (var i = bombList.length - 1; i >= 0; i--) {
            bombList[i].showExplode();
            if (bombList[i].times < 0) {
                bombList.splice(i, 1);
            }
        }
        for (var i = 0; i < tankList.length; i++) {
            if (i === 0) {
                if (tankList.length < 2) {
                    mode1StageStop -= 1;
                    if (mode1StageStop === 0) {
                        clearInterval(setInt);
                    }
                }
            }
            var tempTank = tankList[i];
            //随机选择NPC的方向
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
var mode0Stage = 0;
var mode0StageStop = 3;
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
        //随机出现新NPC
        createNewNPC(20);
        killBullet();
        //检查子弹，并且让子弹移动
        for (var i = bulletList.length - 1; i >= 0; i--) {
            bulletList[i].fly();
            //如果子弹超出范围，从列表中消除
            if (bulletList[i].curX < 0 || bulletList[i].curX > game.w || bulletList[i].curY < 0 || bulletList[i].curY > game.h) {
                ctx.clearRect(bulletList[i].curX, bulletList[i].curY, bulletSize.w, bulletSize.h);
                bulletList.splice(i, 1);
            }
        }
        //检查子弹是否撞上坦克
        killTank();
        for (var i = bombList.length - 1; i >= 0; i--) {
            bombList[i].showExplode();
            if (bombList[i].times < 0) {
                bombList.splice(i, 1);
            }
        }
        for (var i = 0; i < tankList.length; i++) {
            if (i === 0) {
                if (tankList[0].type != "P1") {
                    mode0StageStop -= 1;
                    if (mode0StageStop === 0) {
                        clearInterval(setInt);
                    }
                }
            }
            var tempTank = tankList[i];
            //随机选择NPC的方向
            if (tempTank.type === "NPC") {
                npcDirTimer += 1;
                if (npcDirTimer === 200) {
                    npcDirTimer = 0;
                    tempTank.dir = randomDir();
                }
                tempTank.fire();
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

function createNewNPC(maxNum) {
    if (tankList.length <= maxNum) {
        npcBornTimer += 1;
        if (npcBornTimer === 1000) {
            npcBornTimer = 0;
            var tempTank = randomTank();
            for (var i = 0; i < tankList.length; i++) {
                ////////////////////////////////////
                ///判断在此位置上有没有坦克在走；
                // console.log(tankList.length);
                if (overlap(tempTank.curX, tempTank.curY, 32, tankList[i].curX, tankList[i].curY, 32)) {
                    tempTank = null;
                    break;
                } else {
                    tankList.push(tempTank);
                    break;
                }
            }
        }
    }
}

function randomTank() {
    var num = Math.floor((Math.random() * 100) + 1);
    var tempTank;
    if (num <= 25) {
        tempTank = new Tank(0, 0, "bottom", "NPC");
    } else if (num > 25 && num <= 50) {
        tempTank = new Tank(0, game.h - 32, "top", "NPC");
    } else if (num > 50 && num <= 75) {
        tempTank = new Tank(game.w - 32, game.h - 32, "top", "NPC");
    } else {
        tempTank = new Tank(game.w - 32, 0, "bottom", "NPC");
    }
    return tempTank;
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
    this.type = type; //坦克的类型 P1, P2 , NPC
    this.boolKeyDown = this.type === "NPC" ? true : false; //判断方向是否按下
    this.license = tankLicense; //用来识别每一个坦克
    tankLicense += 1; //每创建一个坦克，license加1
    this.speed = type === "NPC" ? 0.5 : 1;
    this.fireInterval = 1000; //发射的间隔
    this.lastFiredTime = 0; //上一次射击的时间
    this.pics = (function() {
        if (type === "NPC") return tankPicsNPC;
        if (type === "P1") return tankPicsP1;
        if (type === "P2") return tankPicsP2;
    })();
    this.boolAni = false;
    this.delay = 10;
    this.moveDist = 1;
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
            if (!beBlocked(this.license, tempX, tempY)) {
                this.curX = tempX;
                this.curY = tempY;
            } else {
                if (this.type === "NPC") {
                    for (var i = 0; i < this.dir == dirList.length; i++) {
                        if (this.dir == dirList[i]) {
                            if (i == 3) {
                                this.dir = dirList[0];
                            } else {
                                this.dir = dirList[i + 1];
                            }
                            break;
                        }
                    }
                }
            }
        } else {
            this.delay += this.speed * 100;
        }
    }
};
Tank.prototype.fire = function() {
    var t = Date.now();
    if (t - this.lastFiredTime >= this.fireInterval) {
        this.lastFiredTime = t;
        var bulletStartLoc = calBulletLocBasedOnTank(this.dir, this.curX, this.curY);
        bulletList.push(new Bullet(this.license, this.dir, this.type, bulletStartLoc[0], bulletStartLoc[1]));
    }
};

function calBulletLocBasedOnTank(dir, tankX, tankY) {
    var x, y;
    if (dir === "top") {
        x = tankX + (tankSize.w - bulletSize.w) / 2;
        y = tankY - bulletSize.h;
    } else if (dir === "bottom") {
        x = tankX + (tankSize.w - bulletSize.w) / 2;
        y = tankY + tankSize.h;
    } else if (dir === "right") {
        x = tankX + tankSize.w;
        y = tankY + (tankSize.h - bulletSize.h) / 2;
    } else if (dir === "left") {
        x = tankX - bulletSize.w;
        y = tankY + (tankSize.h - bulletSize.h) / 2;
    }
    return [x, y];
}

function Bullet(tankLicense, dir, type, x, y) {
    this.curX = x;
    this.curY = y;
    this.oldX = x;
    this.oldY = y;
    this.dir = dir;
    this.speed = 4;
    this.flyUnit = 2;
    this.type = type;
    this.pic = bulletPics[this.dir];
    this.tankLicense = tankLicense;
}
Bullet.prototype.fly = function() {
    var tempX = this.curX;
    var tempY = this.curY;
    this.oldX = this.curX;
    this.oldY = this.curY;
    if (this.dir === "top") {
        tempY -= this.flyUnit;
    } else if (this.dir === "bottom") {
        tempY += this.flyUnit;
    } else if (this.dir === "left") {
        tempX -= this.flyUnit;
    } else if (this.dir === "right") {
        tempX += this.flyUnit;
    }
    this.curX = tempX;
    this.curY = tempY;
    ctx.clearRect(this.oldX, this.oldY, bulletSize.w, bulletSize.h);
    ctx.drawImage(elemMisc, this.pic[0], this.pic[1], bulletSize.w, bulletSize.h, this.curX, this.curY, bulletSize.w, bulletSize.h);
};


function killTank() {
    for (var i = bulletList.length - 1; i >= 0; i--) {
        var curBullet = bulletList[i];
        for (var j = tankList.length - 1; j >= 0; j--) {
            var curTank = tankList[j];
            if (curBullet.tankLicense !== curTank.license) {
                if (curBullet.type != curTank.type) {
                    if (overlap(curBullet.curX, curBullet.curY, 8, curTank.curX, curTank.curY, 32)) {
                        bombList.push(new Bomb(curTank.curX + tankSize.w / 2, curTank.curY + tankSize.h / 2));
                        ctx.clearRect(curTank.curX, curTank.curY, 32, 32);
                        tankList.splice(j, 1);
                        ctx.clearRect(curBullet.curX, curBullet.curY, bulletSize.w, bulletSize.h);
                        bulletList.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
}

function killBullet() {
    var kill = []; //记录要消除的子弹索引
    var b1, b2;
    for (var i = 0; i < bulletList.length; i++) {
        if (i in kill) continue;
        b1 = bulletList[i];
        for (var j = 0; j < bulletList.length; j++) {
            if (j in kill) continue;
            b2 = bulletList[j];
            if (i === j || b1.type === b2.type) continue;
            if (overlap(b1.curX, b1.curY, 8, b2.curX, b2.curY, 8)) {
                kill.push(i, j);
            }
        }
    }
    kill.sort();
    // if (kill.length >0) console.log(kill);
    for (var k = kill.length - 1; k >= 0; k--) {
        ctx.clearRect(bulletList[kill[k]].curX, bulletList[kill[k]].curY, bulletSize.w, bulletSize.h);
        bulletList.splice(kill[k], 1);
    }
}

function Bomb(x, y) {
    this.times = 4; //存在几个回合
    this.x = x - boomSize.w / 2;
    this.y = y - boomSize.h / 2;
}
Bomb.prototype.showExplode = function() {
    ctx.clearRect(this.x, this.y, bombSize.w, bombSize.h);
    if (this.times === 4) {
        ctx.drawImage(elemBoom, 0, 0, bombSize.w, bombSize.h, this.x, this.y, bombSize.w, bombSize.h);
    } else if (this.times === 3) {
        ctx.drawImage(elemBoom, bombSize.w, 0, bombSize.w, bombSize.h, this.x, this.y, bombSize.w, bombSize.h);
    } else if (this.times === 2) {
        ctx.drawImage(elemBoom, bombSize.w * 2, 0, bombSize.w, bombSize.h, this.x, this.y, bombSize.w, bombSize.h);
    } else if (this.times === 1) {
        ctx.drawImage(elemBoom, bombSize.w * 3, 0, bombSize.w, bombSize.h, this.x, this.y, bombSize.w, bombSize.h);
    }
    this.times -= 1;
};

function beBlocked(license, x, y) {
    //检查某个坦克是否将要被阻挡
    var b = false;
    for (var i = 0; i < tankList.length; i++) {
        if (tankList[i].license != license) {
            if (overlap(x, y, tankList[i].curX, tankList[i].curY)) {
                b = true;
                break;
            }
        }
    }
    if (b || x < 0 || y < 0 || x + 32 > game.w || y + 32 > game.h) {
        return true;
    }
    return false;
}

function overlap(x1, y1, l1, x2, y2, l2) {
    if (x1 > x2 && x1 < x2 + l2 && y1 > y2 && y1 < y2 + l2) {
        return true;
    } else if (x1 + l1 > x2 && x1 + l1 < x2 + l2 && y1 > y2 && y1 < y2 + l2) {
        return true;
    } else if (x1 > x2 && x1 < x2 + l2 && y1 + l1 > y2 && y1 + l1 < y2 + l2) {
        return true;
    } else if (x1 + l1 > x2 && x1 + l1 < x2 + l2 && y1 + l1 > y2 && y1 + l1 < y2 + l2) {
        return true;
    } else if (x1 === x2 && y1 > y2 && y1 < y2 + l2) {
        return true;
    } else if (x1 === x2 && y1 + l1 > y2 && y1 + l1 < y2 + l2) {
        return true;
    } else if (y1 === y2 && x1 > x2 && x1 < x2 + l2) {
        return true;
    } else if (y1 === y2 && x1 + l1 > x2 && x1 + l1 < x2 + l2) {
        return true;
    } else if (x1 === x2 && y1 === y2) {
        return true;
    }
    return false;
}



var bindKeys = function() {
    window.onkeydown = function(e) {
        var keynum = window.event ? e.keyCode : e.which;
        // console.log(keynum);
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
            if (game.mode === 0 && mode0Stage === 2 && tankList.length > 0) {
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
                if (keynum === 72) {
                    tankList[0].fire();
                }
                // tankList[0].move();
            }
            if (game.mode === 1 && mode1Stage === 2 && tankList.length > 1) {
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
                if (keynum === 72) {
                    tankList[0].fire();
                }

                if (keynum === 38) {
                    tankList[1].boolKeyDown = true;
                    tankList[1].dir = "top";
                } else if (keynum === 40) {
                    tankList[1].boolKeyDown = true;
                    tankList[1].dir = "bottom";
                } else if (keynum === 37) {
                    tankList[1].boolKeyDown = true;
                    tankList[1].dir = "left";
                } else if (keynum === 39) {
                    tankList[1].boolKeyDown = true;
                    tankList[1].dir = "right";
                }
                if (keynum === 190) {
                    tankList[1].fire();
                }
            }

        }
    };
    window.onkeyup = function(e) {
        var keynum = window.event ? e.keyCode : e.which;
        if (game.status === 3) {
            if (game.mode === 0 && mode0Stage === 2) {
                if (keynum === 83 || keynum === 87 || keynum === 65 || keynum === 68) {
                    tankList[0].boolKeyDown = false;
                }
            }
            if (game.mode === 1 && mode1Stage === 2) {
                // console.log("boolkeyDown: "+tankList[1].boolKeyDown);
                if (keynum === 37 || keynum === 38 || keynum === 39 || keynum === 40) {
                    tankList[1].boolKeyDown = false;
                }
                if (keynum === 83 || keynum === 87 || keynum === 65 || keynum === 68) {
                    tankList[0].boolKeyDown = false;
                }
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
