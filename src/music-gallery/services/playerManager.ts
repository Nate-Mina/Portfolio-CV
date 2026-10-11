type ActivePlayerType = 'youtube' | 'suno' | null;

class PlayerManagerService {
  private activePlayer: ActivePlayerType = null;
  private listeners: ((active: ActivePlayerType) => void)[] = [];

  setActivePlayer(player: ActivePlayerType) {
    if (this.activePlayer !== player) {
      this.activePlayer = player;
      this.notifyListeners();
    }
  }

  getActivePlayer(): ActivePlayerType {
    return this.activePlayer;
  }

  subscribe(listener: (active: ActivePlayerType) => void) {
    this.listeners.push(listener);
    listener(this.activePlayer);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.activePlayer);
      } catch (err) {
        console.error('PlayerManager listener error:', err);
      }
    });
  }
}

export const playerManager = new PlayerManagerService();
