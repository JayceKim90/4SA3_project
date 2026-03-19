


export interface ISessionMediator {
  notifySessionCreated(sessionId: string): void
  notifySessionUpdated(sessionId: string): void
  notifyParticipantStatusChanged(sessionId: string, participantId: string, status: string): void
  notifyMapViewChanged(bounds: any): void
  registerComponent(name: string, component: any): void
}

type ComponentCallback = (event: string, data: any) => void

export class SessionMediator implements ISessionMediator {
  private components: Map<string, ComponentCallback> = new Map()
  private eventLog: Array<{ event: string; data: any; timestamp: Date }> = []

  registerComponent(name: string, callback: ComponentCallback): void {
    this.components.set(name, callback)

  }

  unregisterComponent(name: string): void {
    this.components.delete(name)

  }

  notifySessionCreated(sessionId: string): void {
    const event = "session:created"
    const data = { sessionId, timestamp: new Date() }

    this.logEvent(event, data)
    this.broadcast(event, data)


    this.broadcast("map:refresh", { reason: "new-session" })
    this.broadcast("list:refresh", { reason: "new-session" })
  }

  notifySessionUpdated(sessionId: string): void {
    const event = "session:updated"
    const data = { sessionId, timestamp: new Date() }

    this.logEvent(event, data)
    this.broadcast(event, data)


    this.broadcast("map:update-marker", { sessionId })
  }

  notifyParticipantStatusChanged(sessionId: string, participantId: string, status: string): void {
    const event = "participant:status-changed"
    const data = { sessionId, participantId, status, timestamp: new Date() }

    this.logEvent(event, data)
    this.broadcast(event, data)


    this.broadcast("session:capacity-changed", { sessionId })
  }

  notifyMapViewChanged(bounds: any): void {
    const event = "map:view-changed"
    const data = { bounds, timestamp: new Date() }

    this.logEvent(event, data)
    this.broadcast(event, data)


    this.broadcast("list:filter-by-bounds", { bounds })
  }

  private broadcast(event: string, data: any): void {


    this.components.forEach((callback, name) => {
      try {
        callback(event, data)
      } catch (error) {
        console.error(`[v0] Mediator: Error in component "${name}"`, error)
      }
    })
  }

  private logEvent(event: string, data: any): void {
    this.eventLog.push({ event, data, timestamp: new Date() })


    if (this.eventLog.length > 100) {
      this.eventLog.shift()
    }
  }

  getEventLog(): Array<{ event: string; data: any; timestamp: Date }> {
    return [...this.eventLog]
  }
}


let mediatorInstance: SessionMediator | null = null

export function getSessionMediator(): SessionMediator {
  if (!mediatorInstance) {
    mediatorInstance = new SessionMediator()
  }
  return mediatorInstance
}
