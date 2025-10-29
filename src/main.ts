import "./style.css";
document.title = "Sketching";
const newLine = document.createElement("br");

document.body.innerHTML = `
  <h1>Welcome to Sketching</h1>
`;

//drawing elements
const drawingBoard = document.createElement("canvas");
drawingBoard.width = 256;
drawingBoard.height = 256;
document.body.append(drawingBoard);
const drawing = drawingBoard.getContext("2d")!;
const pen = { active: false, x: 0, y: 0 };
const strokes: Array<Array<{ x: number; y: number }>> = [];
let currentStroke: Array<{ x: number; y: number }> | null = null;

//drawing logic
drawingBoard.addEventListener("change", (_e) => {
  drawing.clearRect(0, 0, drawingBoard.width, drawingBoard.height);
  for (const line of strokes) {
    if (line.length > 1) {
      drawing.beginPath();
      const { x, y } = line[0];
      drawing.moveTo(x, y);
      for (const { x, y } of line) {
        drawing.lineTo(x, y);
      }
      drawing.stroke();
    }
  }
});

drawingBoard.addEventListener("mousedown", (e) => {
  pen.active = true;
  pen.x = e.offsetX;
  pen.y = e.offsetY;
  currentStroke = [];
  strokes.push(currentStroke);
  currentStroke.push({ x: pen.x, y: pen.y });
  drawingBoard.dispatchEvent(new Event("change"));
});
drawingBoard.addEventListener("mousemove", (e) => {
  if (pen.active) {
    pen.x = e.offsetX;
    pen.y = e.offsetY;
    currentStroke!.push({ x: pen.x, y: pen.y });
    drawingBoard.dispatchEvent(new Event("change"));
  }
});
drawingBoard.addEventListener("mouseup", (_e) => {
  pen.active = false;
  currentStroke = null;
  drawingBoard.dispatchEvent(new Event("change"));
});

//clear button elements
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(newLine);
document.body.append(clearButton);

//clear button logic
clearButton.addEventListener("click", () => {
  drawing.clearRect(0, 0, drawingBoard.width, drawingBoard.height);
  strokes.splice(0, strokes.length);
});
