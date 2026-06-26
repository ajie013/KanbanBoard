export default class Toast{
    private toastWrapper: HTMLDivElement;
    private toastTitle: HTMLHeadingElement;
    private toastContent: HTMLParagraphElement;
    private toastClose: HTMLButtonElement;
    private toastIcon: HTMLDivElement;

    constructor(toastWrapper: string, toastTitle: string, toastContent: string, toastClose: string, toastIcon: string){
        this.toastWrapper = document.querySelector(toastWrapper) as HTMLDivElement;
        this.toastClose = document.querySelector(toastClose) as HTMLButtonElement;
        this.toastTitle = document.querySelector(toastTitle) as HTMLHeadingElement;
        this.toastContent = document.querySelector(toastContent) as HTMLParagraphElement;
        this.toastIcon = document.querySelector(toastIcon) as HTMLDivElement;

        if(this.toastClose){
            this.toastClose.addEventListener("click", () =>{
                this.toastWrapper.style.display = "none"
                this.toastContent.innerHTML = "";
                this.toastTitle.innerHTML = ""
            })
        }
    }

    showToast = (title: string, content: string, success: boolean) =>{
        this.toastWrapper.style.display = "block"
        this.toastTitle.innerHTML = title;
        this.toastContent.innerHTML = content;
        this.toastIcon.innerHTML = success ? `<i class="fa-solid fa-circle-check " style="color: #2563eb;"></i>` : 
        `<i class="fa-solid fa-circle-xmark " style="color: #ef4444;"></i>`

        setTimeout(() => {
            this.toastWrapper.style.display = "none"
            this.toastContent.innerHTML = "";
            this.toastTitle.innerHTML = ""
        }, 2000);
    }
}