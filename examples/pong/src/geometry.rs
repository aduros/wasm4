use super::wasm4::rect;

pub trait Draw {
    fn draw(&self);
}

pub trait Collide {
    fn is_colliding(&self, px: u8, py: u8) -> bool;
    fn is_colliding_rect(&self, other: &Rectangle) -> bool;
    fn is_colliding_y(&self, px: u8) -> bool;
    fn is_colliding_x(&self, py: u8) -> bool;
}

pub trait Move {
    fn move_by(&mut self, px: i32, py: i32);
    fn move_to(&mut self, px: u8, py: u8);
}

#[derive(Copy, Clone)]
pub struct Rectangle {
    pub x: u8,
    pub y: u8,
    pub width: u8,
    pub height: u8,
}

impl Draw for Rectangle {
    fn draw(&self) {
        rect(
            self.x as i32,
            self.y as i32,
            self.width as u32,
            self.height as u32,
        );
    }
}

impl Move for Rectangle {
    fn move_to(&mut self, px: u8, py: u8) {
        self.x = px;
        self.y = py;
    }

    fn move_by(&mut self, px: i32, py: i32) {
        self.move_to((self.x as i32 + px) as u8, (self.y as i32 + py) as u8);
    }
}

impl Collide for Rectangle {
    fn is_colliding(&self, px: u8, py: u8) -> bool {
        self.is_colliding_x(px) && self.is_colliding_y(py)
    }

    fn is_colliding_rect(&self, other: &Self) -> bool {
        self.x <= other.x + other.width
            && self.x + self.width >= other.x
            && self.y <= other.y + other.height
            && self.y + self.height >= other.y
    }

    fn is_colliding_x(&self, px: u8) -> bool {
        px >= self.x && px <= self.x + self.width
    }

    fn is_colliding_y(&self, py: u8) -> bool {
        py >= self.y && py <= self.y + self.height
    }
}

pub struct Frame {
    pub top: Rectangle,
    pub right: Rectangle,
    pub bottom: Rectangle,
    pub left: Rectangle,
}

impl Draw for Frame {
    fn draw(&self) {
        self.top.draw();
        self.right.draw();
        self.bottom.draw();
        self.left.draw();
    }
}

#[inline]
pub fn clamp<T: PartialOrd>(input: T, min: T, max: T) -> T {
    debug_assert!(min <= max, "min must be less than or equal to max");
    if input < min {
        min
    } else if input > max {
        max
    } else {
        input
    }
}
