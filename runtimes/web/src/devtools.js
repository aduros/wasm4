import { throttle } from 'lodash-es';
import { createUpdateCompletedEvent, wasm4DevtoolsTagName, closeDevtoolsEventType } from '@wasm4/web-devtools';


export class DevtoolsManager {
  _enabled = false;

  constructor() {
    window.addEventListener(closeDevtoolsEventType, this.removeDevTools);
  }

  /**
  * @type {(dataView: DataView, deltaFrame: number) => void}
  */
  updateCompleted = (dataView, deltaFrame) => {
    if(this._enabled) {
      const fps = Math.floor(1_000 / deltaFrame);

      this._notifyUpdateCompleted(dataView, fps)
    }
  }

  removeDevTools = () => {
    if(this._enabled) {
      this.toggleDevtools();
    }
  }

  /**
  * @type {() => void}
  */
  toggleDevtools = () => {
    this._enabled = !this._enabled;

    const devtoolsRoot = document.getElementById('devtools');
  
    if(this._enabled) {
      devtoolsRoot.appendChild(document.createElement(wasm4DevtoolsTagName));
    } else {
      while (devtoolsRoot.firstChild) {
        devtoolsRoot.removeChild(devtoolsRoot.firstChild);
      }
    }

  }
  /**
   * @private
  * @type {(dataView: DataView) => void}
  */
  _notifyUpdateCompleted = throttle((dataView, fps) => {
    window.dispatchEvent(createUpdateCompletedEvent(dataView, fps));
  }, 250);
}