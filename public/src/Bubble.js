class Bubble {
  constructor(message, x, y, id) {
    this.id = id;
    this.message = message;
    this.x = x;
    this.y = y;
    this.counter = BUBBLE_TIME;
    this.textW = textWidth(this.message);
    this.fontScale = 1;
    this.w = round(this.textW + TEXT_PADDING * 2);
    this.h = round(TEXT_H + TEXT_PADDING * 2 * this.fontScale);
    this.row = 0;
    this.offY = 100;
  }

  update() {
    this.counter -= deltaTime / 1000;
    this.y =
      this.offY - floor((TEXT_H + TEXT_PADDING * 2 + BUBBLE_MARGIN) * this.row);
    noStroke();
    textAlign(LEFT, BASELINE);

    fill(30);
    rectMode(CORNER);
    rect(this.x, this.y, this.w + 1, this.h);
    fill(255);
    text(
      this.message,
      floor(this.x + TEXT_PADDING) + 1,
      floor(this.h + this.y - TEXT_PADDING)
    );
  }
}
