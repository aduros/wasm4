module cart;
import w4;

char[8] smiley = {
	0b11000011,
	0b10000001,
	0b00100100,
	0b00100100,
	0b00000000,
	0b00100100,
	0b10011001,
	0b11000011,
};

fn void start() @export("start")
{
}

fn void update() @export("update")
{
	w4::DRAW_COLORS[0] = 2;
	w4::text("Hello from C3", 10, 10);
	if (w4::GAMEPAD1[0] & w4::BUTTON_1)
	{
		w4::DRAW_COLORS[0] = 4;
	}
	w4::blit(&smiley, 76, 76, 8, 8, w4::BLIT_1BPP);
    w4::text("Press X to blink", 16, 90);
}
