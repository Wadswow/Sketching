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

//drawing logic
drawingBoard.addEventListener("mousedown", (e) => {
  pen.active = true;
  pen.x = e.offsetX;
  pen.y = e.offsetY;
});
drawingBoard.addEventListener("mousemove", (e) => {
  if (pen.active) {
    drawing.beginPath();
    drawing.moveTo(pen.x, pen.y);
    drawing.lineTo(e.offsetX, e.offsetY);
    drawing.stroke();
    pen.x = e.offsetX;
    pen.y = e.offsetY;
  }
});
drawingBoard.addEventListener("mouseup", (_e) => {
  pen.active = false;
});

//clear button elements
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(newLine);
document.body.append(clearButton);

//clear button logic
clearButton.addEventListener("click", () => {
  drawing.clearRect(0, 0, drawingBoard.width, drawingBoard.height);
});
