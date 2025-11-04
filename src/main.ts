import "./style.css";
document.title = "Sketching";

document.body.innerHTML = `
  <h1>Welcome to Sketching</h1>
`;

//drawing elements
const drawingBoard = document.createElement("canvas");
drawingBoard.width = 256;
drawingBoard.height = 256;
document.body.append(drawingBoard);
const rect = drawingBoard.getBoundingClientRect();
const drawing = drawingBoard.getContext("2d")!;
const strokes: command[] = [];
const redoStrokes: command[] = [];
let currentStroke: command | null = null;

//interfaces for drawing
interface pen {
  x: number;
  y: number;
}

interface command {
  display(ctx: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void;
}

//commands for drawings
function drawCommand(
  firstX: number,
  firstY: number,
  thickness: number,
): command {
  const points: pen[] = [{ x: firstX, y: firstY }];

  return {
    display(ctx) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.lineWidth = thickness;
      ctx.stroke();
    },
    drag(x: number, y: number) {
      points.push({ x, y });
    },
  };
}

//draw onto the screen for user
function redraw() {
  drawing.clearRect(0, 0, drawingBoard.width, drawingBoard.height);
  for (const cmd of strokes) {
    cmd.display(drawing);
  }
  if (currentStroke) {
    currentStroke.display(drawing);
  }
}

//drawing mouse events
drawingBoard.addEventListener("mousedown", (e) => {
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  currentStroke = drawCommand(x, y, drawing.lineWidth);
  redraw();
});

drawingBoard.addEventListener("mousemove", (e) => {
  if (!currentStroke) return;
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  currentStroke!.drag(x, y);
  redraw();
});
drawingBoard.addEventListener("mouseup", (_e) => {
  if (currentStroke) {
    strokes.push(currentStroke);
    currentStroke = null;
    redraw();
  }
});

//clear button elements
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(document.createElement("br"));
document.body.append(clearButton);

//clear button logic
clearButton.addEventListener("click", () => {
  drawing.clearRect(0, 0, drawingBoard.width, drawingBoard.height);
  strokes.splice(0, strokes.length);
  redoStrokes.splice(0, redoStrokes.length);
});

//Undo/redo button elements
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);
const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);

//undo function
function undo() {
  if (strokes.length > 0) {
    redoStrokes.push(strokes.pop()!);
    redraw();
  }
}

//redo function
function redo() {
  if (redoStrokes.length > 0) {
    strokes.push(redoStrokes.pop()!);
    redraw();
  }
}

//redo/undo button functionality
undoButton.addEventListener("click", () => {
  undo();
});

redoButton.addEventListener("click", () => {
  redo();
});

document.body.append(document.createElement("br"));

//thickness buttons
const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin";
document.body.append(thinButton);
const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
document.body.append(thickButton);

//thickness button functionality
thinButton.addEventListener("click", () => {
  drawing.lineWidth = 1;
  thinButton.classList.add("selectedTool");
  thinButton.disabled = true;
  thickButton.classList.remove("selectedTool");
  thickButton.disabled = false;
});
thickButton.addEventListener("click", () => {
  drawing.lineWidth = 5;
  thickButton.classList.add("selectedTool");
  thickButton.disabled = true;
  thinButton.classList.remove("selectedTool");
  thinButton.disabled = false;
});
