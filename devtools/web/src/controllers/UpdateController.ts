import { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  updateCompletedEventType,
  Wasm4UpdateCompletedEvent,
} from '../events/update-completed';
import { MemoryView } from '../models/MemoryView';

export interface UpdateControllerState {
  memoryView: MemoryView;
  storedValue: string | null;
  fps: number;
  wasmBufferByteLen: number;
}

/**
 * Subscribes to `updateCompletedEventType` events and stores
 * the latest `event.detail` inside `this.state`.
 * @see https://lit.dev/docs/composition/controllers/
 */
export class UpdateController implements ReactiveController {
  host: ReactiveControllerHost;
  state: Readonly<UpdateControllerState> | null = null;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  private handleUpdateEvt = ({ detail }: Wasm4UpdateCompletedEvent) => {
    if (detail?.memory) {
      const nextState = {
        memoryView: detail.memory,
        storedValue: detail.storedValue ?? null,
        fps: detail.fps,
        wasmBufferByteLen: detail.wasmBufferByteLen,
      };

      this.state = nextState;
      this.host.requestUpdate();
    }
  };

  hostConnected() {
    window.addEventListener(
      updateCompletedEventType,
      this.handleUpdateEvt as EventListener
    );
  }

  hostDisconnected() {
    window.removeEventListener(
      updateCompletedEventType,
      this.handleUpdateEvt as EventListener
    );
  }
}
