import { ReactiveController, ReactiveControllerHost } from 'lit';
import { deepEqual } from 'fast-equals';
import {
  updateCompletedEventType,
  Wasm4UpdateCompletedEvent,
  Wasm4MemoryView,
} from '../events/update-completed';

interface UpdateControllerState {
  memoryView: Wasm4MemoryView;
  storedValue: string | null;
  fps: number;
}

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
      };

      if (!deepEqual(nextState, this.state)) {
        this.state = nextState;
        this.host.requestUpdate();
      }
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
