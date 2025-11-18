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
drawingBoard.style.cursor = "none";
const rect = drawingBoard.getBoundingClientRect();
const drawing = drawingBoard.getContext("2d")!;
const strokes: command[] = [];
const redoStrokes: command[] = [];
let currentStroke: command | null = null;
let currentBrush: brush | null = null;
let strokeThickness = 2;

//interfaces for drawing
interface pen {
  x: number;
  y: number;
}

interface command {
  display(ctx: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void;
}

interface brush {
  draw(ctx: CanvasRenderingContext2D): void;
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

function stickerCommand(x: number, y: number): command {
  const button: HTMLButtonElement | void = buttonDetect();
  const buttonText = button!.innerHTML;
  return {
    display(ctx) {
      ctx.font = "25px monospace";
      ctx.fillText(buttonText, x - 17, y + 10);
    },
    drag(moveX: number, moveY: number) {
      x = moveX;
      y = moveY;
    },
  };
}

function brushCommand(cursorX: number, cursorY: number) {
  return {
    draw(ctx: CanvasRenderingContext2D) {
      const button: HTMLButtonElement | void = buttonDetect();
      const buttonText = button!.innerHTML;
      ctx.save();
      ctx.globalAlpha = 0.75;
      if (button! == thinButton || button! == thickButton) {
        ctx.beginPath();
        ctx.lineWidth = strokeThickness;
        ctx.arc(cursorX, cursorY, 1, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        ctx.font = "25px monospace";
        ctx.fillText(buttonText, cursorX - 17, cursorY + 10);
      }
      ctx.restore();
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
  if (currentBrush) {
    currentBrush.draw(drawing);
  }
}

//event listener for commands
const portrait = new EventTarget();
portrait.addEventListener("draw", redraw);
portrait.addEventListener("brush", redraw);

//drawing mouse events
drawingBoard.addEventListener("mouseout", (_e) => {
  currentBrush = null;
  portrait.dispatchEvent(new Event("brush"));
});

drawingBoard.addEventListener("mouseenter", (e) => {
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  currentBrush = brushCommand(x, y);
  portrait.dispatchEvent(new Event("brush"));
});

drawingBoard.addEventListener("mousedown", (e) => {
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (buttonDetect() == thinButton || buttonDetect() == thickButton) {
    currentStroke = drawCommand(x, y, strokeThickness);
  } else {
    currentStroke = stickerCommand(x, y);
  }
  portrait.dispatchEvent(new Event("draw"));
});

drawingBoard.addEventListener("mousemove", (e) => {
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  currentBrush = brushCommand(x, y);
  portrait.dispatchEvent(new Event("brush"));
  if (!currentStroke) return;
  currentStroke!.drag(x, y);
  portrait.dispatchEvent(new Event("draw"));
});

drawingBoard.addEventListener("mouseup", (_e) => {
  if (currentStroke) {
    strokes.push(currentStroke);
    currentStroke = null;
    portrait.dispatchEvent(new Event("draw"));
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
    portrait.dispatchEvent(new Event("draw"));
  }
}

//redo function
function redo() {
  if (redoStrokes.length > 0) {
    strokes.push(redoStrokes.pop()!);
    portrait.dispatchEvent(new Event("draw"));
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
thinButton.classList.add("selectedTool");
thinButton.disabled = true;
thinButton.addEventListener("click", () => {
  strokeThickness = 2;
  buttonPressed(thinButton);
});
thickButton.addEventListener("click", () => {
  strokeThickness = 8;
  buttonPressed(thickButton);
});

document.body.append(document.createElement("br"));

//sticker buttons
const stickers = [
  { emoji: "😄" },
  { emoji: "🐕" },
  { emoji: "💰" },
];
const buttons = [thinButton, thickButton];

stickers.forEach((sticker) => {
  const button = document.createElement("button");
  button.innerHTML = sticker.emoji;
  document.body.append(button);
  buttons.push(button);
  button.addEventListener("click", () => {
    portrait.dispatchEvent(new Event("brush"));
    buttonPressed(button);
  });
});

function buttonPressed(button: HTMLButtonElement) {
  buttons.forEach((e) => {
    e.classList.remove("selectedTool");
    e.disabled = false;
  });
  button.classList.add("selectedTool");
  button.disabled = true;
}
function buttonDetect() {
  return buttons.find((e) => e.classList.contains("selectedTool"));
}

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "+";
document.body.append(customStickerButton);

customStickerButton.addEventListener("click", () => {
  const userInput = prompt("Custom Sticker Here", "🧽");
  if (!userInput) return;
  stickers.push({ emoji: userInput! });
  const button = document.createElement("button");
  button.innerHTML = userInput!;
  document.body.insertBefore(button, customStickerButton);
  buttons.push(button);
  button.addEventListener("click", () => {
    portrait.dispatchEvent(new Event("brush"));
    buttonPressed(button);
  });
});

document.body.append(document.createElement("br"));

const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
document.body.append(exportButton);

exportButton.addEventListener("click", () => {
  const downloadBoard = document.createElement("canvas");
  downloadBoard.width = 1024;
  downloadBoard.height = 1024;
  const downloadDrawing = downloadBoard.getContext("2d")!;
  downloadDrawing.scale(4, 4);
  for (const cmd of strokes) {
    cmd.display(downloadDrawing);
  }
  const downloadPicture = document.createElement("a");
  downloadPicture.href = downloadBoard.toDataURL();
  downloadPicture.download = "sketch.png";
  downloadPicture.click();
});
