import { Task } from "../types/Task";

export class Modal {
  private modalElement: HTMLDivElement;
  private overlayElement: HTMLDivElement;
  private onOpenCallbacks: ((data: Task | null) => void)[] = [];
  private onCloseCallbacks: (() => void)[] = [];

  constructor(modalId: string, overlayId: string) {
    this.modalElement = document.getElementById(modalId) as HTMLDivElement;
    this.overlayElement = document.getElementById(overlayId) as HTMLDivElement;

    if (this.overlayElement) {
      this.overlayElement.addEventListener("click", () => this.close());
    }
  }

  open = (data: Task | null =  null) =>{
    this.modalElement?.classList.add("show");
    this.overlayElement?.classList.add("show");

    this.onOpenCallbacks.forEach(callback => callback(data));
  }

  close = () =>{
    this.modalElement?.classList.remove("show");
    this.overlayElement?.classList.remove("show");
    
    this.onCloseCallbacks.forEach(callback => callback());
  }

  onOpen(callback: (data: Task | null) => void) {
    this.onOpenCallbacks.push(callback);
  }

  onClose(callback: () => void) {
    this.onCloseCallbacks.push(callback);
  }
}