const DUTY_CYCLE_LENGTH = 0x800;
const NOISE_LENGTH = 0x8000;

// const NOISE_TABLE = [
//     447443.2 / 44100,
//     223721.6 / 44100,
//     111860.8 / 44100,
//     55930.4 / 44100,
//     27965.2 / 44100,
//     18643.5 / 44100,
//     13982.6 / 44100,
//     11186.1 / 44100,
//     8860.3 / 44100,
//     7046.3 / 44100,
//     4709.9 / 44100,
//     3523.2 / 44100,
//     2348.8 / 44100,
//     1761.6 / 44100,
//     879.9 / 44100,
//     440.0 / 44100,
// ].reverse();

class Channel {
    constructor (ctx, node) {
        this.node = node;
        this.gainLevel = 1;

        const gain = ctx.createGain();
        this.gain = gain;

        gain.gain.value = 0;
        gain.connect(ctx.destination);

        node.connect(gain);
        node.start(0);
    }

    setEnvelope (currentTime, sustainLevel, attack, decay, sustain, release) {
        const peakLevel = this.gainLevel * 2*sustainLevel;
        sustainLevel *= this.gainLevel;

        const gainValue = this.gain.gain;
        gainValue.cancelScheduledValues(0);
        gainValue.value = 0;
        gainValue.linearRampToValueAtTime(peakLevel, currentTime+attack);
        gainValue.linearRampToValueAtTime(sustainLevel, currentTime+attack+decay);
        gainValue.linearRampToValueAtTime(sustainLevel, currentTime+attack+decay+sustain);
        gainValue.linearRampToValueAtTime(0, currentTime+attack+decay+sustain+release);
    }
}

class OscillatorChannel extends Channel {
    constructor (ctx) {
        super(ctx, ctx.createOscillator());
    }

    setFrequency (currentTime, freq1, freq2, duration) {
        const frequencyValue = this.node.frequency;
        frequencyValue.cancelScheduledValues(0);
        frequencyValue.value = freq1;
        if (freq2) {
            frequencyValue.linearRampToValueAtTime(freq2, currentTime + duration);
        }
    }
}

class NoiseChannel extends Channel {
    constructor (ctx) {
        const node = ctx.createBufferSource();
        super(ctx, node);

        const buffer = ctx.createBuffer(1, NOISE_LENGTH, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let seed = 0x0001;
        for (let ii = 0; ii < NOISE_LENGTH; ++ii) {
            const bit0 = seed & 1;
            seed >>= 1;
            const bit1 = seed & 1;
            const feedback = (bit0 ^ bit1);
            seed |= feedback << 14;
            data[ii] = feedback;
        }

        node.buffer = buffer;
        node.loop = true;
    }

    setFrequency (currentTime, freq1, freq2, duration) {
        const playbackRate = this.node.playbackRate;
        playbackRate.cancelScheduledValues(0);
        playbackRate.value = freq1*freq1/1000000;
        // playbackRate.value = NOISE_TABLE[16*(freq1/1024) | 0];
        if (freq2) {
            playbackRate.linearRampToValueAtTime(freq2*freq2/1000000, currentTime + duration);
        }
    }
}

function createDutyCycle (ctx, pulseWidth) {
    const real = new Float32Array(DUTY_CYCLE_LENGTH);
    for (let ii = 1; ii < DUTY_CYCLE_LENGTH; ii++) {
        real[ii] = 4 / (ii * Math.PI) * Math.sin(Math.PI * ii * pulseWidth);
    }
    return ctx.createPeriodicWave(real, new Float32Array(DUTY_CYCLE_LENGTH));
}

export class APU {
    constructor () {
        const ctx = new AudioContext();
        this.ctx = ctx;

        const pulse1 = new OscillatorChannel(ctx);
        pulse1.gainLevel = 0.5;

        const pulse2 = new OscillatorChannel(ctx);
        pulse2.gainLevel = 0.5;

        const triangle = new OscillatorChannel(ctx);
        triangle.node.type = "triangle";

        const noise = new NoiseChannel(ctx);

        this.channels = [pulse1, pulse2, triangle, noise];

        const duty25 = createDutyCycle(ctx, 0.25);
        this.pulseDutyCycles = [
            createDutyCycle(ctx, 0.125),
            duty25,
            createDutyCycle(ctx, 0.5),
            duty25, // 75 is the same as 25
        ];
    }

    tone (frequency, duration, volume, flags) {
        const channelIdx = flags & 0x3;
        const mode = (flags >> 2) & 0x3;

        const freq1 = frequency & 0xffff;
        const freq2 = (frequency >> 16) & 0xffff;

        const sustain = (duration & 0xff) / 60;
        const release = ((duration >> 8) & 0xff) / 60;
        const decay = ((duration >> 16) & 0xff) / 60;
        const attack = ((duration >> 24) & 0xff) / 60;

        const currentTime = this.ctx.currentTime;

        const channel = this.channels[channelIdx];
        if (channelIdx == 0 || channelIdx == 1) {
            const wave = this.pulseDutyCycles[mode];
            channel.node.setPeriodicWave(wave);
        }
        channel.setFrequency(currentTime, freq1, freq2, attack+decay+sustain+release);
        channel.setEnvelope(currentTime, volume/100, attack, decay, sustain, release);
    }
}
