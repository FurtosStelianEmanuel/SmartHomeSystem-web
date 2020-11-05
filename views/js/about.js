image_height = 0.5;
phone_size = 0.35;

FONT_SIZE = 70;
fontP = 0.12;

onPointOffset = 0.2;
texts = [{ text: "About", size: fontP } /*, { text: "by Furtos Stelian", size: fontP / 2 }*/ ];
nextT = 0;
vehicles = [];

PHONE_STROKE_WEIGHT = 3;
DESKTOP_STROKE_WEIGHT = 6;
currentStrokeWeight = DESKTOP_STROKE_WEIGHT;

DESKTOP_SAMPLE_FACTOR = 0.1;
PHONE_SAMPLE_FACTOR = 0.05;
currentSampleFactor = DESKTOP_SAMPLE_FACTOR;

var maxChangeForce = 20;

myred = 0;
colorSpeed = 5;
donePainting = false;
BACKGROUND_COLOR = 51;
lastX = 0;
lastY = 0;

function homePressed(){
    window.location.href="";
}

function setVehicleStartPoints() {
    switch (spawnType) {
        case 0: //stanga sus
            vehicles.forEach(vehicle => {
                vehicle.pos.x = 0;
                vehicle.pos.y = 0;
                vehicle.initialPosition.x = vehicle.pos.x;
                vehicle.initialPosition.y = vehicle.pos.y;
            });
            break;
        case 1: //mijloc sus
            vehicles.forEach(vehicle => {
                vehicle.pos.x = canvasWidth / 2;
                vehicle.pos.y = 0;
                vehicle.initialPosition.x = vehicle.pos.x;
                vehicle.initialPosition.y = vehicle.pos.y;
            });
            break;
        case 2: //dreapta sus
            vehicles.forEach(vehicle => {
                vehicle.pos.x = canvasWidth;
                vehicle.pos.y = 0;
                vehicle.initialPosition.x = vehicle.pos.x;
                vehicle.initialPosition.y = vehicle.pos.y;
            });
            break;
        case 3: //stanga jos
            vehicles.forEach(vehicle => {
                vehicle.pos.x = 0;
                vehicle.pos.y = canvasHeight;
                vehicle.initialPosition.x = vehicle.pos.x;
                vehicle.initialPosition.y = vehicle.pos.y;
            });
            break;
        case 4: // mijloc jos
            vehicles.forEach(vehicle => {
                vehicle.pos.x = canvasWidth / 2;
                vehicle.pos.y = canvasHeight;
                vehicle.initialPosition.x = vehicle.pos.x;
                vehicle.initialPosition.y = vehicle.pos.y;
            });
            break;
        case 5: // dreapta jos
            vehicles.forEach(vehicle => {
                vehicle.pos.x = canvasWidth;
                vehicle.pos.y = canvasHeight;
                vehicle.initialPosition.x = vehicle.pos.x;
                vehicle.initialPosition.y = vehicle.pos.y;
            });
            break;
        case 6: //centru
            vehicles.forEach(vehicle => {
                vehicle.pos.x = canvasWidth / 2;
                vehicle.pos.y = canvasHeight / 2;
                vehicle.initialPosition.x = vehicle.pos.x;
                vehicle.initialPosition.y = vehicle.pos.y;
            });
            break;
        case 7: // latura stanga centrat
            vehicles.forEach(vehicle => {
                vehicle.pos.x = 0;
                vehicle.pos.y = canvasHeight / 2;
                vehicle.initialPosition.x = vehicle.pos.x;
                vehicle.initialPosition.y = vehicle.pos.y;
            });
            break;

        case 8: // latura dreapta centrat
            vehicles.forEach(vehicle => {
                vehicle.pos.x = canvasWidth;
                vehicle.pos.y = canvasHeight / 2;
                vehicle.initialPosition.x = vehicle.pos.x;
                vehicle.initialPosition.y = vehicle.pos.y;
            });
            break;
        case 9: //jumatate in coltu din stanga sus, jumatate in coltu din dreapta sus
            for (let i = 0; i < vehicles.length / 2; i++) {
                vehicles[i].pos.x = 0;
                vehicles[i].pos.y = 0;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            for (let i = int(vehicles.length / 2); i < vehicles.length; i++) {
                vehicles[i].pos.x = canvasWidth;
                vehicles[i].pos.y = 0;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            break;
        case 10: // jumatate in coltu din stanga mijloc, jumatate in coltu din dreapta mijloc
            for (let i = 0; i < vehicles.length / 2; i++) {
                vehicles[i].pos.x = 0;
                vehicles[i].pos.y = canvasHeight / 2;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            for (let i = int(vehicles.length / 2); i < vehicles.length; i++) {
                vehicles[i].pos.x = canvasWidth;
                vehicles[i].pos.y = canvasHeight / 2;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            break;
        case 11: //jumatate coltu din stanga jos, jumatate coltu dreapta jos
            for (let i = 0; i < vehicles.length / 2; i++) {
                vehicles[i].pos.x = 0;
                vehicles[i].pos.y = canvasHeight;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            for (let i = int(vehicles.length / 2); i < vehicles.length; i++) {
                vehicles[i].pos.x = canvasWidth;
                vehicles[i].pos.y = canvasHeight;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            break; //jumatate latura sus mijloc, jumatate latura jos mijloc
        case 12:
            for (let i = 0; i < vehicles.length / 2; i++) {
                vehicles[i].pos.x = canvasWidth / 2;
                vehicles[i].pos.y = 0;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            for (let i = int(vehicles.length / 2); i < vehicles.length; i++) {
                vehicles[i].pos.x = canvasWidth / 2;
                vehicles[i].pos.y = canvasHeight;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            break;
        case 13: //jumatate coltu stanga sus jumatate coltu dreapta jos
            for (let i = 0; i < vehicles.length / 2; i++) {
                vehicles[i].pos.x = 0;
                vehicles[i].pos.y = 0;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            for (let i = int(vehicles.length / 2); i < vehicles.length; i++) {
                vehicles[i].pos.x = canvasWidth;
                vehicles[i].pos.y = canvasHeight;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            break;
        case 14: //jumatate coltu dreapta sus, jumatate coltu stanga jos
            for (let i = 0; i < vehicles.length / 2; i++) {
                vehicles[i].pos.x = 0;
                vehicles[i].pos.y = canvasHeight;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            for (let i = int(vehicles.length / 2); i < vehicles.length; i++) {
                vehicles[i].pos.x = canvasWidth;
                vehicles[i].pos.y = 0;
                vehicles[i].initialPosition.x = vehicles[i].pos.x;
                vehicles[i].initialPosition.y = vehicles[i].pos.y;
            }
            break;

    }
}

function preload() {
    font = loadFont('fonts/Autobusbold-1ynL.ttf');
}
const getTitleX = () => {
    return canvasWidth / 2 - textWidth(texts[nextT].text) / 2;
}

const getTitleY = () => {
    return canvasHeight / 2 + getFontSize() / 2;
}

const getFontSize = () => {
    return canvasWidth * texts[nextT].size;
}

function rgbString(culoare) {
    return "rgb(" +
        culoare.levels[0] + "," + culoare.levels[1] +
        "," + culoare.levels[2] + "," + culoare.levels[3] + ");"
}

function mouseClicked() {

    if (mouseY <= canvasHeight) {

        donePainting = false;
        nextT++;
        if (nextT > texts.length - 1) {
            nextT = 0;
        }
        myred = 0;
        loop();
        textSize(getFontSize());
        var bounds = font.textBounds(texts[nextT].text, getTitleX(), getTitleY(), texts[nextT].size * canvasWidth);
        var posx = width / 2 - bounds.w / 2;
        var posy = height / 2 + bounds.h / 2;

        var points = font.textToPoints(texts[nextT].text, getTitleX(), getTitleY(), texts[nextT].size * canvasWidth, {
            sampleFactor: 0.1
        });

        if (points.length < vehicles.length) {
            var toSplice = vehicles.length - points.length;
            vehicles.splice(points.length - 1, toSplice);

            for (var i = 0; i < points.length; i++) {
                vehicles[i].target.x = points[i].x;
                vehicles[i].target.y = points[i].y;

                var force = p5.Vector.random2D();
                force.mult(random(maxChangeForce));
                vehicles[i].applyForce(force);
            }
        } else if (points.length > vehicles.length) {

            for (var i = vehicles.length; i < points.length; i++) {
                var v = vehicles[i - vehicles.length].clone();

                vehicles.push(v);
            }

            for (var i = 0; i < points.length; i++) {
                vehicles[i].target.x = points[i].x;
                vehicles[i].target.y = points[i].y;

                var force = p5.Vector.random2D();
                force.mult(random(maxChangeForce));
                vehicles[i].applyForce(force);
            }

        } else {
            for (var i = 0; i < points.length; i++) {
                vehicles[i].target.x = points[i].x;
                vehicles[i].target.y = points[i].y;

                var force = p5.Vector.random2D();
                force.mult(random(maxChangeForce));
                vehicles[i].applyForce(force);
            }
        }
        if (Vehicle.RESTING) {
            setVehicleStartPoints();
        }
    }
}
window.onresize = function() {
    windowResized();
};
document.onreadystatechange = function() {
    if (document.readyState != "complete") {
        document.getElementById("postLoad").style.display = "none";
        document.getElementById("preLoad").style.display = "block";
    } else {
        document.getElementById("postLoad").style.display = "block";
        document.getElementById("preLoad").style.display = "none";
    }
};


function windowResized() {

    if (window.innerWidth > window.innerHeight) {
        resizeCanvas(window.innerWidth, window.innerHeight * image_height);
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight * image_height;
        textFont(font);
        textSize(canvasWidth * texts[nextT].size);

    } else {
        resizeCanvas(window.innerWidth, window.innerHeight * phone_size);
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight * phone_size;
        textFont(font);
        textSize(canvasWidth * texts[nextT].size);
        currentSampleFactor = PHONE_SAMPLE_FACTOR;
        currentStrokeWeight = PHONE_STROKE_WEIGHT;
    }
}

function setup() {
    var points;
    BACKGROUND_COLOR = color(51, 51, 51);
    if (window.innerWidth > window.innerHeight) {
        createCanvas(window.innerWidth, window.innerHeight * image_height).parent('sketch-holder');
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight * image_height;
        textFont(font);
        textSize(canvasWidth * texts[nextT].size);

    } else {
        createCanvas(window.innerWidth, window.innerHeight * phone_size).parent('sketch-holder');
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight * phone_size;
        textFont(font);
        textSize(canvasWidth * texts[nextT].size);
        currentSampleFactor = PHONE_SAMPLE_FACTOR;
        currentStrokeWeight = PHONE_STROKE_WEIGHT;
    }
    points = font.textToPoints(texts[nextT].text, getTitleX(), getTitleY(), getFontSize(), {
        sampleFactor: currentSampleFactor
    });
    for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        var vehicle = new Vehicle(pt.x, pt.y);
        vehicles.push(vehicle);
    }

    spawnType = int(random(15));
    setVehicleStartPoints();
    document.body.style = "background-color:" + rgbString(BACKGROUND_COLOR);
    setTimeout(() => {
        document.getElementById("content").style.display = "block";
    }, 600);
}

function draw() {
    background(BACKGROUND_COLOR);
    allDone = true;
    Vehicle.RESTING = true;
    if (mouseX != lastX || mouseY != lastY) {
        Vehicle.SCARED_OF_MOUSE = true;
    } else {
        Vehicle.SCARED_OF_MOUSE = false;
    }
    vehicles.forEach(vehicle => {
        vehicle.behaviors();
        vehicle.update();
        if (abs(int(vehicle.pos.x - vehicle.target.x)) >= onPointOffset ||
            abs(int(vehicle.pos.y - vehicle.target.y)) >= onPointOffset) {
            allDone = false;
        }
        if (abs(int(vehicle.pos.x - vehicle.initialPosition.x)) >= onPointOffset ||
            abs(int(vehicle.pos.y - vehicle.initialPosition.y)) >= onPointOffset) {
            Vehicle.RESTING = false;
        }
    });
    if (allDone && !donePainting) {
        myred += colorSpeed;
        if (myred > 255) {
            myred = 255;
            if (!donePainting) {
                vehicles.forEach(vehicle => {
                    vehicle.retreat();
                });
                donePainting = true;
            }
        }
        noStroke();
        fill(myred, 0, 0, myred);
        text(texts[nextT].text, getTitleX(), getTitleY());
    } else if (!donePainting) {
        myred -= colorSpeed;
        if (myred < 0) {
            myred = 0;
        }
        noStroke();
        fill(myred, 0, 0, myred);
        text(texts[nextT].text, getTitleX(), getTitleY());
    } else {
        stroke(0, 0, 0);
        strokeWeight(currentStrokeWeight);
        fill(255, 0, 0, myred);
        text(texts[nextT].text, getTitleX(), getTitleY());
    }
    if (!Vehicle.RESTING) {
        vehicles.forEach(vehicle => {
            vehicle.show();
        });
    } else if (donePainting) {
        noLoop();
    }
    lastX = mouseX;
    lastY = mouseY;
}