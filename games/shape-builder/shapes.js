/**
 * Shape Builder - Shape Rendering and Manipulation
 */

// Shape class
class Shape {
    constructor(type, x, y, color, rotation = 0, size = 80) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.color = color;
        this.rotation = rotation;
        this.size = size;
        this.id = this.generateId();
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    generateId() {
        return `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    render(svg) {
        const shapeData = SHAPES[this.type];
        if (!shapeData) return null;

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', this.id);
        group.setAttribute('class', 'shape-element');
        group.setAttribute('transform', `translate(${this.x}, ${this.y}) rotate(${this.rotation})`);
        group.style.cursor = 'grab';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', shapeData.path);
        path.setAttribute('fill', this.color);
        path.setAttribute('stroke', 'rgba(0,0,0,0.2)');
        path.setAttribute('stroke-width', '2');

        // Scale the shape based on size
        const scale = this.size / 100;
        path.setAttribute('transform', `translate(-50, -50) scale(${scale}) translate(50, 50)`);

        group.appendChild(path);
        svg.appendChild(group);

        return group;
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        const element = document.getElementById(this.id);
        if (element) {
            element.setAttribute('transform', `translate(${this.x}, ${this.y}) rotate(${this.rotation})`);
        }
    }

    rotate(angle) {
        this.rotation = (this.rotation + angle) % 360;
        const element = document.getElementById(this.id);
        if (element) {
            element.setAttribute('transform', `translate(${this.x}, ${this.y}) rotate(${this.rotation})`);
        }
    }

    changeColor(newColor) {
        this.color = newColor;
        const element = document.getElementById(this.id);
        if (element) {
            const path = element.querySelector('path');
            if (path) {
                path.setAttribute('fill', newColor);
            }
        }
    }

    remove() {
        const element = document.getElementById(this.id);
        if (element) {
            element.remove();
        }
    }

    contains(x, y) {
        const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
        return distance < this.size / 2;
    }
}

// Canvas Manager
class CanvasManager {
    constructor(svgElement) {
        this.svg = svgElement;
        this.shapes = [];
        this.selectedShape = null;
        this.isDragging = false;
        this.setupEventListeners();
    }

    getSVGPoint(clientX, clientY) {
        const point = this.svg.createSVGPoint();
        point.x = clientX;
        point.y = clientY;
        const ctm = this.svg.getScreenCTM();
        if (ctm) {
            return point.matrixTransform(ctm.inverse());
        }
        return { x: clientX, y: clientY }; // Fallback
    }

    setupEventListeners() {
        // Mouse events
        this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.svg.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.svg.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.svg.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // Touch events
        this.svg.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.svg.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.svg.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    addShape(type, x, y, color, rotation = 0, size = 80) {
        const shape = new Shape(type, x, y, color, rotation, size);
        this.shapes.push(shape);
        shape.render(this.svg);
        return shape;
    }

    removeShape(shapeId) {
        const index = this.shapes.findIndex(s => s.id === shapeId);
        if (index !== -1) {
            this.shapes[index].remove();
            this.shapes.splice(index, 1);
        }
    }

    clearAll() {
        this.shapes.forEach(shape => shape.remove());
        this.shapes = [];
        this.selectedShape = null;
    }

    getShapeAt(x, y) {
        // Return the topmost shape at the given position
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            if (this.shapes[i].contains(x, y)) {
                return this.shapes[i];
            }
        }
        return null;
    }

    selectShape(shape) {
        // Deselect previous shape
        if (this.selectedShape) {
            const prevElement = document.getElementById(this.selectedShape.id);
            if (prevElement) {
                prevElement.style.filter = 'none';
            }
        }

        this.selectedShape = shape;

        if (shape) {
            const element = document.getElementById(shape.id);
            if (element) {
                element.style.filter = 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))';
            }
        }
    }

    handleMouseDown(e) {
        const point = this.getSVGPoint(e.clientX, e.clientY);
        const x = point.x;
        const y = point.y;

        const shape = this.getShapeAt(x, y);
        if (shape) {
            this.isDragging = true;
            shape.isDragging = true;
            shape.offsetX = x - shape.x;
            shape.offsetY = y - shape.y;
            this.selectShape(shape);

            const element = document.getElementById(shape.id);
            if (element) {
                element.style.cursor = 'grabbing';
            }
        } else {
            this.selectShape(null);
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedShape || !this.selectedShape.isDragging) return;

        const point = this.getSVGPoint(e.clientX, e.clientY);
        const x = point.x;
        const y = point.y;

        this.selectedShape.updatePosition(
            x - this.selectedShape.offsetX,
            y - this.selectedShape.offsetY
        );
    }

    handleMouseUp(e) {
        if (this.selectedShape) {
            this.selectedShape.isDragging = false;
            const element = document.getElementById(this.selectedShape.id);
            if (element) {
                element.style.cursor = 'grab';
            }
        }
        this.isDragging = false;
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 0) return;

        const touch = e.touches[0];
        const point = this.getSVGPoint(touch.clientX, touch.clientY);
        const x = point.x;
        const y = point.y;

        const shape = this.getShapeAt(x, y);
        if (shape) {
            this.isDragging = true;
            shape.isDragging = true;
            shape.offsetX = x - shape.x;
            shape.offsetY = y - shape.y;
            this.selectShape(shape);
        } else {
            this.selectShape(null);
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDragging || !this.selectedShape || !this.selectedShape.isDragging) return;
        if (e.touches.length === 0) return;

        const touch = e.touches[0];
        const point = this.getSVGPoint(touch.clientX, touch.clientY);
        const x = point.x;
        const y = point.y;

        this.selectedShape.updatePosition(
            x - this.selectedShape.offsetX,
            y - this.selectedShape.offsetY
        );
    }

    handleTouchEnd(e) {
        if (this.selectedShape) {
            this.selectedShape.isDragging = false;
        }
        this.isDragging = false;
    }

    rotateSelected(angle = 45) {
        if (this.selectedShape) {
            this.selectedShape.rotate(angle);
        }
    }

    changeSelectedColor(color) {
        if (this.selectedShape) {
            this.selectedShape.changeColor(color);
        }
    }

    deleteSelected() {
        if (this.selectedShape) {
            this.removeShape(this.selectedShape.id);
            this.selectedShape = null;
        }
    }

    loadPattern(pattern) {
        this.clearAll();
        pattern.shapes.forEach(shapeData => {
            this.addShape(
                shapeData.type,
                shapeData.x,
                shapeData.y,
                shapeData.color,
                shapeData.rotation || 0,
                shapeData.size || 80
            );
        });
    }

    getShapesData() {
        return this.shapes.map(shape => ({
            type: shape.type,
            x: shape.x,
            y: shape.y,
            color: shape.color,
            rotation: shape.rotation,
            size: shape.size
        }));
    }
}
