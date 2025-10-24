import "./style.css";
document.title = "Sketching";

document.body.innerHTML = `
  <h1>Welcome to Sketching</h1>
`;

const drawingBoard = document.createElement("canvas");
drawingBoard.width = 256;
drawingBoard.height = 256;
document.body.append(drawingBoard);
