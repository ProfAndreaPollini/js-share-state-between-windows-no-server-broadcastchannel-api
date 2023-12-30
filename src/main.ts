import './style.css'

// generate some random points
const points = [];
for (let i = 0; i < 1000; i++) {
    points.push({
        x: Math.random() * 2000 + 2000,
        y: Math.random() * 2000,
        vx: 0,
        vy: 0
    });
}

localStorage.setItem("points", JSON.stringify(points));


type State = {
    windowX: number,
    windowY: number,
    windowWidth: number,
    windowHeight: number,
    targetX: number,
    targetY: number,
    bb:DOMRect
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// get the width and height from the canvas element
const width = canvas.width;
const height = canvas.height;

// draw a red circle in the center
ctx.beginPath();
ctx.arc(width / 2, height / 2, 20, 0, 2 * Math.PI);
ctx.arc(window.screenX, window.screenY, 150, 0, 2 * Math.PI);
ctx.fillStyle = "red";
ctx.fill();
ctx.closePath();

const bc = new BroadcastChannel("test_channel");

let windowPosition = {
    windowX: window.screenX,
    windowY: window.screenY,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    bb : canvas.getBoundingClientRect()
}

bc.onmessage = (ev: MessageEvent<State>) => {
    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, width, height);
    const { windowX:otherWindowX, windowY:otherWwindowY,  windowWidth:otherWw, windowHeight: otherWh,bb:otherBB } = ev.data;
    // console.table(ev.data);

    let canvasX = window.screenX + canvas.getBoundingClientRect().left;
    let canvasY = window.screenY + canvas.getBoundingClientRect().top;
    // draw a line from the center of the canvas to the mouse position
    // drwa a line from the center of the canvas to thttp://localhost:5173/he window position
    
    const localBB = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(localBB.width/2,localBB.height/2)//window.innerWidth / 2, window.innerHeight / 2);
    ctx.lineTo(otherWindowX-canvasX  + otherBB.x+ otherBB.width/2, otherWwindowY-canvasY  + otherBB.y+ otherBB.height/2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();

    const points = JSON.parse(localStorage.getItem("points") || "[]");
    for (const point of points) {

        // convert to local canvas coordinates
        const localX = point.x - canvasX;
        const localY = point.y - canvasY;

        ctx.beginPath();
        ctx.arc(localX,localY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    // move points keeping x between 2000 and 4000 and y between 0 and 2000
    // move using a random walk algorithm.change velocity by a random amount between -5 and 5
    for (const point of points) {
        //change velocity by a random amount between -5 and 5
        point.vx += Math.random() * 2 - 1;
        point.vy += Math.random() * 2 - 1;
        // keep vx and vy between -10 and 10
        point.vx = Math.min(Math.max(point.vx, -10), 10);
        point.vy = Math.min(Math.max(point.vy, -10), 10);
        // move the point keeping x between 2000 and 4000 and y between 0 and 2000
        point.x = Math.min(Math.max(point.x + point.vx*0.1, 2100), 4100);
        point.y = Math.min(Math.max(point.y + point.vy*0.1, -100), 2100);
    
        // make the point wrap around the screen
        if (point.x > 4000) {
            point.x -= 2000;
        }
        if (point.x < 2000) {
            point.x += 2000;
        }
        if (point.y > 2000) {
            point.y -= 2000;
        }
        if (point.y < 0) {
            point.y += 2000;
        }
    }

    
    // update local storage
    localStorage.setItem("points", JSON.stringify(points));
}

window.onresize = () => {
    bc.postMessage({
        windowX: window.screenX,
        windowY: window.screenY,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        bb: canvas.getBoundingClientRect()
    })}

// poll for changes in window position on request frame

const poll = () => {
    // ctx.fillStyle = "white";
    // ctx.clearRect(0, 0, width, height);
    const { windowX, windowY, windowWidth, windowHeight } = windowPosition;
    if (window.screenX !== windowX || window.screenY !== windowY || window.innerWidth !== windowWidth || window.innerHeight !== windowHeight) {
        windowPosition = {
            windowX: window.screenX,
            windowY: window.screenY,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            bb: canvas.getBoundingClientRect()
        }
        document.getElementById("screenx")!.innerHTML = window.screenX.toString();
        document.getElementById("screeny")!.innerHTML = window.screenY.toString();
        bc.postMessage(windowPosition);
    }
    bc.postMessage(windowPosition);
    requestAnimationFrame(poll);
}
requestAnimationFrame(poll);

bc.postMessage({
    windowX: window.screenX,
    windowY: window.screenY,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
})