import { throttle } from 'lodash-es';
import { createUpdateCompletedEvent } from './events/update-completed';
import { closeDevtoolsEventType } from './events/close-devtools';
import { wasm4DevtoolsTagName } from './components/devtools/devtools';
import * as constants from './constants';

interface BufferedData {
  mouseButtons: number;
  gamepads: number[];
}

class BufferedRuntimeData implements BufferedData {
  mouseButtons = 0;
  gamepads = [0, 0, 0, 0];

  update = (dataView: DataView): void => {
    this.mouseButtons =
      this.mouseButtons | dataView.getUint8(constants.ADDR_MOUSE_BUTTONS);

    for (let i = 0, len = this.gamepads.length; i < len; i++) {
      this.gamepads[i] =
        dataView.getUint8(
          (constants as Record<string, any>)[`ADDR_GAMEPAD${i + 1}`]
        ) | this.gamepads[i];
    }
  };

  /**
   * Returns buffered that and resets current state.
   * @returns
   */
  flush = (): BufferedData => {
    const output = {
      mouseButtons: this.mouseButtons,
      gamepads: this.gamepads.slice(),
    };

    this.mouseButtons = 0;
    this.gamepads.fill(0);

    return output;
  };
}

export class DevtoolsManager {
  /**
   * @private
   */
  private _enabled = false;

  /**
   * @private
   */
  private _bufferedData = new BufferedRuntimeData();

  /**
   * Notifies the devtools that the web runtime has completed an update.
   */
  updateCompleted = (dataView: DataView, deltaFrame: number) => {
    if (this._enabled) {
      const fps = Math.floor(1_000 / deltaFrame);
      this._bufferedData.update(dataView);
      this._notifyUpdateCompleted(dataView, fps);
    }
  };

  removeDevTools = () => {
    if (this._enabled) {
      this.toggleDevtools();
    }
  };

  toggleDevtools = () => {
    this._enabled = !this._enabled;

    if (this._enabled) {
      window.addEventListener(closeDevtoolsEventType, this.removeDevTools);
      document.body.appendChild(document.createElement(wasm4DevtoolsTagName));
    } else {
      window.removeEventListener(closeDevtoolsEventType, this.removeDevTools);
      Array.from(document.body.querySelectorAll(wasm4DevtoolsTagName)).forEach(
        (elem) => {
          elem?.parentElement?.removeChild(elem);
        }
      );
    }
  };

  private _notifyUpdateCompleted = throttle(
    (dataView: DataView, fps: number) => {
      window.dispatchEvent(
        createUpdateCompletedEvent(dataView, fps, this._bufferedData.flush())
      );
    },
    200
  );
}
