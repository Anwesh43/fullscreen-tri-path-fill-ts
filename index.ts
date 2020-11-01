const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 5 
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90
const sizeFactor : number = 8.9 
const delay : number = 20 
const colors : Array<string> = [
    "#F44336",
    "#4CAF50",
    "#3F51B5",
    "#009688",
    "#FFC107"
] 
const backColor : string = "#bdbdbd"

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawTriPathFill(context : CanvasRenderingContext2D, size : number, sf5 : number) {
        context.save()
        context.beginPath()
        context.moveTo(0, -size)
        context.lineTo(w / 2 - size / 2, -size)
        context.lineTo(w / 2, -h)
        context.lineTo(w / 2 + size / 2, -size)
        context.lineTo(w, -size)
        context.lineTo(w, 0)
        context.lineTo(0, 0)
        context.lineTo(0, -size)
        context.clip()
        context.fillRect(0, -h, w * sf5, h)
        context.restore()
    }

    static drawFullscreenTriFill(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const size : number = Math.min(w, h) / sizeFactor 
        context.save()
        context.translate(0, h)
        DrawingUtil.drawLine(
            context,
            0,
            -size,
            (w - size / 2) * ScaleUtil.divideScale(sf, 0, parts),
            -size
        )
        DrawingUtil.drawLine(
            context, 
            w - size / 2,
            -size, 
            w - size / 2 + size * 0.5 * ScaleUtil.divideScale(sf, 1, parts),
            -size - (h - size) * ScaleUtil.divideScale(sf, 1, parts) 
        )
        DrawingUtil.drawLine(
            context, 
            w / 2, 
            -h, 
            w / 2 + size * 0.5 * ScaleUtil.divideScale(sf, 2, parts),
            -h + (h - size) * ScaleUtil.divideScale(sf, 2, parts)
        )        
        DrawingUtil.drawLine(
            context, 
            w / 2 + size / 2,
            -size, 
            w / 2 + size / 2 + (w / 2 - size / 2) * ScaleUtil.divideScale(sf, 3, parts),
            -size
        )
        DrawingUtil.drawTriPathFill(context, size, ScaleUtil.divideScale(sf, 4, parts))
        context.restore()
    }

    static drawFTPFNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        context.fillStyle = colors[i]
        DrawingUtil.drawFullscreenTriFill(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    update(cb : Function) {
        this.scale += scGap * this.dir 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {
    
    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}