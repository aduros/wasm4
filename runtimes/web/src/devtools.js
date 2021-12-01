import { throttle } from 'lodash-es';
import {
  createUpdateCompletedEvent,
  wasm4DevtoolsTagName,
  closeDevtoolsEventType,
} from '@wasm4/web-devtools';
import * as constants from './constants';

class BufferedData {
  mouseButtons = 0;
  gamepads = [0, 0, 0, 0];

  /**
   * @type {(dataView: DataView) => void}
   */
  update = (dataView) => {
    this.mouseButtons =
      this.mouseButtons | dataView.getUint8(constants.ADDR_MOUSE_BUTTONS);

    for (let i = 0, len = this.gamepads; i < len; i++) {
      this.gamepads[i] =
        dataView.getUint8(constants[`ADDR_GAMEPAD${i + 1}`]) | this.gamepads[i];
    }
  };

  /**
   * @type {() => BufferedMemoryData}
   */
  flush = () => {
    const output = {
      mouseButtons: this.mouseButtons,
      gamepads: this.gamepads,
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
  _enabled = false;

  /**
   * @private
   */
  _bufferedData = new BufferedData();

  static enabledByQueryParams() {
    return (
      new URLSearchParams(window.location.search).get(constants.showDevToolsQueryKey) ||
      ''
    ).startsWith('1');
  }

  constructor() {
    window.addEventListener(closeDevtoolsEventType, this.removeDevTools);
  }

  /**
   * @type {(dataView: DataView, deltaFrame: number) => void}
   */
  updateCompleted = (dataView, deltaFrame) => {
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

  /**
   * @type {() => void}
   */
  toggleDevtools = () => {
    this._enabled = !this._enabled;

    const devtoolsRoot = document.getElementById('devtools');

    if (this._enabled) {
      devtoolsRoot.appendChild(document.createElement(wasm4DevtoolsTagName));
    } else {
      while (devtoolsRoot.firstChild) {
        devtoolsRoot.removeChild(devtoolsRoot.firstChild);
      }
    }
  };
  /**
   * @private
   * @type {(dataView: DataView) => void}
   */
  _notifyUpdateCompleted = throttle((dataView, fps) => {
    window.dispatchEvent(
      createUpdateCompletedEvent(dataView, fps, this._bufferedData.flush())
    );
  }, 200);
}
