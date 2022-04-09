/**
 * Estimates an average value from a sequence, used for estimating things like ping and frame drift.
 */
export class MovingAverage {
    public average = 0;

    private firstUpdate = true;

    constructor (private discount = 0.125) {
    }

    update (value: number) {
        if (this.firstUpdate) {
            this.firstUpdate = false;
            this.average = value;
        } else {
            const discount = this.discount;
            this.average = (1-discount)*this.average + discount*value;
        }
    }
}
