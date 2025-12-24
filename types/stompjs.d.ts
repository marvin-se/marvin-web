declare module 'stompjs' {
  export interface Frame {
    command: string
    headers: { [key: string]: string }
    body: string
  }

  export interface Client {
    connected: boolean
    connect(
      headers: { [key: string]: string },
      connectCallback: (frame?: Frame) => void,
      errorCallback?: (error: string | Frame) => void
    ): void
    disconnect(disconnectCallback?: () => void, headers?: { [key: string]: string }): void
    send(destination: string, headers?: { [key: string]: string }, body?: string): void
    subscribe(
      destination: string,
      callback: (message: Frame) => void,
      headers?: { [key: string]: string }
    ): { id: string; unsubscribe: () => void }
    debug: ((...args: string[]) => void) | null
  }

  export function over(socket: WebSocket): Client
}
