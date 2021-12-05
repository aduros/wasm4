import { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  updateCompletedEventType,
  Wasm4UpdateCompletedEvent,
} from '../events/update-completed';
import { MemoryView } from '../models/MemoryView';

interface UpdateControllerState {
  memoryView: MemoryView;
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
