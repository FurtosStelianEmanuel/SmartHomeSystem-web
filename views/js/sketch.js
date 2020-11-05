image_height = 0.5;
phone_size = 0.35;

image_scale = 0.8;

opacity = 255.0;
fadeSpeed = 5;
fadeInType = 0;

x = 0;
slideAnimationSpeed = 15;

cssClasses = [
    "w3-container w3-center w3-animate-right",
    "w3-container w3-center w3-animate-opacity",
    "w3-container w3-center w3-animate-zoom",
    "w3-container w3-center w3-animate-top",
    "w3-container w3-center w3-animate-bottom",
    "w3-container w3-center w3-animate-left",
    "w3-container w3-center w3-animate-right"
];

function preload() {
    document.getElementById("home_interface").className = random(cssClasses);

}

function fadeInAnimation() {
    background(255, 255, 255, opacity);
    opacity -= fadeSpeed;
    if (opacity < 0) {
        opacity = 0;
        fadeInType = -1;
        noLoop();
    }
}

function leftSwipeAnimation() {
    noStroke();
    fill(0, 0, 0, 150);
    rect(x, 0, canvas.width, canvas.height);
    x += slideAnimationSpeed;
    if (x > canvas.width) {
        x = canvas.width;
        fadeInType = -1;
        noLoop();
    }
}

imageDoneLoading = false;

function setup() {

    if (displayWidth > displayHeight) {
        createCanvas(displayWidth, displayHeight * image_height).parent('sketch-holder');
        //document.getElementById("spanac").innerHTML="&#9776; Opțiuni";
        slideAnimationSpeed = 35;
    } else {
        createCanvas(displayWidth, displayHeight * phone_size).parent('sketch-holder');
        slideAnimationSpeed = 7;
    }
    /*
	 loadImage('assets/laDefense.jpg', img => {
    image(img, 0, 0);
  });
	*/
    img = loadImage('/image-bank', img => {
        imageDoneLoading = true;
    });
    //img = loadImage('/image-bank');
    if (displayWidth > displayHeight && img.height < displayHeight * image_height) {
        while (image_scale * img.height * width / img.width >= displayHeight * image_height + 200 && image_scale > 0.01) {
            image_scale -= 0.05;
        }
    }
    //document.getElementById("sketch-holder").style.height=height+"px";
    fadeInType = /*int(random(2))*/ 1;
    switch (fadeInType) {
        case 0:
            selectedAnimation = fadeInAnimation;
            break;
        case 1:
            selectedAnimation = leftSwipeAnimation;
            break;
        default:
            selectedAnimation = fadeInAnimation;
            break;
    }
}

rotateAngle = 0;

function draw() {
    imageMode(CORNER);
    image(img, 0, 0);

    imageMode(CORNER);
    image(img, 0, 0, width, height);

    imageMode(CORNER);
    image(img, 0, 0, width, img.height * width / img.width); // to fit width


    push();
    fill(0, 0, 0, 200);
    rect(0, 0, canvas.width, canvas.height);
    pop();

    imageMode(CENTER);
    image(img, 0.5 * width, 0.5 * height, image_scale * width, image_scale * img.height * width / img.width); // to fit width

    if (imageDoneLoading) {
        selectedAnimation();
    } else {
        fill(255);
        translate(canvas.width / 2, canvas.height / 2 + 25);
        rotate(rotateAngle);
        text("asteptam sa se incarce imaginea ", 0, 0);
        rotateAngle += 0.05;
    }
}