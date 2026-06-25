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
    console.log(this.modalElement)
    console.log(this.overlayElement)
    this.modalElement?.classList.add("show");
    this.overlayElement?.classList.add("show");

    this.onOpenCallbacks.forEach(callback => callback(data));
  }

  close = () =>{
    this.modalElement?.classList.remove("show");
    this.overlayElement?.classList.remove("show");
    
    // Run any custom logic registered for when this modal closes
    this.onCloseCallbacks.forEach(callback => callback());
  }

  // Helper to register custom actions (like clearing inputs or loading data)
  onOpen(callback: (data: Task | null) => void) {
    this.onOpenCallbacks.push(callback);
  }

  onClose(callback: () => void) {
    this.onCloseCallbacks.push(callback);
  }
}