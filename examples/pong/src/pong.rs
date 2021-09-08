use super::geometry::{clamp, Collide, Draw, Frame, Move, Rectangle};
use super::palettes::change_palette;
use super::wasm4::{
    line, rect, text, tone, BUTTON_1, BUTTON_2, BUTTON_DOWN, BUTTON_UP, SCREEN_SIZE, TONE_TRIANGLE,
};
use bitflags::bitflags;

const WIN_THRESHOLD: u8 = 5;

const SCREEN_SIZE_U8: u8 = SCREEN_SIZE as u8;

const RACKET_MOVEMENT_SPEED: i32 = 2;

const TEXT_SCORE_POSITION: (i32, i32) = (60, 20);

const PLAYER_HAS_SCORED_WAIT_FRAMES: u8 = 30;

const DIGITS: &str = "0123456789";

const MIN_FRAMES_BETWEEN_TONES: u8 = 5;

const MIN_FRAMES_BETWEEN_PALETTE_CHANGE: u8 = 30;

bitflags! {
    struct CollisionType: u8 {
        const P1_RACKET = 1;
        const P2_RACKET = 2;
        const TOP = 1 << 3;
        const RIGHT = 1 << 4;
        const BOTTOM = 1 << 5;
        const LEFT = 1 << 6;
    }
}

fn num_as_str<T: Into<usize>>(score: T) -> &'static str {
    let idx: usize = score.into();

    match idx {
        10 => "10",
        _ => &DIGITS[idx..idx + 1],
    }
}

const GAME_FRAME: Frame = Frame {
    top: Rectangle {
        x: 0,
        y: 0,
        width: SCREEN_SIZE_U8,
        height: 2,
    },
    right: Rectangle {
        x: SCREEN_SIZE_U8 - 2,
        y: 0,
        width: 1,
        height: SCREEN_SIZE_U8,
    },
    bottom: Rectangle {
        x: 0,
        y: SCREEN_SIZE_U8 - 2,
        width: SCREEN_SIZE_U8,
        height: 2,
    },
    left: Rectangle {
        x: 0,
        y: 0,
        width: 1,
        height: SCREEN_SIZE_U8,
    },
};

#[macro_export]
macro_rules! default_pong_ball {
    () => {{
        Ball {
            vx: 1,
            vy: 1,
            rect: Rectangle {
                x: 60,
                y: 79,
                width: 2,
                height: 2,
            },
        }
    }};
}

#[macro_export]
macro_rules! new_pong_game {
    () => {{
        let racket_height: u8 = 15;
        let racket_width: u8 = 5;
        PongGame {
            score: Score { p1: 0, p2: 0 },
            update_count: 0,
            palette: 0,
            state: GameState::Idle,
            disable_tone_frames_left: 0,
            disable_palette_change_frame_left: 0,
            ball: default_pong_ball!(),
            p1_racket: Rectangle {
                x: 5,
                y: 45,
                width: racket_width,
                height: racket_height,
            },
            p2_racket: Rectangle {
                x: 150,
                y: 45,
                width: racket_width,
                height: racket_height,
            },
        }
    }};
}

pub enum GameState {
    Idle,
    GameOver {
        is_p1_winner: bool,
    },
    Playing,
    PlayerHasScored {
        wait_frames: u8,
        has_p1_scored: bool,
    },
}

#[derive(Copy, Clone)]
pub struct Ball {
    pub vx: i32,
    pub vy: i32,
    pub rect: Rectangle,
}

#[derive(Default)]
pub struct Score {
    pub p1: u8,
    pub p2: u8,
}

pub struct PongGame {
    pub score: Score,
    pub state: GameState,
    pub ball: Ball,
    pub p1_racket: Rectangle,
    pub p2_racket: Rectangle,
    pub update_count: u8,
    pub disable_tone_frames_left: u8,
    pub disable_palette_change_frame_left: u8,
    pub palette: u8,
}

impl PongGame {
    fn reset_state_for_new_game(&mut self) {
        self.state = GameState::Playing;
        self.score = Score::default();
        self.ball = default_pong_ball!();
    }

    #[inline]
    fn check_game_over(&mut self) -> bool {
        let Score { p1, p2 } = self.score;
        let is_p1_winner = p1 >= WIN_THRESHOLD;

        if is_p1_winner || p2 >= WIN_THRESHOLD {
            self.state = GameState::GameOver { is_p1_winner };

            true
        } else {
            false
        }
    }

    fn game_over_or<F: FnOnce(&mut Self)>(&mut self, or_else: F) {
        let is_game_over = self.check_game_over();

        if !is_game_over {
            or_else(self);
        }
    }

    fn predict_ball_pos(ball: &Ball, racket: &Rectangle) -> u8 {
        let racket_x = racket.x as i32;
        let ball_x = ball.rect.x as i32 + ball.rect.width as i32;
        let ball_y = ball.rect.y as i32;
        let pos = clamp(ball_y + (racket_x - ball_x) as i32 * ball.vx, 0, 255);

        pos as u8
    }

    fn update_racket_pos(racket: &mut Rectangle, y_incr: i32) {
        racket.move_to(
            racket.x,
            clamp(
                (racket.y as i32 + y_incr) as u8,
                GAME_FRAME.top.y + GAME_FRAME.top.height,
                GAME_FRAME.bottom.y - racket.height,
            ),
        );
    }

    fn update_p2_racket_pos(&mut self) {
        let half_screen = (SCREEN_SIZE / 2) as i32;
        let ball_pos = (self.ball.rect.x + self.ball.rect.width) as i32;
        if ball_pos >= half_screen && ball_pos <= (self.p2_racket.x + self.p2_racket.width) as i32 {
            let predicted_pos = Self::predict_ball_pos(&self.ball, &self.p2_racket);

            if !self.p2_racket.is_colliding_y(predicted_pos) {
                if predicted_pos as i32 > half_screen {
                    PongGame::update_racket_pos(&mut self.p2_racket, RACKET_MOVEMENT_SPEED)
                } else {
                    PongGame::update_racket_pos(&mut self.p2_racket, -RACKET_MOVEMENT_SPEED)
                };
            }
        }
    }

    fn update_p1_racket_pos(&mut self, gamepad: u8) {
        if gamepad & BUTTON_UP != 0 {
            PongGame::update_racket_pos(&mut self.p1_racket, -RACKET_MOVEMENT_SPEED);
        } else if gamepad & BUTTON_DOWN != 0 {
            PongGame::update_racket_pos(&mut self.p1_racket, RACKET_MOVEMENT_SPEED)
        }
    }

    #[inline]
    fn update_ball_pos(&mut self) -> CollisionType {
        self.ball.rect.move_by(self.ball.vx, self.ball.vy);
        let mut collision = CollisionType::empty();

        if self.ball.rect.is_colliding_rect(&self.p1_racket) {
            collision |= CollisionType::P1_RACKET;
            self.ball.vx = -self.ball.vx;
        } else if self.ball.rect.is_colliding_rect(&self.p2_racket) {
            collision |= CollisionType::P2_RACKET;
            self.ball.vx = -self.ball.vx;
        }

        if self.ball.rect.is_colliding_rect(&GAME_FRAME.top) {
            collision |= CollisionType::TOP;
            self.ball.vy = -self.ball.vy;
        } else if self.ball.rect.is_colliding_rect(&GAME_FRAME.bottom) {
            collision |= CollisionType::BOTTOM;
            self.ball.vy = -self.ball.vy;
        }

        if self.ball.rect.is_colliding_rect(&GAME_FRAME.right) {
            collision |= CollisionType::RIGHT;
        } else if self.ball.rect.is_colliding_rect(&GAME_FRAME.left) {
            collision |= CollisionType::LEFT;
        }

        if !collision.is_empty() {
            self.ball.rect.move_by(self.ball.vx, self.ball.vy);
        }

        collision
    }

    fn play_tone(&mut self, frequency: u32, volume: u32, duration: u32, flags: u32) {
        if self.disable_tone_frames_left == 0 {
            self.disable_tone_frames_left = MIN_FRAMES_BETWEEN_TONES;
            tone(frequency, volume, duration, flags);
        }
    }

    fn update_palette(&mut self) {
        if self.disable_palette_change_frame_left == 0 {
            self.disable_palette_change_frame_left = MIN_FRAMES_BETWEEN_PALETTE_CHANGE;
            self.palette = self.palette.overflowing_add(1).0;
            change_palette(self.palette);
        }
    }

    fn tick(&mut self, gamepad: u8) {
        self.update_p1_racket_pos(gamepad);
        self.update_p2_racket_pos();
        let collision = self.update_ball_pos();

        if collision.intersects(CollisionType::P1_RACKET) {
            self.play_tone(240, 3, 1, TONE_TRIANGLE);
        } else if collision.intersects(CollisionType::P2_RACKET) {
            self.play_tone(262, 3, 1, TONE_TRIANGLE);
        }

        if collision.intersects(CollisionType::LEFT | CollisionType::RIGHT) {
            let has_p1_scored: bool = collision.intersects(CollisionType::RIGHT);

            if has_p1_scored {
                self.score.p1 += 1;
            } else {
                self.score.p2 += 1;
            }

            self.game_over_or(|pong_game| {
                pong_game.state = GameState::PlayerHasScored {
                    wait_frames: PLAYER_HAS_SCORED_WAIT_FRAMES,
                    has_p1_scored,
                };
            });
        }
    }

    pub fn update(&mut self, gamepad: u8) {
        if self.disable_tone_frames_left > 0 {
            self.disable_tone_frames_left -= 1;
        }

        if self.disable_palette_change_frame_left > 0 {
            self.disable_palette_change_frame_left -= 1;
        }

        if gamepad & BUTTON_2 != 0 {
            self.update_palette();
        }

        match self.state {
            GameState::Playing { .. } => {
                self.game_over_or(|pong_game| pong_game.tick(gamepad));
            }
            GameState::Idle | GameState::GameOver { .. } => {
                if gamepad & BUTTON_1 != 0 {
                    self.reset_state_for_new_game();
                }
            }
            GameState::PlayerHasScored {
                wait_frames,
                has_p1_scored,
            } => {
                self.game_over_or(|pong_game| match wait_frames {
                    0 => {
                        pong_game.state = GameState::Playing;
                        pong_game.ball = default_pong_ball!();
                    }
                    _ => {
                        pong_game.state = GameState::PlayerHasScored {
                            wait_frames: wait_frames - 1,
                            has_p1_scored,
                        };
                    }
                });
            }
        }

        self.draw();
        self.update_count = self.update_count.overflowing_add(1).0;
    }
}

impl Draw for PongGame {
    fn draw(&self) {
        match self.state {
            GameState::Playing { .. } | GameState::PlayerHasScored { .. } => {
                text(
                    num_as_str(self.score.p1),
                    TEXT_SCORE_POSITION.0,
                    TEXT_SCORE_POSITION.1,
                );

                text(
                    num_as_str(self.score.p2),
                    SCREEN_SIZE as i32 - TEXT_SCORE_POSITION.0 - 10,
                    TEXT_SCORE_POSITION.1,
                );

                GAME_FRAME.top.draw();
                GAME_FRAME.bottom.draw();

                for segmented_line in 0..8 {
                    rect(78, segmented_line * 20 + 5, 4, 10);
                }

                self.p1_racket.draw();
                self.p2_racket.draw();
                self.ball.rect.draw();

                if cfg!(feature = "dev_tools") {
                    let pos = Self::predict_ball_pos(&self.ball, &self.p2_racket) as i32;

                    line(0, pos, SCREEN_SIZE as i32, pos);
                }
            }
            GameState::Idle => {
                text("Pong", 65, 20);
                text("Press X to play!", 18, 50);

                text("Controls:", 2, 90);
                text("Up Down move racket", 2, 105);
                text("Z change palette", 2, 115);
            }
            GameState::GameOver { is_p1_winner } => {
                text("Game over", 45, 20);
                let win_text = if is_p1_winner { "P1 won!" } else { "P2 won!" };
                text(win_text, 55, 40);

                text("X to play again!", 18, 70);
            }
        }
    }
}
